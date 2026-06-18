import { useEffect, useState } from "react";
import { User, LoanApplication, DocumentRecord, LoanApproval } from "../types";
import { Clock, ShieldCheck, HelpCircle, FileText, CheckCircle2, AlertTriangle, ArrowLeft, Landmark, DollarSign } from "lucide-react";

interface LoanTrackerPageProps {
  loanId: string;
  onNavigate: (page: string) => void;
}

export default function LoanTrackerPage({ loanId, onNavigate }: LoanTrackerPageProps) {
  const [data, setData] = useState<{
    loan: LoanApplication;
    documents: DocumentRecord[];
    approvals: LoanApproval[];
    disbursement: any;
  } | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDetails = async () => {
      try {
        const res = await fetch(`/api/loans/${loanId}`, {
          headers: {
            "Authorization": `Bearer ${localStorage.getItem("veriloan_token")}`
          }
        });
        if (!res.ok) {
          throw new Error("Failed to fetch application history.");
        }
        const json = await res.json();
        setData(json);
      } catch (err: any) {
        setError(err.message || "Something went wrong.");
      } finally {
        setLoading(false);
      }
    };
    fetchDetails();
  }, [loanId]);

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-20 text-center font-sans">
        <div className="animate-spin inline-block w-8 h-8 border-4 border-blue-600 rounded-full border-t-transparent mb-4"></div>
        <p className="text-slate-500 text-xs">Vetting file records against database indices...</p>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="max-w-md mx-auto px-4 py-16 text-center font-sans space-y-4">
        <h2 className="text-xl font-bold text-slate-900">Application File Not Found</h2>
        <p className="text-xs text-slate-500">The requested profile reference might be deleted or locked.</p>
        <button
          onClick={() => onNavigate("customer-dashboard")}
          className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs rounded-lg cursor-pointer"
        >
          Return to Dashboard
        </button>
      </div>
    );
  }

  const { loan, documents, approvals, disbursement } = data;

  // Active step highlights (submitted -> verified -> under_review -> approved/rejected -> disbursed)
  const steps = [
    { label: "Submitted", desc: "Profile generated & risk parameters checked initially.", key: "submitted", date: loan.submissionDate },
    { label: "OCR Verified", desc: "National ID and pay statements cross-referenced.", key: "verified", date: documents[0]?.uploadedAt || null },
    { label: "Vetting Review", desc: "Routed to Senior Officers for liquidity and collateral review.", key: "under_review", date: approvals[0]?.timestamp || null },
    { label: "Underwriter Verdict", desc: "Outcome decision: approved or declined.", key: "approved", date: approvals.find(a => a.decision === "approve" || a.decision === "reject")?.timestamp || null },
    { label: "Capital Disbursed", desc: "Bank dispatch completes transmission of funds.", key: "disbursed", date: disbursement?.disbursementDate || null },
  ];

  const getStepIndex = (status: string) => {
    if (status === "submitted") return 0;
    if (status === "verified") return 1;
    if (status === "under_review") return 2;
    if (status === "approved" || status === "rejected") return 3;
    if (status === "disbursed") return 4;
    return 0;
  };

  const currentStepIdx = getStepIndex(loan.status);

  return (
    <div id="loan-tracker-page" className="max-w-5xl mx-auto px-4 py-10 font-sans space-y-6">
      
      {/* Header Back Bar */}
      <div className="flex items-center gap-3">
        <button
          onClick={() => onNavigate("customer-dashboard")}
          id="btn-tracker-back"
          className="p-2 bg-white hover:bg-slate-100 border border-slate-150 rounded-lg text-slate-700 font-bold text-xs flex items-center gap-1 transition-all cursor-pointer"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>My Space</span>
        </button>
        <span className="text-slate-400 font-mono text-xs">/</span>
        <span className="text-slate-500 font-mono text-[10px] font-bold uppercase tracking-wider">Tracking {loan.referenceNumber}</span>
      </div>

      {/* Main Stats Card */}
      <div className="card grid grid-cols-1 md:grid-cols-4 gap-4 items-center">
        <div className="space-y-1">
          <span className="card-label">Application Code</span>
          <h2 className="text-base font-extrabold text-slate-950">{loan.referenceNumber}</h2>
          <span className="bg-sky-50 text-sky-850 text-[10px] font-bold px-2 py-0.5 rounded uppercase border border-sky-100">{loan.status}</span>
        </div>
        <div className="space-y-1">
          <span className="card-label">Requested Principal</span>
          <h2 className="text-xl font-extrabold text-sky-600">${loan.loanAmount.toLocaleString()}</h2>
          <span className="text-xs text-slate-550">{loan.tenureMonths} mos tenure</span>
        </div>
        <div className="space-y-1">
          <span className="card-label">Amortized Installment</span>
          <h2 className="text-base font-extrabold text-[#0f172a]">${loan.monthlyRepayment.toFixed(2)}/mo</h2>
          <span className="text-xs text-slate-550 font-medium">Principal + FLAT APR</span>
        </div>
        <div className="space-y-1">
          <span className="card-label">FINISH TIME INDEX</span>
          <h2 className="text-xs font-bold text-slate-800 flex items-center gap-1">
            <Clock className="w-3.5 h-3.5 text-sky-500" />
            <span>{new Date(loan.estimatedCompletionDate).toLocaleDateString()}</span>
          </h2>
          <span className="text-[10px] text-emerald-600 block leading-tight font-medium">Standard vetting cycles</span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        
        {/* Interactive Lifecycle Timeline */}
        <div className="card lg:col-span-1 space-y-4">
          <h3 className="card-label !mb-2">
            Credit Application Timeline
          </h3>

          <div className="space-y-6 relative pl-3">
            {/* Thread Line linking items */}
            <div className="absolute top-2.5 left-5 w-0.5 bg-slate-100 bottom-2.5 z-0"></div>

            {steps.map((st, i) => {
              const active = i <= currentStepIdx;
              const isCurrent = i === currentStepIdx;
              return (
                <div key={i} className="flex gap-4 items-start relative z-10">
                  <div className={`w-5 h-5 rounded-full mt-1 shrink-0 flex items-center justify-center border-2 ${
                    isCurrent
                      ? "bg-sky-500 border-sky-500 ring-4 ring-sky-100"
                      : active
                      ? "bg-slate-900 border-slate-900"
                      : "bg-white border-slate-250"
                  }`}>
                    {active ? (
                      <div className="h-1.5 w-1.5 rounded-full bg-white"></div>
                    ) : null}
                  </div>
                  <div className="space-y-0.5">
                    <h4 className={`text-xs font-bold leading-tight ${active ? "text-slate-900" : "text-slate-400"}`}>
                      {st.label}
                    </h4>
                    <p className="text-[10px] text-slate-500 leading-normal">{st.desc}</p>
                    {active && st.date && (
                      <span className="text-[9px] text-slate-400 font-mono">
                        {new Date(st.date).toLocaleDateString()}
                      </span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* OCR Documentation Analysis Details */}
        <div className="card lg:col-span-2 space-y-4">
          <div className="flex justify-between items-center pb-2 border-b border-slate-105">
            <h3 className="card-label !mb-0">AI Documents OCR Analysis</h3>
            <span className="text-[9px] bg-sky-50 text-sky-800 uppercase font-mono px-2 py-0.5 rounded font-bold border border-sky-100">
              {documents.length} Attachment Files
            </span>
          </div>

          <div className="space-y-4">
            {documents.length === 0 ? (
              <div className="py-12 border border-dashed border-slate-150 rounded-xl text-center text-xs text-slate-400">
                Supporting documents are not uploaded yet. Submit salary slip records or National ID card arrays first.
              </div>
            ) : (
              documents.map((doc, idx) => (
                <div key={doc.id} className="border border-slate-150 rounded-xl p-4 space-y-3.5">
                  <div className="flex justify-between items-start">
                    <div>
                      <span className="text-[9px] uppercase tracking-wide px-2 py-0.5 bg-slate-100 text-slate-700 font-bold block rounded w-max">
                        {doc.documentType.replace("_", " ")}
                      </span>
                      <strong className="text-slate-900 text-xs font-bold block mt-1.5">{doc.fileName}</strong>
                    </div>

                    <div className="text-right">
                      {doc.status === "verified" ? (
                        <span className="bg-emerald-50 text-emerald-800 border border-emerald-100 px-2 py-1 rounded text-[10px] font-bold flex items-center gap-1">
                          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                          <span>DOCUMENT VERIFIED</span>
                        </span>
                      ) : (
                        <span className="bg-amber-50 text-amber-800 border border-amber-100 px-2 py-1 rounded text-[10px] font-bold flex items-center gap-1">
                          <AlertTriangle className="w-3.5 h-3.5 text-amber-600 shrink-0" />
                          <span>FLAGGED DETECTED</span>
                        </span>
                      )}
                    </div>
                  </div>

                  {/* OCR extracted parameters metrics view */}
                  {doc.ocrData && (
                    <div className="bg-slate-50 rounded-xl p-3 grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs border border-slate-150 font-sans">
                      <div>
                        <span className="text-slate-400 font-semibold uppercase text-[10px] block leading-none mb-1">Extracted Name</span>
                        <strong className="text-slate-900 font-bold">{doc.ocrData.extractedName || "Unknown"}</strong>
                      </div>
                      <div>
                        <span className="text-slate-400 font-semibold uppercase text-[10px] block leading-none mb-1">
                          {doc.documentType === "payslip" ? "Extracted Annual Salary" : "Extracted Id Card No"}
                        </span>
                        <strong className="text-slate-900 font-bold">
                          {doc.documentType === "payslip"
                            ? doc.ocrData.extractedSalary
                              ? `$${(doc.ocrData.extractedSalary).toLocaleString()}`
                              : "Not identified"
                            : doc.ocrData.extractedIdNumber || "Not Identified"}
                        </strong>
                      </div>
                      <div>
                        <span className="text-slate-400 font-semibold uppercase text-[10px] block leading-none mb-1">Match Confidence</span>
                        <strong className="text-blue-600 font-bold">{doc.ocrData.confidence || 90}% match rate</strong>
                      </div>
                      <div className="col-span-1 sm:col-span-3 border-t border-slate-150 pt-2.5 mt-0.5">
                        <span className="text-slate-400 text-[10px] block font-semibold mb-0.5 uppercase">AI Cross-Reference Report</span>
                        <p className="text-slate-700 leading-normal font-medium italic">{doc.ocrData.discrepancyDetails}</p>
                      </div>
                    </div>
                  )}
                </div>
              ))
            )}
          </div>

          {/* Underwriter comments and decisions history */}
          <div className="border-t border-slate-100 pt-6 space-y-4">
            <h4 className="text-slate-950 font-bold text-xs uppercase font-mono tracking-wider">
              Underwriter Audit Reports & Decision Logs
            </h4>

            {approvals.length === 0 ? (
              <p className="text-xs text-slate-500 italic">
                Application is currently in routing queue. Standard evaluation takes less than 24 hours.
              </p>
            ) : (
              <div className="space-y-2.5">
                {approvals.map((ap) => (
                  <div key={ap.id} className="p-3 bg-slate-50 border border-slate-150 rounded-xl text-xs space-y-1">
                    <div className="flex justify-between items-center text-[10px] font-bold text-slate-400 font-mono">
                      <span>{ap.reviewerName} ({ap.reviewerRole.toUpperCase()})</span>
                      <span>{new Date(ap.timestamp).toLocaleString()}</span>
                    </div>
                    <p className="text-slate-900 font-bold">
                      Decision outcome: <span className={ap.decision === "approve" ? "text-emerald-600" : "text-rose-600"}>{ap.decision.toUpperCase()}</span>
                    </p>
                    <p className="text-slate-600 text-[11px] font-medium leading-relaxed italic mt-1 font-sans">
                      Underwriter Notes: "{ap.comments || "No additional feedback needed."}"
                    </p>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
