import { useEffect, useState } from "react";
import { User, LoanApplication, ManagerAnalytics } from "../types";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell } from "recharts";
import { Landmark, TrendingUp, DollarSign, Award, Clock, ArrowUpRight, Inbox, CheckCircle, ShieldAlert, Receipt } from "lucide-react";

interface ManagerDashboardProps {
  currentUser: User | null;
  onNavigate: (page: string, contextId?: string) => void;
}

export default function ManagerDashboard({ currentUser, onNavigate }: ManagerDashboardProps) {
  const [data, setData] = useState<ManagerAnalytics | null>(null);
  const [escalations, setEscalations] = useState<LoanApplication[]>([]);
  const [loading, setLoading] = useState(true);
  const [disburseLoading, setDisburseLoading] = useState<string | null>(null);

  const COLORS = ["#2563eb", "#4f46e5", "#0d9488", "#db2777", "#ea580c"];

  const fetchData = async () => {
    try {
      const reportRes = await fetch("/api/manager/reports", {
        headers: { "Authorization": `Bearer ${localStorage.getItem("veriloan_token")}` }
      });
      if (reportRes.ok) {
        const json = await reportRes.json();
        setData(json);
      }

      // Fetch escrow/escalated loans
      const queueRes = await fetch("/api/officer/applications", {
        headers: { "Authorization": `Bearer ${localStorage.getItem("veriloan_token")}` }
      });
      if (queueRes.ok) {
        const queueJson: LoanApplication[] = await queueRes.json();
        // Escalated / Priority items: status is approved (ready for disburse) OR under_review with high amount (> KSh 50,000)
        const priority = queueJson.filter(l => 
          l.status === "approved" || 
          (l.loanAmount > 50000 && (l.status === "submitted" || l.status === "verified" || l.status === "under_review"))
        );
        setEscalations(priority);
      }
    } catch (e) {
      console.error("Manager data load failed:", e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleDisbursement = async (loanId: string) => {
    setDisburseLoading(loanId);
    try {
      const res = await fetch(`/api/loans/${loanId}/disburse`, {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${localStorage.getItem("veriloan_token")}`
        }
      });
      if (res.ok) {
        alert("Wire transfer transaction dispatched immediately! Funds transferred.");
        await fetchData();
      } else {
        const err = await res.json();
        alert(`Disbursement failure: ${err.error}`);
      }
    } catch (e: any) {
      alert(`Error dispatching transaction wire: ${e.message}`);
    } finally {
      setDisburseLoading(null);
    }
  };

  if (loading || !data) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-20 text-center font-sans animate-pulse">
        <div className="animate-spin inline-block w-8 h-8 border-4 border-blue-600 rounded-full border-t-transparent mb-4"></div>
        <p className="text-slate-500 text-xs">Generating neural analytics and transaction ledgers...</p>
      </div>
    );
  }

  const { analytics, portfolioData, weeklyData } = data;

  return (
    <div id="manager-dashboard" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 font-sans space-y-6">
      
      {/* Visual Title */}
      <div>
        <span className="text-sky-600 font-mono text-[10px] uppercase tracking-widest font-bold">EXECUTIVE ANALYTICS CONSOLE</span>
        <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">Managerial Control Desk</h1>
        <p className="text-slate-500 text-xs mt-1">
          Monitor institutional loan portfolios value metrics, approve escalated requests, and dispatch capital wire payouts.
        </p>
      </div>

      {/* Grid of Indicator summaries */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        
        <div className="card space-y-2">
          <span className="card-label">Total Asset Submissions</span>
          <div className="flex justify-between items-baseline">
            <h3 className="text-2xl font-extrabold text-slate-950">{analytics.totalApplications}</h3>
            <span className="text-emerald-600 text-[10px] font-bold font-mono">+12.5% mo</span>
          </div>
          <p className="text-[10px] text-slate-400">Total pipeline credit volume</p>
        </div>

        <div className="card space-y-2">
          <span className="card-label">Average Approval Rate</span>
          <div className="flex justify-between items-baseline">
            <h3 className="text-2xl font-extrabold text-slate-950">{analytics.approvalRate}%</h3>
            <span className="text-slate-400 text-[10px] font-bold font-mono">Industry Avg: 62%</span>
          </div>
          <p className="text-[10px] text-slate-400">Vetted approval ratio</p>
        </div>

        <div className="card space-y-2">
          <span className="card-label">Average Underwrite Duration</span>
          <div className="flex justify-between items-baseline">
            <h3 className="text-2xl font-extrabold text-slate-950">{analytics.averageProcessingTimeHours}h</h3>
            <span className="text-sky-600 text-[10px] font-bold font-mono">OCR assisted faster</span>
          </div>
          <p className="text-[10px] text-slate-400">From submission to wire dispatch</p>
        </div>

        <div className="card space-y-2">
          <span className="card-label">Capital Portfolio Value</span>
          <div className="flex justify-between items-baseline">
            <h3 className="text-2xl font-extrabold text-sky-600">KSh {analytics.totalPortfolioValue.toLocaleString()}</h3>
            <span className="text-emerald-650 text-[10px] font-bold font-mono">Secure Backing</span>
          </div>
          <p className="text-[10px] text-slate-400">Outstanding principal pool aggregate</p>
        </div>

      </div>

      {/* Visual Recharts blocks */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        
        {/* Weekly submission volumes */}
        <div className="card space-y-4">
          <h3 className="card-label font-bold">Submission Volume Trends</h3>
          <div className="h-64 font-sans text-xs">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={weeklyData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="week" stroke="#94a3b8" />
                <YAxis stroke="#94a3b8" />
                <Tooltip />
                <Legend />
                <Bar name="Credit Requests (KSh)" dataKey="value" fill="#0ea5e9" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Portfolio asset breakdown pie */}
        <div className="card space-y-4">
          <h3 className="card-label font-bold">Credit Portfolio Allocation</h3>
          <div className="h-64 font-sans text-xs flex justify-center items-center">
            {portfolioData.length === 0 ? (
              <p className="text-slate-400 italic">No asset data recorded.</p>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={portfolioData}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={85}
                    paddingAngle={3}
                    dataKey="value"
                    label
                  >
                    {portfolioData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(value: any) => "KSh " + value.toLocaleString()} />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>

      </div>

      {/* Escalated Queue / Disbursal Triggers */}
      <div className="card !p-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6 pb-4 border-b border-slate-100">
          <div>
            <h3 className="font-extrabold text-slate-950 text-base leading-tight">Priority Escalation & Disbursals Queue</h3>
            <span className="text-xs text-slate-500 mt-1 block">Escalated high-value requests and fully approved loans waiting wire payout execution.</span>
          </div>
          <span className="text-[10px] font-bold text-sky-800 bg-sky-50 border border-sky-100 px-3 py-1 rounded-full uppercase shrink-0">
            {escalations.length} Queue Items
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="card-table">
            <thead>
              <tr className="border-b border-slate-150 text-slate-400 bg-slate-50/50">
                <th className="p-3 font-semibold uppercase tracking-wider">Ref Code</th>
                <th className="p-3 font-semibold uppercase tracking-wider">Applicant</th>
                <th className="p-3 font-semibold uppercase tracking-wider">Requested Principal</th>
                <th className="p-3 font-semibold uppercase tracking-wider">Risk profile</th>
                <th className="p-3 font-semibold uppercase tracking-wider">Status Outcome</th>
                <th className="p-3 font-semibold text-right">Escalation override decision</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-150 text-slate-900">
              {escalations.length === 0 ? (
                <tr>
                  <td colSpan={6} className="text-center p-10 text-slate-400 italic">
                    All escalated portfolios are fully dispatched. Queue is empty.
                  </td>
                </tr>
              ) : (
                escalations.map((e) => (
                  <tr key={e.id} className="hover:bg-slate-50 transition-colors">
                    <td className="p-3 font-bold text-slate-900">{e.referenceNumber}</td>
                    <td className="p-3 font-medium text-slate-950">{e.applicantName}</td>
                    <td className="p-3 font-bold text-sky-600 text-sm">KSh {e.loanAmount.toLocaleString()}</td>
                    <td className="p-3">
                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold font-mono ${
                        e.riskLevel === "Low" ? "bg-emerald-50 text-emerald-800" : "bg-rose-50 text-rose-800"
                      }`}>
                        {e.riskScore} ({e.riskLevel}) Risk
                      </span>
                    </td>
                    <td className="p-3">
                      <span className={`status-badge uppercase ${
                        e.status === "approved" ? "status-approved animate-pulse" : "status-review"
                      }`}>
                        {e.status.replace("_", " ")}
                      </span>
                    </td>
                    <td className="p-3 text-right">
                      <div className="flex gap-2 justify-end">
                        <button
                          onClick={() => onNavigate("officer-dashboard", e.id)}
                          className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 hover:text-slate-950 text-slate-600 font-bold rounded cursor-pointer transition-all border border-slate-200"
                        >
                          Review File
                        </button>
                        {e.status === "approved" && (
                          <button
                            onClick={() => handleDisbursement(e.id)}
                            id={`btn-disburse-${e.referenceNumber}`}
                            disabled={disburseLoading === e.id}
                            className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded flex items-center gap-1.5 hover:shadow-md transition-all cursor-pointer shadow-sm text-xs"
                          >
                            <Receipt className="w-4 h-4" />
                            <span>{disburseLoading === e.id ? "Paying..." : "Transfer Funds"}</span>
                          </button>
                        )}
                      </div>
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
