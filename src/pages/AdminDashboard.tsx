import { useState, useEffect } from "react";
import { User, AuditLog } from "../types";
import { ShieldCheck, Users, Activity, Filter, RefreshCw, KeyRound, AlertTriangle, HelpCircle } from "lucide-react";

export default function AdminDashboard() {
  const [users, setUsers] = useState<any[]>([]);
  const [auditLogs, setAuditLogs] = useState<AuditLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [roleChangeLoading, setRoleChangeLoading] = useState<string | null>(null);

  // Filters
  const [userSearch, setUserSearch] = useState("");
  const [auditSearch, setAuditSearch] = useState("");

  const loadData = async () => {
    try {
      // Fetch user lists
      const usersRes = await fetch("/api/admin/users", {
        headers: { "Authorization": `Bearer ${localStorage.getItem("veriloan_token")}` }
      });
      if (usersRes.ok) {
        const u = await usersRes.json();
        setUsers(u);
      }

      // Fetch audit lists
      const auditRes = await fetch("/api/admin/audit-logs", {
        headers: { "Authorization": `Bearer ${localStorage.getItem("veriloan_token")}` }
      });
      if (auditRes.ok) {
        const a = await auditRes.json();
        setAuditLogs(a);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleRoleChange = async (userId: string, targetRole: string) => {
    setRoleChangeLoading(userId);
    try {
      const res = await fetch(`/api/admin/users/${userId}/role`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${localStorage.getItem("veriloan_token")}`
        },
        body: JSON.stringify({ role: targetRole })
      });

      if (res.ok) {
        alert("Account privileges migrated successfully in security clearance tables.");
        await loadData();
      } else {
        const err = await res.json();
        alert(`Failed: ${err.error}`);
      }
    } catch (e: any) {
      alert(`Error: ${e.message}`);
    } finally {
      setRoleChangeLoading(null);
    }
  };

  const filteredUsers = users.filter(u => 
    u.name.toLowerCase().includes(userSearch.toLowerCase()) || 
    u.email.toLowerCase().includes(userSearch.toLowerCase())
  );

  const filteredAudits = auditLogs.filter(a => 
    a.action.toLowerCase().includes(auditSearch.toLowerCase()) || 
    a.userEmail.toLowerCase().includes(auditSearch.toLowerCase()) ||
    a.details.toLowerCase().includes(auditSearch.toLowerCase())
  );

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-20 text-center font-sans animate-pulse">
        <div className="animate-spin inline-block w-8 h-8 border-4 border-blue-600 rounded-full border-t-transparent mb-4"></div>
        <p className="text-slate-500 text-xs">Accessing system directories and logging tables...</p>
      </div>
    );
  }

  return (
    <div id="admin-dashboard" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 font-sans space-y-6">
      
      {/* Visual Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <span className="text-sky-600 font-mono text-[10px] uppercase tracking-widest font-bold">ROOT SECURITY PANEL</span>
          <h1 className="text-3xl font-extrabold text-[#0f172a] tracking-tight">System Audit & Personnel</h1>
          <p className="text-slate-500 text-xs mt-1">
            Reassign organizational credentials, inspect microfinance logs, and view server session registrations.
          </p>
        </div>
        <button
          onClick={loadData}
          id="btn-admin-refresh"
          className="p-2.5 bg-white hover:bg-slate-100 text-slate-800 text-xs font-bold rounded-xl flex items-center gap-1.5 cursor-pointer border border-slate-200"
        >
          <RefreshCw className="w-3.5 h-3.5" />
          <span>Refresh Records</span>
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 items-start">
        
        {/* Left Hand Card: Users Roles Administration */}
        <div className="card lg:col-span-5 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="card-label !mb-0 flex items-center gap-1.5">
              <Users className="w-4 h-4 text-sky-650" />
              <span>Registered Accounts</span>
            </h3>
            <span className="text-[10px] font-bold text-slate-400 font-mono bg-slate-100 px-2.5 py-0.5 rounded">
              {users.length} registered
            </span>
          </div>

          <input
            type="text"
            id="admin-search-users"
            placeholder="Search credentials name or email..."
            value={userSearch}
            onChange={(e) => setUserSearch(e.target.value)}
            className="w-full px-3 py-2 border border-slate-200 rounded-xl text-slate-950 text-xs bg-slate-50 focus:outline-none focus:ring-2 focus:ring-sky-500/25"
          />

          <div className="space-y-3 max-h-[400px] overflow-y-auto pr-1">
            {filteredUsers.map((u) => (
              <div key={u.id} className="p-3 bg-slate-50 border border-slate-150 rounded-xl text-xs space-y-2.5">
                <div className="flex justify-between items-start leading-none mb-1">
                  <div>
                    <strong className="text-slate-900 font-bold block">{u.name}</strong>
                    <span className="text-[10px] text-slate-500">{u.email}</span>
                  </div>
                  <span className="text-[8px] font-mono text-slate-400 font-bold uppercase">{u.id}</span>
                </div>

                <div className="flex justify-between items-center pt-2.5 border-t border-slate-150">
                  <span className="text-[10px] text-slate-400 font-bold">Role Privilege:</span>
                  <select
                    id={`select-role-${u.id}`}
                    value={u.role}
                    disabled={roleChangeLoading === u.id}
                    onChange={(e) => handleRoleChange(u.id, e.target.value)}
                    className="p-1 border border-slate-200 rounded-lg text-xs bg-white font-semibold flex items-center select-none"
                  >
                    <option value="customer">customer (Alex Mercer)</option>
                    <option value="officer">officer (Connor Vetting)</option>
                    <option value="manager">manager (Wayne Executive)</option>
                    <option value="admin">admin (Clark System)</option>
                  </select>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Right Hand Card: Permanent System Audit Ledger Trail */}
        <div className="card lg:col-span-7 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="card-label !mb-0 flex items-center gap-1.5">
              <Activity className="w-4 h-4 text-sky-650" />
              <span>Permanent Activity Audit Trail</span>
            </h3>
            <span className="text-[10px] font-bold text-sky-800 bg-sky-50 border border-sky-100 px-2.5 py-0.5 rounded font-mono">
              SEC Compliant Logs
            </span>
          </div>

          <input
            type="text"
            id="admin-search-audits"
            placeholder="Search action keyword, email, or identifier..."
            value={auditSearch}
            onChange={(e) => setAuditSearch(e.target.value)}
            className="w-full px-3 py-2 border border-slate-200 rounded-xl text-slate-950 text-xs bg-slate-50 focus:outline-none focus:ring-2 focus:ring-sky-500/25"
          />

          <div className="space-y-3 max-h-[440px] overflow-y-auto pr-1">
            {filteredAudits.length === 0 ? (
              <p className="text-xs text-slate-400 italic text-center py-10">No matching audit logs matched.</p>
            ) : (
              filteredAudits.map((a) => (
                <div key={a.id} className="p-3 bg-zinc-50 border-l-4 border-sky-550 rounded-r-xl text-xs space-y-1 hover:bg-zinc-150/50 transition-colors">
                  <div className="flex justify-between items-center text-[10px] font-bold text-slate-400 font-mono leading-none mb-1">
                    <span>ACTION Code: <strong className="text-slate-950">{a.action}</strong></span>
                    <span>{new Date(a.timestamp).toLocaleString()}</span>
                  </div>
                  <p className="text-slate-800 leading-relaxed font-sans">{a.details}</p>
                  <p className="text-[10px] text-slate-500">
                    Operated by: <strong>{a.userEmail}</strong> ({a.userId})
                  </p>
                </div>
              ))
            )}
          </div>
        </div>

      </div>
    </div>
  );
}
