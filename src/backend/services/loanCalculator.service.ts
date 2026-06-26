export interface AmortizationPayment {
  month: number;
  payment: number;
  principal: number;
  interest: number;
  remainingBalance: number;
}

export interface CalculationResult {
  monthlyPayment: number;
  totalInterest: number;
  totalRepayment: number;
  amortizationSchedule: AmortizationPayment[];
}

export class LoanCalculatorService {
  /**
   * Calculates monthly payment (EMI), interest totals, and full amortization schedule
   * EMI Formula: P * r * (1 + r)^n / ((1 + r)^n - 1)
   */
  public calculateLoan(amount: number, annualInterestRate: number, termMonths: number): CalculationResult {
    const principal = amount;
    const monthlyRate = (annualInterestRate / 100) / 12;
    const totalPayments = termMonths;

    let monthlyPayment = 0;
    
    if (monthlyRate === 0) {
      monthlyPayment = principal / totalPayments;
    } else {
      monthlyPayment = (principal * monthlyRate * Math.pow(1 + monthlyRate, totalPayments)) / 
                       (Math.pow(1 + monthlyRate, totalPayments) - 1);
    }

    // Round to 2 decimal places
    monthlyPayment = Math.round(monthlyPayment * 100) / 100;

    let remainingBalance = principal;
    const amortizationSchedule: AmortizationPayment[] = [];
    let totalInterest = 0;

    for (let month = 1; month <= totalPayments; month++) {
      let interestForMonth = remainingBalance * monthlyRate;
      interestForMonth = Math.round(interestForMonth * 100) / 100;
      
      let principalForMonth = monthlyPayment - interestForMonth;
      principalForMonth = Math.round(principalForMonth * 100) / 100;

      // Handle precision adjustments on last payment
      if (month === totalPayments) {
        principalForMonth = remainingBalance;
        monthlyPayment = principalForMonth + interestForMonth;
        monthlyPayment = Math.round(monthlyPayment * 100) / 100;
        remainingBalance = 0;
      } else {
        remainingBalance -= principalForMonth;
        remainingBalance = Math.round(remainingBalance * 100) / 100;
      }

      totalInterest += interestForMonth;

      amortizationSchedule.push({
        month,
        payment: monthlyPayment,
        principal: principalForMonth,
        interest: interestForMonth,
        remainingBalance: Math.max(0, remainingBalance)
      });
    }

    totalInterest = Math.round(totalInterest * 100) / 100;
    const totalRepayment = Math.round((principal + totalInterest) * 100) / 100;

    return {
      monthlyPayment,
      totalInterest,
      totalRepayment,
      amortizationSchedule
    };
  }

  /**
   * Helper function to compute Debt-to-Income (DTI) ratio
   */
  public calculateDti(monthlyDebt: number, monthlyIncome: number): number {
    if (monthlyIncome <= 0) return 100;
    const ratio = (monthlyDebt / monthlyIncome) * 100;
    return Math.round(ratio * 100) / 100;
  }
}
