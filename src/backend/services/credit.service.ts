export interface CreditScoreResult {
  score: number;
  grade: "Excellent" | "Good" | "Moderate" | "High Risk";
  recommendation: string;
  factors: {
    dtiScore: number;
    employmentScore: number;
    incomeBufferScore: number;
    leverageScore: number;
  };
}

export class CreditScoringService {
  /**
   * Generates a calibrated credit score (300 to 850) based on multiple underwriter parameters.
   */
  public evaluateApplicant(
    monthlyIncome: number,
    monthlyDebt: number,
    employmentDurationMonths: number,
    requestedAmount: number,
    requestedTermMonths: number
  ): CreditScoreResult {
    // 1. Debt-To-Income (DTI) Ratio Component (Max 250 points)
    const dti = monthlyIncome > 0 ? (monthlyDebt / monthlyIncome) * 100 : 100;
    let dtiScore = 0;
    if (dti < 20) {
      dtiScore = 250;
    } else if (dti >= 20 && dti < 35) {
      dtiScore = 200;
    } else if (dti >= 35 && dti < 50) {
      dtiScore = 120;
    } else {
      dtiScore = 40; // High risk above 50%
    }

    // 2. Employment Stability Duration Component (Max 200 points)
    let employmentScore = 0;
    if (employmentDurationMonths >= 60) {
      employmentScore = 200; // 5+ years
    } else if (employmentDurationMonths >= 24) {
      employmentScore = 160; // 2-5 years
    } else if (employmentDurationMonths >= 12) {
      employmentScore = 110; // 1-2 years
    } else if (employmentDurationMonths > 0) {
      employmentScore = 50;  // > 0
    } else {
      employmentScore = 0;   // Unemployed or temporary
    }

    // 3. Income Margin / Buffer Safety Component (Max 200 points)
    const netDisposable = monthlyIncome - monthlyDebt;
    const proposedEmi = requestedAmount / requestedTermMonths;
    const incomeBufferRatio = proposedEmi > 0 ? netDisposable / proposedEmi : 0;

    let incomeBufferScore = 0;
    if (incomeBufferRatio >= 3.0) {
      incomeBufferScore = 200;
    } else if (incomeBufferRatio >= 2.0) {
      incomeBufferScore = 160;
    } else if (incomeBufferRatio >= 1.2) {
      incomeBufferScore = 100;
    } else {
      incomeBufferScore = 30; // Very tight margins
    }

    // 4. Leverage Ratio: Requested Amount relative to Annualized Disposable Income (Max 200 points)
    const annualDisposable = Math.max(12000, netDisposable * 12);
    const leverageRatio = requestedAmount / annualDisposable;

    let leverageScore = 0;
    if (leverageRatio <= 0.25) {
      leverageScore = 200;
    } else if (leverageRatio <= 0.5) {
      leverageScore = 150;
    } else if (leverageRatio <= 1.0) {
      leverageScore = 90;
    } else {
      leverageScore = 20; // High borrowing leverage
    }

    // Base score is 300, max is 850 (Adds up component points out of 850 total potential score)
    const rawSum = dtiScore + employmentScore + incomeBufferScore + leverageScore;
    const scaledScore = Math.min(850, 300 + Math.round((rawSum / 850) * 550));

    // Map score boundaries to official grades and recommendations
    let grade: "Excellent" | "Good" | "Moderate" | "High Risk" = "High Risk";
    let recommendation = "";

    if (scaledScore >= 750) {
      grade = "Excellent";
      recommendation = "Highly recommended for fast-track automated approval. Candidate exhibits supreme liquidity and strong repayment guarantees.";
    } else if (scaledScore >= 660) {
      grade = "Good";
      recommendation = "Approved with optimal parameters. Minor risk points identified but secured by healthy disposable buffer and sustained employment track record.";
    } else if (scaledScore >= 580) {
      grade = "Moderate";
      recommendation = "Requires manual verification by a Loan Officer. Repayment depends on strict verification of financial disclosures and secure employment letters.";
    } else {
      grade = "High Risk";
      recommendation = "Decline or high-risk manual review. Low credit scoring resulting from high leverage or excessive debt-to-income margins.";
    }

    return {
      score: scaledScore,
      grade,
      recommendation,
      factors: {
        dtiScore,
        employmentScore,
        incomeBufferScore,
        leverageScore
      }
    };
  }
}
