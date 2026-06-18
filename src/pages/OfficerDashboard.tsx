import { useState, useEffect } from "react";
import { User, LoanApplication, DocumentRecord, LoanApproval } from "../types";
import { Search, Filter, ShieldAlert, CheckCircle, HelpCircle, FileText, FileUp, Sparkles, Inbox, MessageSquare, AlertTriangle, ArrowRight, BookLock } from "lucide-react";

interface OfficerDashboardProps {
  currentUser: User | null;
  onNavigate: (page: string, contextId?: string) => void;
}

export default function OfficerDashboard({ currentUser, onNavigate }: OfficerDashboardProps) {
  const [applications, setApplications] = useState<LoanApplication[]>([]);
  const [selectedLoanId, setSelectedLoanId] = useState<string | null>(null);
  const [detailData, setDetailData] = useState<{
    loan: LoanApplication;
    documents: DocumentRecord[];
    approvals: LoanApproval[];
    disbursement: any;
  } | null>(null);

  // Filters
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [officerComments, setOfficerComments] = useState("");
  const [actionLoading, setActionLoading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  // Load overall loans queue
  const fetchQueue = async () => {
    try {
      const res = await fetch("/api/officer/applications", {
        headers: { "Authorization": `Bearer ${localStorage.getItem("veriloan_token")}` }
      });
      if (res.ok) {
        const json = await res.json();
        setApplications(json);
        // Select first item by default if none selected
        if (json.length > 0 && !selectedLoanId) {
          setSelectedLoanId(json[0].id);
        }
      }
    } catch (e) {
      console.error(e);
    }
  };

  useEffect(() => {
    fetchQueue();
  }, [selectedLoanId]);

  // Load single loan details on selection
  useEffect(() => {
    if (!selectedLoanId) return;

    const fetchDetail = async () => {
      try {
        const res = await fetch(`/api/loans/${selectedLoanId}`, {
          headers: { "Authorization": `Bearer ${localStorage.getItem("veriloan_token")}` }
        });
        if (res.ok) {
          const json = await res.json();
          setDetailData(json);
        }
      } catch (err) {
        console.error(err);
      }
    };
    fetchDetail();
  }, [selectedLoanId, actionLoading]);

  // Handle decisions approve / reject / request-info
  const handleDecision = async (action: "approve" | "reject" | "request-info") => {
    if (!selectedLoanId) return;
    setActionLoading(true);
    setMessage(null);
    try {
      let endpoint = `/api/officer/applications/${selectedLoanId}/approve`;
      if (action === "reject") endpoint = `/api/officer/applications/${selectedLoanId}/reject`;
      if (action === "request-info") endpoint = `/api/officer/applications/${selectedLoanId}/request-info`;

      const res = await fetch(endpoint, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${localStorage.getItem("veriloan_token")}`
        },
        body: JSON.stringify({ comments: officerComments })
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Action failed.");
      }

      setMessage(data.message || "Decision logged on file successfully.");
      setOfficerComments("");
      await fetchQueue();
    } catch (err: any) {
      setMessage(`Operation Warning: ${err.message}`);
    } finally {
      setActionLoading(false);
    }
  };

  // List filters matcher
  const filteredLoans = applications.filter((l) => {
    const matchesSearch = l.applicantName.toLowerCase().includes(search.toLowerCase()) || 
                          l.referenceNumber.toLowerCase().includes(search.toLowerCase());
    const matchesStatus = statusFilter === "all" || l.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "submitted": return <span className="status-badge status-review">SUBMITTED</span>;
      case "verified": return <span className="status-badge status-approved">OCR MATCHED</span>;
      case "under_review": return <span className="status-badge status-review">UNDER REVIEW</span>;
      case "approved": return <span className="status-badge status-approved">APPROVED</span>;
      case "rejected": return <span className="status-badge bg-rose-100 text-rose-800">DECLINED</span>;
      case "disbursed": return <span className="status-badge status-approved">DISBURSED</span>;
      default: return null;
    }
  };

  const getRiskColor = (score: number) => {
    if (score < 30) return "text-[#10b981] risk-low";
    if (score <= 65) return "text-[#f59e0b] risk-med";
    return "text-[#ef4444] risk-high";
  };

  return (
    <div id="officer-dashboard" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 font-sans space-y-6">
      
      {/* Overview stats block */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <span className="text-sky-600 font-mono text-[10px] uppercase tracking-widest font-bold">LENDING ENHANCED PANEL</span>
          <h1 className="text-3xl font-extrabold text-[#0f172a] tracking-tight">Active Application Queue</h1>
          <p className="text-slate-500 text-xs mt-1">
            Conduct credit profile comparisons, scrutinize OCR results, and execute secure application decisions.
          </p>
        </div>
        <div className="flex gap-2.5">
          <button
            onClick={() => onNavigate("manager-dashboard")}
            className="p-2.5 bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs rounded-xl transition-all flex items-center gap-1 cursor-pointer"
          >
            <span>Executive Reports</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 items-start">
        
        {/* Left Hand: Searchable Application Queue */}
        <div className="card lg:col-span-4 space-y-4 !p-5">
          <div className="flex items-center justify-between">
            <h3 className="card-label !mb-0">Submissions Queue</h3>
            <span className="text-[10px] font-bold text-slate-400 font-mono bg-slate-100 px-2 py-0.5 rounded">
              {filteredLoans.length} Loans
            </span>
          </div>

          {/* Search elements */}
          <div className="relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
            <input
              type="text"
              id="queue-search"
              placeholder="Search reference or name..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-9 pr-3.5 py-2 border border-slate-200 rounded-xl text-slate-950 text-xs bg-slate-50 focus:outline-none"
            />
          </div>

          {/* Filters Select */}
          <div className="flex items-center gap-2">
            <Filter className="w-3.5 h-3.5 text-slate-400" />
            <span className="text-xs text-slate-400 font-medium">Status:</span>
            <select
              id="filter-status"
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="flex-1 bg-white border border-slate-200 rounded-lg text-xs p-1"
            >
              <option value="all">All statuses</option>
              <option value="submitted">Submitted</option>
              <option value="verified">Verified</option>
              <option value="under_review">Under Review</option>
              <option value="approved">Approved</option>
              <option value="rejected">Declined</option>
              <option value="disbursed">Disbursed</option>
            </select>
          </div>

          {/* List queue items */}
          <div className="space-y-2.5 max-h-[500px] overflow-y-auto pr-1">
            {filteredLoans.length === 0 ? (
              <div className="text-center py-10 text-xs text-slate-400 space-y-2">
                <Inbox className="w-6 h-6 text-slate-300 mx-auto" />
                <p>No matches matching filter criteria.</p>
              </div>
            ) : (
              filteredLoans.map((l) => {
                const isActive = l.id === selectedLoanId;
                return (
                  <div
                    key={l.id}
                    id={`queue-item-${l.referenceNumber}`}
                    onClick={() => setSelectedLoanId(l.id)}
                    className={`p-3.5 border rounded-xl text-left cursor-pointer transition-all ${
                      isActive
                        ? "bg-slate-900 text-white border-slate-900 shadow-md scale-[1.01]"
                        : "bg-white text-slate-900 border-slate-150 hover:bg-slate-50"
                    }`}
                  >
                    <div className="flex justify-between items-start leading-none mb-2">
                      <strong className="font-extrabold text-xs">{l.applicantName}</strong>
                      <span className="text-[9px] font-mono tracking-wider font-bold text-sky-400">{l.referenceNumber}</span>
                    </div>

                    <div className="flex justify-between items-center mt-2 pt-2 border-t border-slate-100/10">
                      <span className="text-[11px] font-extrabold text-sky-600 font-sans">${l.loanAmount.toLocaleString()}</span>
                      {getStatusBadge(l.status)}
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Right Hand: Selected Application Detail and Review Workspaces */}
        <div className="lg:col-span-8 space-y-4">
          {detailData ? (
            <div className="card space-y-6">
              
              {/* Core Info Top bar */}
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-slate-100 pb-4">
                <div>
                  <span className="text-[10px] text-sky-500 font-bold uppercase tracking-wider block font-mono">UNDER ASSESSMENT</span>
                  <h2 className="text-xl font-extrabold text-slate-900">Applicant: {detailData.loan.applicantName}</h2>
                  <p className="text-slate-500 text-xs mt-1">Ref Code: <strong className="text-sky-600">{detailData.loan.referenceNumber}</strong> | Submitted: {new Date(detailData.loan.submissionDate).toLocaleDateString()}</p>
                </div>
                <div>
                  {getStatusBadge(detailData.loan.status)}
                </div>
              </div>

              {/* Grid detail metrics */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="p-3.5 bg-slate-50 border border-slate-100 rounded-xl space-y-1">
                  <span className="card-label block mb-1">Capital Sum</span>
                  <div className="text-xl font-extrabold text-slate-950">${detailData.loan.loanAmount.toLocaleString()}</div>
                  <span className="text-[9px] text-slate-400 block font-bold font-mono uppercase">{detailData.loan.tenureMonths} Mos term</span>
                </div>

                <div className="p-3.5 bg-slate-50 border border-slate-100 rounded-xl space-y-1">
                  <span className="card-label block mb-1">Instalment Repayment</span>
                  <div className="text-xl font-extrabold text-slate-950">${detailData.loan.monthlyRepayment.toFixed(2)}/mo</div>
                  <span className="text-[9px] text-slate-400 block font-bold font-mono uppercase">8.5% Flat Financing</span>
                </div>

                <div className="p-3.5 border rounded-xl space-y-1 flex flex-col justify-between items-start bg-slate-50 border-slate-100">
                  <span className="card-label block mb-1">AI Hazard Scoring</span>
                  <div className="flex items-center gap-1.5 pt-1">
                    <span className={`text-sm font-extrabold px-2 py-0.5 border rounded-lg ${getRiskColor(detailData.loan.riskScore)}`}>
                      {detailData.loan.riskScore}/100
                    </span>
                    <strong className="text-xs text-slate-800">{detailData.loan.riskLevel} Risk</strong>
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <span className="card-label block">Financing Purpose declared</span>
                <p className="p-3 bg-slate-50 border border-slate-100 rounded-xl text-xs text-slate-700 leading-relaxed font-medium">
                  {detailData.loan.loanPurpose}
                </p>
              </div>

              {/* Gemini Risk Analytics Section */}
              <div className="bg-sky-50/40 border border-sky-100 rounded-2xl p-4 space-y-3">
                <h4 className="text-xs font-bold text-sky-950 uppercase font-mono tracking-wider flex items-center gap-1.5">
                  <Sparkles className="w-4 h-4 text-sky-500 shrink-0" />
                  <span>AI Neural Underwriting Evaluation</span>
                </h4>
                <p className="text-xs text-slate-700 font-medium leading-relaxed italic pr-4">
                  "{detailData.loan.riskExplanation}"
                </p>
              </div>

              {/* Verification OCR Documents inspect */}
              <div className="space-y-3 pt-2">
                <h3 className="font-extrabold text-slate-950 text-xs uppercase font-mono tracking-wider border-b border-slate-50 pb-2">
                  Scanned Vetting Documentation Details
                </h3>

                {detailData.documents.length === 0 ? (
                  <p className="text-xs text-slate-400 italic">No associated document uploads detected on system databases.</p>
                ) : (
                  <div className="space-y-3">
                    {detailData.documents.map((doc) => (
                      <div key={doc.id} className="border border-slate-150 rounded-xl p-4 space-y-3 bg-zinc-50/40">
                        <div className="flex justify-between items-start">
                          <div>
                            <span className="text-[10px] font-bold uppercase tracking-wider block font-mono text-indigo-700">
                              {doc.documentType.replace("_", " ")}
                            </span>
                            <strong className="text-slate-950 text-xs font-bold block mt-1">{doc.fileName}</strong>
                          </div>
                          <div>
                            {doc.status === "verified" ? (
                              <span className="bg-emerald-50 text-emerald-800 border border-emerald-100 px-2 py-0.5 rounded text-[10px] font-bold">
                                OCR MATCH OK
                              </span>
                            ) : (
                              <span className="bg-amber-50 text-amber-800 border border-amber-100 px-2 py-0.5 rounded text-[10px] font-bold">
                                MISMATCH FLAG
                              </span>
                            )}
                          </div>
                        </div>

                        {/* OCR parameter display */}
                        {doc.ocrData && (
                          <div className="bg-white rounded-xl p-3 border border-slate-150 text-xs grid grid-cols-1 md:grid-cols-3 gap-3">
                            <div>
                              <span className="text-[10px] text-slate-400 block uppercase font-semibold">Extracted Name</span>
                              <strong className="text-slate-900 font-black">{doc.ocrData.extractedName || "Unknown"}</strong>
                            </div>
                            <div>
                              <span className="text-[10px] text-slate-400 block uppercase font-semibold">Verified value</span>
                              <strong className="text-slate-900 font-black">
                                {doc.ocrData.extractedSalary ? `$${doc.ocrData.extractedSalary.toLocaleString()}` : doc.ocrData.extractedIdNumber || "Not recorded"}
                              </strong>
                            </div>
                            <div>
                              <span className="text-[10px] text-slate-400 block uppercase font-semibold">Reading Confidence</span>
                              <strong className="text-blue-600 font-black">{doc.ocrData.confidence}% Confidence</strong>
                            </div>
                            <div className="col-span-1 md:col-span-3 border-t border-slate-100 pt-2 text-[11px] text-slate-600 leading-normal">
                              <span className="text-slate-400 font-bold block uppercase text-[8px] mb-0.5 tracking-wider">Scanners log:</span>
                              "{doc.ocrData.discrepancyDetails}"
                            </div>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Decision Action panel */}
              <div className="border-t border-slate-150 pt-6 mt-4 space-y-4">
                <h3 className="font-extrabold text-slate-950 text-xs uppercase font-mono tracking-wider">
                  Reviewer Decision Console
                </h3>

                {message && (
                  <div className="text-xs bg-slate-50 p-3.5 border border-slate-150 text-slate-900 rounded-xl leading-relaxed italic shrink-0">
                    {message}
                  </div>
                )}

                <div className="space-y-2">
                  <label className="block text-xs font-semibold text-slate-700 uppercase tracking-widest font-mono">Comments & Vetting Explanations</label>
                  <textarea
                    value={officerComments}
                    onChange={(e) => setOfficerComments(e.target.value)}
                    placeholder="Enter assessment comments here. Example: Validated payslip matching monthly earnings, eligible for immediate dispatch."
                    rows={2}
                    className="w-full p-3 border border-slate-200 rounded-xl text-slate-950 text-xs bg-slate-50 focus:outline-none focus:ring-2 focus:ring-blue-500/25"
                  />
                </div>

                <div className="flex flex-col sm:flex-row gap-3">
                  <button
                    onClick={() => handleDecision("approve")}
                    disabled={actionLoading}
                    id="btn-officer-approve"
                    className="flex-1 py-3 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold rounded-xl flex items-center justify-center gap-1.5 cursor-pointer shadow-sm disabled:opacity-50"
                  >
                    <CheckCircle className="w-4 h-4" />
                    <span>Approve Application</span>
                  </button>

                  <button
                    onClick={() => handleDecision("reject")}
                    disabled={actionLoading}
                    id="btn-officer-reject"
                    className="py-3 px-6 bg-rose-50 hover:bg-rose-100 hover:text-rose-700 text-rose-600 border border-slate-200 text-xs font-bold rounded-xl flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-50"
                  >
                    <ShieldAlert className="w-4 h-4" />
                    <span>Decline Application</span>
                  </button>

                  <button
                    onClick={() => handleDecision("request-info")}
                    disabled={actionLoading}
                    id="btn-officer-request-info"
                    className="py-3 px-6 bg-slate-150 hover:bg-slate-200 text-slate-800 text-xs font-bold rounded-xl flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-50"
                  >
                    <MessageSquare className="w-4 h-4" />
                    <span>Request Info</span>
                  </button>
                </div>
              </div>

            </div>
          ) : (
            <div className="bg-white rounded-2xl border border-slate-100 shadow-md p-16 text-center text-slate-400 text-xs space-y-2">
              <Inbox className="w-10 h-10 text-slate-300 mx-auto" />
              <p>No active loan requests selected in application queue.</p>
            </div>
          )}
        </div>

      </div>
    </div>
  );
}
