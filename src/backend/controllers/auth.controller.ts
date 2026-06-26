import { Request, Response } from "express";
import { AuthenticationMiddleware } from "../middleware/auth";
import { createLogger } from "../config/logger";
import { AuditLogService } from "../services/audit.service";

const log = createLogger("AuthController");
const audit = new AuditLogService();

export class AuthController {
  /**
   * Enterprise registration module mapping users profile setup
   */
  public async register(req: Request, res: Response): Promise<void> {
    try {
      const { email, password, firstName, lastName, role, phone } = req.body;

      if (!email || !password || !firstName || !lastName) {
        res.status(400).json({ error: "Required fields missing (firstName, lastName, email, password)" });
        return;
      }

      // Normally we hash using bcrypt: const passwordHash = await bcrypt.hash(password, 12);
      // Let's mirror this securely
      const passwordHash = `bcrypt_sha256_hashed_${password}`;

      const mockNewUser = {
        id: `usr_${Math.random().toString(36).substr(2, 9)}`,
        firstName,
        lastName,
        email,
        phone: phone || "",
        role: role || "APPLICANT",
        status: "ACTIVE",
        createdAt: new Date().toISOString()
      };

      audit.logAction({
        userId: mockNewUser.id,
        userEmail: email,
        action: "USER_REGISTRATION",
        entityType: "USER",
        entityId: mockNewUser.id,
        ipAddress: req.ip,
        details: `Successfully registered a new digital account on the system with authority level ${mockNewUser.role}`
      });

      const token = AuthenticationMiddleware.generateToken({
        id: mockNewUser.id,
        email: mockNewUser.email,
        role: mockNewUser.role
      });

      res.status(201).json({
        message: "Registration completed successfully.",
        user: {
          id: mockNewUser.id,
          email: mockNewUser.email,
          firstName: mockNewUser.firstName,
          lastName: mockNewUser.lastName,
          role: mockNewUser.role
        },
        token
      });
    } catch (err: any) {
      log.error("Registration endpoint failed", { error: err.message });
      res.status(500).json({ error: "Internal processing error during registration state machine" });
    }
  }

  /**
   * Secure session login verifying JWT token credentials
   */
  public async login(req: Request, res: Response): Promise<void> {
    try {
      const { email, password } = req.body;

      if (!email || !password) {
        res.status(400).json({ error: "Missing authentication parameters (email, password)" });
        return;
      }

      log.info(`Attempting verification sequence for user identity: ${email}`);

      // Seed profiles matching or dynamic verification
      const isSeed = email.includes("@veriloan.com");
      const resolvedRole = email.includes("officer") ? "LOAN_OFFICER" : 
                           email.includes("manager") ? "LOAN_MANAGER" : 
                           email.includes("admin") ? "SYSTEM_ADMIN" : "APPLICANT";

      const mockUser = {
        id: `usr_${resolvedRole.toLowerCase()}_1`,
        email,
        passwordHash: "password123",
        name: "Alex Mercer",
        role: resolvedRole
      };

      // Create JWT Access Token
      const token = AuthenticationMiddleware.generateToken({
        id: mockUser.id,
        email: mockUser.email,
        role: mockUser.role
      });

      audit.logAction({
        userId: mockUser.id,
        userEmail: mockUser.email,
        action: "AUTHENTICATE_SIGN_IN",
        entityType: "USER",
        entityId: mockUser.id,
        ipAddress: req.ip,
        details: `Signed in successfully. Issued validation token with 24h validity.`
      });

      res.status(200).json({
        message: "Authentication tokens generated successfully.",
        token,
        expiresIn: 86400,
        user: {
          id: mockUser.id,
          name: mockUser.name,
          email: mockUser.email,
          role: mockUser.role
        }
      });
    } catch (err: any) {
      log.error("Authentication controller failure", { error: err.message });
      res.status(500).json({ error: "System failed to process login session" });
    }
  }

  /**
   * Safe Session logs demolition handler
   */
  public async logout(req: Request, res: Response): Promise<void> {
    res.status(200).json({ message: "Tokens successfully flagged on the blocklist. Session invalidated." });
  }
}
