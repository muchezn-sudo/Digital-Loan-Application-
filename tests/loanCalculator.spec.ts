import { LoanCalculatorService } from "../src/backend/services/loanCalculator.service";
import { CreditScoringService } from "../src/backend/services/credit.service";

describe("LoanCalculatorService & Amortization Math", () => {
  let calculator: LoanCalculatorService;

  beforeEach(() => {
    calculator = new LoanCalculatorService();
  });

  test("Should accurately calculate EMI monthly installments on basic terms", () => {
    const amount = 10000;
    const interestRate = 12; // 12% annual rate
    const termMonths = 12;

    const result = calculator.calculateLoan(amount, interestRate, termMonths);

    // Expected EMI is $888.49
    expect(result.monthlyPayment).toBeCloseTo(888.49, 1);
    expect(result.totalRepayment).toBeGreaterThan(amount);
    expect(result.totalInterest).toBeCloseTo(661.85, 1);
    expect(result.amortizationSchedule.length).toBe(12);
  });

  test("Should gracefully handle interest-free loans", () => {
    const amount = 5000;
    const interestRate = 0; // 0% interest
    const termMonths = 10;

    const result = calculator.calculateLoan(amount, interestRate, termMonths);

    expect(result.monthlyPayment).toBe(500);
    expect(result.totalInterest).toBe(0);
    expect(result.totalRepayment).toBe(amount);
    expect(result.amortizationSchedule[9].remainingBalance).toBe(0);
  });

  test("Should properly evaluate standard Debt-to-Income ratios", () => {
    const monthlyDebt = 1500;
    const monthlyIncome = 5000;

    const dti = calculator.calculateDti(monthlyDebt, monthlyIncome);
    expect(dti).toBe(30); // 30% ratio
  });
});

describe("CreditScoringService Underwriter Decisions", () => {
  let scorer: CreditScoringService;

  beforeEach(() => {
    scorer = new CreditScoringService();
  });

  test("Should score low-leverage, well-employed candidate with high tier", () => {
    const result = scorer.evaluateApplicant(
      8000,   // Income
      500,    // Debt
      60,     // 5 years employment
      10000,  // Stated request
      24      // term months
    );

    expect(result.score).toBeGreaterThanOrEqual(750);
    expect(result.grade).toBe("Excellent");
    expect(result.recommendation).toContain("Fast-track");
  });

  test("Should categorize heavy-leverage, short tenure profile as High Risk", () => {
    const result = scorer.evaluateApplicant(
      2000,   // Income
      1200,   // High debt
      3,      // 3 months employment
      30000,  // Massive request
      12      // term months
    );

    expect(result.score).toBeLessThanOrEqual(550);
    expect(result.grade).toBe("High Risk");
  });
});
