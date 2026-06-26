import { createLogger } from "../config/logger";

const log = createLogger("AuditLogService");

export interface AuditLogPayload {
  userId?: string;
  userEmail?: string;
  action: string;
  entityType: string;
  entityId?: string;
  ipAddress?: string;
  details: string;
}

export class AuditLogService {
  /**
   * Automatically commits secure auditing traces on financial actions
   */
  public logAction(payload: AuditLogPayload): void {
    const timestamp = new Date().toISOString();
    log.info(`[AUDIT TRACE] User: ${payload.userEmail || "SYSTEM_DAEMON"} | Action: ${payload.action} | Entity: ${payload.entityType} (${payload.entityId || "N/A"})`, {
      details: payload.details,
      ip: payload.ipAddress || "::1"
    });
  }
}
