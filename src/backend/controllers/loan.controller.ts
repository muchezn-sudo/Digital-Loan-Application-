import { Response } from "express";
import { AuthenticatedRequest } from "../middleware/auth";
import { LoanCalculatorService } from "../services/loanCalculator.service";
import { CreditScoringService } from "../services/credit.service";
import { GeminiService } from "../services/gemini.service";
import { NotificationService } from "../services/notification.service";
import { AuditLogService } from "../services/audit.service";
import { createLogger } from "../config/logger";

const log = createLogger("LoanController");
const calc = new LoanCalculatorService();
const scorer = new CreditScoringService();
const gemini = new GeminiService();
const notify = new NotificationService();
const audit = new AuditLogService();

export class LoanController {
  /**
   * POST /api/loan/calculate
   * Comprehensive Amortization EMI math formulation engine
   */
  public async calculateLoan(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const { amount, interestRate, termMonths } = req.body;

      if (!amount || !interestRate || !termMonths) {
        res.status(400).json({ error: "Missing calculation parameters. Specify amount, interestRate, and termMonths." });
        return;
      }

      log.info(`Computing loan amortization schedules for amount: KSh ${amount} at ${interestRate}% for ${termMonths} months.`);
      const result = calc.calculateLoan(Number(amount), Number(interestRate), Number(termMonths));

      res.status(200).json(result);
    } catch (err: any) {
      log.error("Calculation formula crashed", { error: err.message });
      res.status(500).json({ error: "Amortization formula engine breakdown." });
    }
  }

  /**
   * POST /api/loan/apply
   * Triggers the credit screening process and AI models risk profiling rules matrix
   */
  public async applyForLoan(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const { requestedAmount, requestedTermMonths, monthlyIncome, monthlyDebt, employmentStatus, employmentDurationMonths } = req.body;
      const applicantId = req.user?.id || "usr_anonymous";
      const applicantEmail = req.user?.email || "anonymous@veriloan.com";

      if (!requestedAmount || !requestedTermMonths || !monthlyIncome) {
        res.status(400).json({ error: "Incomplete details. Income constraints require monthlyIncome and requested funds." });
        return;
      }

      log.info(`Initiating digital application process for applicant ${applicantId}. Requested: KSh ${requestedAmount}`);

      // 1. Core Credit Scoring Simulation Rules Assessment
      const creditScoreResult = scorer.evaluateApplicant(
        Number(monthlyIncome),
        Number(monthlyDebt || 0),
        Number(employmentDurationMonths || 0),
        Number(requestedAmount),
        Number(requestedTermMonths)
      );

      // 2. Gemini Credit Underwriter Assistant Evaluation (With secure static fallback)
      const isDevMode = process.env.NODE_ENV !== "production";
      const aiAssessment = await gemini.analyzeRisk({
        applicantName: req.user?.email || "Stated Applicant",
        monthlyIncome: Number(monthlyIncome),
        monthlyDebt: Number(monthlyDebt || 0),
        employmentStatus: employmentStatus || "FULL_TIME",
        employmentDurationMonths: Number(employmentDurationMonths || 24),
        requestedAmount: Number(requestedAmount),
        tenureMonths: Number(requestedTermMonths),
        creditScore: creditScoreResult.score
      });

      // 3. Routing matrix depending on credit assessment risks
      // Low risk - Single tier Officer path
      // Medium risk - Dual tier Officer + Manager path
      // High risk - Mandatory Manager review path
      let workflowRoute = "MANUAL_REVIEWS";
      if (aiAssessment.riskRating === "Low") {
        workflowRoute = "OFFICER_Review_ONLY";
      } else if (aiAssessment.riskRating === "Medium") {
        workflowRoute = "OFFICER_AND_MANAGER_REVIEWS";
      } else {
        workflowRoute = "MANDATORY_MANAGER_OVERRIDE";
      }

      const mockLoanApplication = {
        applicationId: `app_${Math.random().toString(36).substr(2, 9)}`,
        applicantId,
        requestedAmount: Number(requestedAmount),
        requestedTermMonths: Number(requestedTermMonths),
        calculatedScore: creditScoreResult.score,
        calculatedGrade: creditScoreResult.grade,
        riskLevel: aiAssessment.riskRating,
        status: "AI_ASSESSED",
        workflowChannel: workflowRoute,
        underwriterRecommendation: aiAssessment.recommendationDecision,
        riskExplanation: aiAssessment.detailedNotes,
        fraudChecks: aiAssessment.fraudIndicators,
        submittedAt: new Date().toISOString()
      };

      // 4. Log transactions
      audit.logAction({
        userId: applicantId,
        userEmail: applicantEmail,
        action: "LOAN_APPLICATION_SUBMITTED",
        entityType: "LOAN_APPLICATION",
        entityId: mockLoanApplication.applicationId,
        ipAddress: req.ip,
        details: `Submitted a KSh ${requestedAmount} loan request. Core credit score computed: ${creditScoreResult.score}. Gemini risk rating: ${aiAssessment.riskRating}.`
      });

      // 5. Send Notification
      await notify.sendNotification({
        userId: applicantId,
        title: "Loan Portfolio Received",
        message: `Your loan profile application for KSh ${requestedAmount} has been computed. Our AI Underwriter assessed profile as ${aiAssessment.riskRating} risk. Ready for reviewer action.`
      });

      res.status(201).json({
        message: "Application processed and scored successfully",
        application: mockLoanApplication,
        decisionGuideline: creditScoreResult.recommendation
      });
    } catch (err: any) {
      log.error("Failed to commit loan application profile", { error: err.message });
      res.status(500).json({ error: "Failed to parse credit risk scoring matrix during application storage" });
    }
  }

  /**
   * POST /api/loan/approve
   * Allows Officer / Manager reviews matching risk matrix credentials
   */
  public async performReview(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const { applicationId, decision, comments } = req.body;
      const reviewerId = req.user?.id || "usr_reviewer";
      const reviewerRole = req.user?.role || "LOAN_OFFICER";

      if (!applicationId || !decision) {
        res.status(400).json({ error: "Missing review feedback data. Requires applicationId and decision." });
        return;
      }

      audit.logAction({
        userId: reviewerId,
        userEmail: req.user?.email || "reviewer@veriloan.com",
        action: "LOAN_DECISION_SUBMITTED",
        entityType: "LOAN_APPLICATION",
        entityId: applicationId,
        ipAddress: req.ip,
        details: `Reviewer with authority ${reviewerRole} logged decision: ${decision}. Notes: ${comments || "none"}`
      });

      res.status(200).json({
        message: "Assessment decision saved successfully",
        decisionRecord: {
          id: `approval_${Math.random().toString(36).substr(2, 9)}`,
          applicationId,
          reviewerId,
          reviewerRole,
          decision,
          comments,
          timestamp: new Date().toISOString()
        }
      });
    } catch (err: any) {
      log.error("Review action error", { error: err.message });
      res.status(500).json({ error: "Failed to transmit reviewer action parameters." });
    }
  }
}
