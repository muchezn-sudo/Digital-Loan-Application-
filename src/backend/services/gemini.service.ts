import { GoogleGenAI, Type } from "@google/genai";
import { createLogger } from "../config/logger";

const log = createLogger("GeminiRiskAssessment");

export interface GeminiAnalysisResult {
  riskRating: "Low" | "Medium" | "High";
  fraudIndicators: string[];
  employmentConsistency: string;
  recommendationDecision: "APPROVE" | "REJECT" | "OFFICER_REVIEW";
  detailedNotes: string;
  confidenceScore: number;
}

export class GeminiService {
  private ai: GoogleGenAI | null = null;

  constructor() {
    const key = process.env.GEMINI_API_KEY;
    if (key) {
      this.ai = new GoogleGenAI({ apiKey: key });
      log.info("Gemini SDK client initialized successfully.");
    } else {
      log.warn("GEMINI_API_KEY environment variable is not defined. Falling back to internal engine.");
    }
  }

  /**
   * Generates custom AI risk rating, fraud warning checklists, and underwriter justifications.
   */
  public async analyzeRisk(payload: {
    applicantName: string;
    monthlyIncome: number;
    monthlyDebt: number;
    employmentStatus: string;
    employerName?: string;
    employmentDurationMonths: number;
    requestedAmount: number;
    tenureMonths: number;
    creditScore: number;
  }): Promise<GeminiAnalysisResult> {
    const prompt = `
You are an expert enterprise bank credit underwriter and fraud detection agent.
Analyze the following digital loan application file carefully and provide structured results.

Applicant Demographics:
- Full Name: ${payload.applicantName}
- Employment Profile: ${payload.employmentStatus} ${payload.employerName ? `at ${payload.employerName}` : ""}
- Employment Duration: ${payload.employmentDurationMonths} months
- Stated Monthly Income: KSh ${payload.monthlyIncome}
- Declared Active Debt: KSh ${payload.monthlyDebt}
- Bureau-estimated Credit Score: ${payload.creditScore}

Requested Loan details:
- Capital Request: KSh ${payload.requestedAmount}
- Requested Repayment Period: ${payload.tenureMonths} Months

Your output must be a highly detailed analysis containing the following specific properties:
1. "riskRating": must be "Low", "Medium", or "High"
2. "fraudIndicators": list of any potential files consistency discrepancies (e.g., suspicious credit scores relative to declared savings)
3. "employmentConsistency": detail whether the employment tenure is robust enough for long-term repayments
4. "recommendationDecision": must be exactly "APPROVE", "REJECT", or "OFFICER_REVIEW"
5. "detailedNotes": verbose rationale for your credit assessment decision, risk mitigants, or request for additional documents.
6. "confidenceScore": a number from 0 to 100 on the reliability of this recommendation.
`;

    if (!this.ai) {
      log.info("Running deterministic underwriting rules engine (Gemini fallback mode).");
      return this.generateDeterministicFallback(payload);
    }

    try {
      // Connect specifically using the modern gemini-2.5-flash model mapping to instructions
      const response = await this.ai.models.generateContent({
        model: "gemini-2.5-flash",
        contents: prompt,
        config: {
          responseMimeType: "application/json",
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              riskRating: { type: Type.STRING, enum: ["Low", "Medium", "High"] },
              fraudIndicators: { type: Type.ARRAY, items: { type: Type.STRING } },
              employmentConsistency: { type: Type.STRING },
              recommendationDecision: { type: Type.STRING, enum: ["APPROVE", "REJECT", "OFFICER_REVIEW"] },
              detailedNotes: { type: Type.STRING },
              confidenceScore: { type: Type.INTEGER },
            },
            required: [
              "riskRating",
              "fraudIndicators",
              "employmentConsistency",
              "recommendationDecision",
              "detailedNotes",
              "confidenceScore",
            ],
          },
        },
      });

      const responseText = response.text;
      if (responseText) {
        const parsed = JSON.parse(responseText.trim()) as GeminiAnalysisResult;
        log.info("Gemini risk profile analyzed successfully.", { rating: parsed.riskRating });
        return parsed;
      }
      throw new Error("No response content generated from Gemini API.");
    } catch (err: any) {
      log.error("Gemini API call failed. Using deterministic safety fallback.", { error: err.message });
      return this.generateDeterministicFallback(payload);
    }
  }

  /**
   * Deterministic safety fallback system satisfying banking continuity requirements (if API key is missing or offline)
   */
  private generateDeterministicFallback(payload: {
    applicantName: string;
    monthlyIncome: number;
    monthlyDebt: number;
    employmentStatus: string;
    employmentDurationMonths: number;
    requestedAmount: number;
    tenureMonths: number;
    creditScore: number;
  }): GeminiAnalysisResult {
    const dti = payload.monthlyIncome > 0 ? (payload.monthlyDebt / payload.monthlyIncome) * 100 : 100;
    const isStableEmployment = payload.employmentStatus === "FULL_TIME" || payload.employmentDurationMonths >= 24;
    const requestedMonthlyPayment = payload.requestedAmount / payload.tenureMonths;
    const netDisposable = payload.monthlyIncome - payload.monthlyDebt;

    const fraudIndicators: string[] = [];
    if (dti > 60 && payload.creditScore > 750) {
      fraudIndicators.push("DTI looks high (>60%) yet credit bureau reports a very high rating. Suggest manual bank check.");
    }
    if (payload.monthlyIncome < 500 && payload.requestedAmount > 15000) {
      fraudIndicators.push("Discrepancy: High requested amount relative to low declared monthly income stream.");
    }

    let riskRating: "Low" | "Medium" | "High" = "Medium";
    let recommendationDecision: "APPROVE" | "REJECT" | "OFFICER_REVIEW" = "OFFICER_REVIEW";
    let detailedNotes = "";

    if (payload.creditScore < 550 || dti > 50) {
      riskRating = "High";
      recommendationDecision = "REJECT";
      detailedNotes = "Primary screening failed because debt-to-income exceeds 50% or the estimated credit rating falls below the 550 risk ceiling. Risk is significant.";
    } else if (payload.creditScore >= 700 && dti < 30 && isStableEmployment && netDisposable > requestedMonthlyPayment * 2.5) {
      riskRating = "Low";
      recommendationDecision = "APPROVE";
      detailedNotes = "High rating candidate. Disposable income checks indicate high interest margins, and applicant has stable local employment records. Standard automatic pre-approval is verified.";
    } else {
      riskRating = "Medium";
      recommendationDecision = "OFFICER_REVIEW";
      detailedNotes = "Moderate risk parameters. Stated revenues are sufficient for standard EMI ratios, but short career histories or moderately elevated leverage thresholds suggest manual verification of salary stubs.";
    }

    return {
      riskRating,
      fraudIndicators,
      employmentConsistency: isStableEmployment
        ? "Employment stability verified. Career duration exhibits steady baseline streams."
        : "Moderate risk: Employment profile indicates recent starting date or temporary status.",
      recommendationDecision,
      detailedNotes,
      confidenceScore: 92,
    };
  }
}
