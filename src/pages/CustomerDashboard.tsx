import { User, LoanApplication, CustomerProfile } from "../types";
import { PlusCircle, FileUp, Sparkles, TrendingUp, HelpCircle, FileText, ArrowRight, ShieldCheck, Clock } from "lucide-react";

interface CustomerDashboardProps {
  currentUser: User | null;
  profile: CustomerProfile | null;
  loans: LoanApplication[];
  onNavigate: (page: string, contextId?: string) => void;
}

export default function CustomerDashboard({ currentUser, profile, loans, onNavigate }: CustomerDashboardProps) {
  const activeLoan = loans[0]; // Fetch latest application for top hero card
  
  const getStatusBadge = (status: string) => {
    switch (status) {
      case "submitted": return <span className="status-badge status-review">SUBMITTED</span>;
      case "verified": return <span className="status-badge status-approved">OCR VERIFIED</span>;
      case "under_review": return <span className="status-badge status-review animate-pulse">UNDER REVIEW</span>;
      case "approved": return <span className="status-badge status-approved">APPROVED</span>;
      case "rejected": return <span className="status-badge bg-rose-100 text-rose-800">DECLINED</span>;
      case "disbursed": return <span className="status-badge status-approved">FUNDS DISBURSED</span>;
      default: return null;
    }
  };

  const getScoreColor = (score: number) => {
    if (score >= 720) return "text-emerald-500 border-emerald-500 bg-emerald-50/50";
    if (score >= 640) return "text-amber-500 border-amber-500 bg-amber-50/50";
    return "text-rose-500 border-rose-500 bg-rose-50/50";
  };

  return (
    <div id="customer-dashboard" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 font-sans space-y-6">
      {/* Header Overview Card */}
      <div className="bg-slate-900 rounded-3xl p-6 md:p-8 text-white relative overflow-hidden shadow-xl">
        <div className="absolute top-0 right-0 w-64 h-64 bg-sky-500/10 rounded-full blur-3xl"></div>
        <div className="relative z-10 flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
          <div className="space-y-2">
            <span className="text-sky-400 font-mono text-[10px] uppercase tracking-widest font-bold">CUSTOMER DESK SECURITY SAFE</span>
            <h1 className="text-3xl md:text-4.5xl font-black text-white">Welcome back, {currentUser?.name}!</h1>
            <p className="text-slate-300 text-xs md:text-sm max-w-xl">
              Track your credit rating status, upload ID verification files, and audit outstanding financing loops here.
            </p>
          </div>
          <div className="flex gap-3">
            <button
              onClick={() => onNavigate("loan-apply")}
              id="customer-apply-btn"
              className="px-5 py-3 bg-sky-500 hover:bg-sky-400 text-slate-950 text-xs font-bold rounded-xl flex items-center gap-1.5 shadow-lg shadow-sky-500/20 cursor-pointer transition-all hover:scale-[1.01]"
            >
              <PlusCircle className="w-4 h-4" />
              <span>Apply for New Loan</span>
            </button>
          </div>
        </div>
      </div>

      {/* Grid of Indicators */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        
        {/* Core Credit Scoring Module */}
        <div className="card flex flex-col justify-between space-y-4">
          <div className="flex justify-between items-center">
            <h3 className="card-label">AI Credit Risk Rating</h3>
            <span className="text-[10px] font-bold text-slate-400 font-mono uppercase">Equifax Vetting</span>
          </div>

          <div className="py-2 text-center flex flex-col items-center">
            <div className={`w-32 h-32 rounded-full border-8 flex flex-col justify-center items-center font-sans ${getScoreColor(profile?.creditScore || 680)}`}>
              <span className="text-3xl font-black leading-none text-slate-900">{profile?.creditScore || 680}</span>
              <span className="text-[10px] font-bold uppercase tracking-wider mt-1 text-slate-500">Points</span>
            </div>
            <p className="text-xs text-slate-600 font-bold mt-4">
              Risk Category Status: <span className="text-sky-600">{profile?.creditRisk || "Medium"} Risk</span>
            </p>
          </div>

          <div className="bg-slate-50 border border-slate-100 rounded-xl p-3 flex gap-2">
            <Sparkles className="w-4 h-4 text-sky-500 shrink-0 mt-0.5" />
            <span className="text-[10.5px] text-slate-500 leading-relaxed block">
              Our AI evaluates your steady income (${(profile?.monthlyIncome || 5000).toLocaleString()}/mo) offsets debt leverage ratios to pre-calculate approval limits.
            </span>
          </div>
        </div>

        {/* Dynamic Status Track Widget */}
        <div className="card lg:col-span-2 flex flex-col justify-between">
          <div>
            <div className="flex justify-between items-center border-b border-slate-100 pb-3 mb-4">
              <h3 className="card-title">Latest Application Overview</h3>
              {activeLoan && getStatusBadge(activeLoan.status)}
            </div>

            {activeLoan ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-3">
                  <div className="text-xs">
                    <span className="card-label block mb-0.5">Ref Number</span>
                    <strong className="text-slate-900 font-extrabold text-sm">{activeLoan.referenceNumber}</strong>
                  </div>
                  <div className="text-xs">
                    <span className="card-label block mb-0.5">Approved Capital</span>
                    <div className="stat-value text-sky-600">${activeLoan.loanAmount.toLocaleString()}</div>
                  </div>
                  <div className="text-xs">
                    <span className="card-label block mb-0.5">Monthly Installment</span>
                    <strong className="text-slate-950 font-bold">${activeLoan.monthlyRepayment.toFixed(2)} / mo</strong>
                  </div>
                </div>

                <div className="space-y-3">
                  <div className="text-xs">
                    <span className="card-label block mb-0.5">Purpose</span>
                    <p className="text-slate-700 font-medium truncate">{activeLoan.loanPurpose}</p>
                  </div>
                  <div className="text-xs">
                    <span className="card-label block mb-0.5">AI Rating Code</span>
                    <p className="text-slate-700 font-medium">{activeLoan.riskScore} Scoring ({activeLoan.riskLevel} Hazard)</p>
                  </div>
                  <div className="text-xs">
                    <span className="card-label block mb-0.5">Target Vetting Finish</span>
                    <div className="flex items-center gap-1 text-slate-700 font-medium">
                      <Clock className="w-3.5 h-3.5 text-sky-500" />
                      <span>{new Date(activeLoan.estimatedCompletionDate).toLocaleDateString()}</span>
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <div className="py-10 text-center text-slate-400 text-xs">
                No active loan requests on file. Click "Apply for New Loan" to build a request instantly.
              </div>
            )}
          </div>

          {activeLoan && (
            <div className="flex flex-col sm:flex-row gap-3 pt-6 border-t border-slate-50 mt-4">
              <button
                onClick={() => onNavigate("loan-track", activeLoan.id)}
                id="btn-track-timeline"
                className="flex-1 py-2.5 px-4 bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs rounded-xl flex items-center justify-center gap-1 cursor-pointer transition-all"
              >
                <span>Track Work Progress Timeline</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
              {activeLoan.status === "submitted" && (
                <button
                  onClick={() => onNavigate("loan-upload-docs", activeLoan.id)}
                  id="btn-upload-direct"
                  className="py-2.5 px-4 bg-blue-50 hover:bg-blue-100 text-blue-700 font-bold text-xs rounded-xl flex items-center justify-center gap-1.5 cursor-pointer transition-all border border-blue-200"
                >
                  <FileUp className="w-4 h-4" />
                  <span>Upload Critical Docs</span>
                </button>
              )}
            </div>
          )}
        </div>
      </div>

      {/* History Grid List */}
      <div className="bg-white rounded-2xl border border-slate-100 p-6 shadow-md">
        <div className="flex justify-between items-center mb-6">
          <h3 className="font-extrabold text-slate-900 text-sm md:text-base">Credit File History & Audits</h3>
          <span className="text-xs text-slate-400 font-mono uppercase">{loans.length} Submissions</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="border-b border-slate-100/85 text-slate-400 bg-slate-50/50">
                <th className="p-3 font-semibold uppercase tracking-wider">Ref Code</th>
                <th className="p-3 font-semibold uppercase tracking-wider">Date</th>
                <th className="p-3 font-semibold uppercase tracking-wider">AmountRequested</th>
                <th className="p-3 font-semibold uppercase tracking-wider font-mono">Tenure</th>
                <th className="p-3 font-semibold uppercase tracking-wider">Status Outcome</th>
                <th className="p-3 font-semibold uppercase tracking-wider">Underwriter Comments</th>
                <th className="p-3 font-semibold text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-150">
              {loans.length === 0 ? (
                <tr>
                  <td colSpan={7} className="text-center p-8 text-slate-400">
                    You have not submitted any applications yet.
                  </td>
                </tr>
              ) : (
                loans.map((l) => (
                  <tr key={l.id} className="hover:bg-slate-50 transition-colors">
                    <td className="p-3 font-bold text-slate-900">{l.referenceNumber}</td>
                    <td className="p-3 p-3.5 text-slate-500">{new Date(l.submissionDate).toLocaleDateString()}</td>
                    <td className="p-3 font-extrabold text-slate-900">${l.loanAmount.toLocaleString()}</td>
                    <td className="p-3 font-mono font-medium text-slate-600">{l.tenureMonths} mos</td>
                    <td className="p-3">{getStatusBadge(l.status)}</td>
                    <td className="p-3 text-slate-500 italic max-w-xs truncate">{l.comments || "Synthesized profile is low default hazard."}</td>
                    <td className="p-3 text-right">
                      <button
                        onClick={() => onNavigate("loan-track", l.id)}
                        id={`action-view-${l.id}`}
                        className="px-3 py-1 bg-slate-100 hover:bg-slate-200 hover:text-blue-600 text-slate-700 font-bold rounded cursor-pointer transition-all"
                      >
                        File Detail
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
