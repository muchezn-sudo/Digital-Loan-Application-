export interface User {
  id: string;
  email: string;
  name: string;
  role: "customer" | "officer" | "manager" | "admin";
  createdAt: string;
}

export interface CustomerProfile {
  userId: string;
  phoneNumber: string;
  nationalId: string;
  employmentStatus: string;
  monthlyIncome: number;
  existingDebts: number;
  creditScore: number;
  creditRisk: "Low" | "Medium" | "High";
}

export interface LoanApplication {
  id: string;
  userId: string;
  applicantName: string;
  loanAmount: number;
  loanPurpose: string;
  tenureMonths: number;
  status: "submitted" | "verified" | "under_review" | "approved" | "rejected" | "disbursed";
  referenceNumber: string;
  monthlyRepayment: number;
  submissionDate: string;
  riskScore: number;
  riskLevel: "Low" | "Medium" | "High";
  riskExplanation: string;
  comments: string;
  estimatedCompletionDate: string;
}

export interface DocumentRecord {
  id: string;
  loanApplicationId: string;
  documentType: "national_id" | "payslip" | "bank_statement" | "employment_letter";
  fileName: string;
  secureUrl: string;
  status: "pending" | "verified" | "flagged";
  uploadedAt: string;
  ocrData?: {
    extractedName?: string;
    extractedIdNumber?: string;
    extractedSalary?: number;
    discrepancyDetails?: string;
    textMatched: boolean;
    confidence: number;
  };
}

export interface LoanApproval {
  id: string;
  loanApplicationId: string;
  reviewerId: string;
  reviewerName: string;
  reviewerRole: string;
  decision: "approve" | "reject" | "request_info";
  comments: string;
  timestamp: string;
}

export interface LoanDisbursement {
  id: string;
  loanApplicationId: string;
  amount: number;
  disbursementDate: string;
  bankAccountNumber: string;
  paymentReference: string;
  status: "pending" | "completed";
}

export interface NotificationRecord {
  id: string;
  userId: string;
  title: string;
  message: string;
  read: boolean;
  timestamp: string;
}

export interface AuditLog {
  id: string;
  userId: string;
  userEmail: string;
  action: string;
  details: string;
  timestamp: string;
}

export interface ManagerAnalytics {
  analytics: {
    totalApplications: number;
    approvedTotal: number;
    rejectedTotal: number;
    approvalRate: number;
    averageProcessingTimeHours: number;
    totalPortfolioValue: number;
  };
  portfolioData: Array<{ name: string; value: number }>;
  weeklyData: Array<{ week: string; count: number; value: number }>;
}

/**
 * Standardized Kenyan Shilling formatter
 */
export function formatKES(amount: number): string {
  return "KSh " + Math.round(amount).toLocaleString("en-KE");
}

