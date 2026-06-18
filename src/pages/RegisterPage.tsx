import React, { useState } from "react";
import { Landmark, ArrowRight, ShieldCheck, HelpCircle, AlertCircle } from "lucide-react";

interface RegisterPageProps {
  onRegisterSuccess: (token: string, user: any) => void;
  onNavigate: (page: string) => void;
}

export default function RegisterPage({ onRegisterSuccess, onNavigate }: RegisterPageProps) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [nationalId, setNationalId] = useState("");
  const [employmentStatus, setEmploymentStatus] = useState("Full-Time");
  const [monthlyIncome, setMonthlyIncome] = useState(5500);
  const [existingDebts, setExistingDebts] = useState(650);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!email || !password || !name) {
      setError("Name, email, and password credentials are mandatory.");
      return;
    }

    setLoading(true);
    try {
      const payload = {
        email,
        password,
        name,
        role: "customer", // Default registered profiles are standard customers
        phoneNumber,
        nationalId,
        employmentStatus,
        monthlyIncome,
        existingDebts
      };

      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Profile generation failed.");
      }

      onRegisterSuccess(data.token, data.user);
    } catch (err: any) {
      setError(err.message || "An error occurred.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div id="register-page" className="min-h-screen bg-slate-50 py-12 px-4 sm:px-6 lg:px-8 font-sans">
      <div className="max-w-xl mx-auto bg-white p-8 rounded-2xl border border-slate-100 shadow-xl space-y-6">
        
        {/* Title Block */}
        <div className="text-center">
          <div className="mx-auto h-12 w-12 bg-blue-50 text-blue-600 rounded-xl flex items-center justify-center">
            <Landmark className="w-6 h-6" />
          </div>
          <h2 className="mt-3 text-3xl font-black text-slate-900 tracking-tight">Open Secure Credit Profile</h2>
          <p className="mt-1 text-xs text-slate-500">
            Register your profile to track loans, trigger OCR document parsing, and calculate AI credit risk ratios.
          </p>
        </div>

        {error && (
          <div className="bg-rose-50 border border-rose-100 text-rose-800 rounded-xl p-3.5 flex items-start gap-2 text-xs">
            <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest font-mono border-b border-slate-100 pb-2">
            Step 1: Security & Identity
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">Full Name</label>
              <input
                type="text"
                id="register-name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Alex Mercer"
                className="w-full px-3 py-2 border border-slate-200 rounded-xl text-slate-950 text-xs bg-slate-50 focus:outline-none focus:ring-2 focus:ring-blue-500/25"
                required
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">Email Address</label>
              <input
                type="email"
                id="register-email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="alex@example.com"
                className="w-full px-3 py-2 border border-slate-200 rounded-xl text-slate-950 text-xs bg-slate-50 focus:outline-none focus:ring-2 focus:ring-blue-500/25"
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">Security Password</label>
              <input
                type="password"
                id="register-password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full px-3 py-2 border border-slate-200 rounded-xl text-slate-950 text-xs bg-slate-50 focus:outline-none focus:ring-2 focus:ring-blue-500/25"
                required
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">Mobile Phone No.</label>
              <input
                type="text"
                id="register-phone"
                value={phoneNumber}
                onChange={(e) => setPhoneNumber(e.target.value)}
                placeholder="+1 (555) 019-2834"
                className="w-full px-3 py-2 border border-slate-200 rounded-xl text-slate-950 text-xs bg-slate-50 focus:outline-none focus:ring-2 focus:ring-blue-500/25"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">National ID / Gov Card ID</label>
            <input
              type="text"
              id="register-national-id"
              value={nationalId}
              onChange={(e) => setNationalId(e.target.value)}
              placeholder="NID-98765432-A"
              className="w-full px-3 py-2 border border-slate-200 rounded-xl text-slate-950 text-xs bg-slate-50 focus:outline-none focus:ring-2 focus:ring-blue-500/25"
              required
            />
            <span className="text-[10px] text-slate-400 mt-1 block">
              Required. We verify this matches of uploaded National ID files inside our OCR scanners.
            </span>
          </div>

          <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest font-mono border-b border-slate-100 pb-2 pt-2">
            Step 2: Financial declarations
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">Employment Status</label>
              <select
                id="register-employment"
                value={employmentStatus}
                onChange={(e) => setEmploymentStatus(e.target.value)}
                className="w-full px-3 py-2 border border-slate-200 rounded-xl text-slate-950 text-xs bg-slate-50 focus:outline-none focus:ring-2 focus:ring-blue-500/25"
              >
                <option value="Full-Time">Full-Time Salary Contract</option>
                <option value="Part-Time">Part-Time / Temporary</option>
                <option value="Self-Employed">Self-Employed Consultant</option>
                <option value="Unemployed">Transitioning / Unemployed</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">Declared Monthly Income ($)</label>
              <input
                type="number"
                id="register-income"
                value={monthlyIncome}
                onChange={(e) => setMonthlyIncome(Number(e.target.value))}
                className="w-full px-3 py-2 border border-slate-200 rounded-xl text-slate-950 text-xs bg-slate-50 focus:outline-none focus:ring-2 focus:ring-blue-500/25"
                min="0"
                required
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-2">
              Existing Monthly Debts & Loan Expenses ($): <span className="text-indigo-600 font-extrabold">${existingDebts}</span>
            </label>
            <input
              type="range"
              id="register-debts"
              min="0"
              max="5000"
              step="50"
              value={existingDebts}
              onChange={(e) => setExistingDebts(Number(e.target.value))}
              className="w-full h-2 bg-slate-100 rounded-lg appearance-none cursor-pointer accent-indigo-600"
            />
            <div className="flex justify-between text-[10px] text-slate-400 mt-1">
              <span>$0 (Debt Free)</span>
              <span>$2,500</span>
              <span>$5,000 (Highly Leveraged)</span>
            </div>
          </div>

          <div className="bg-blue-50 border border-blue-100 rounded-xl p-3.5 flex items-start gap-2.5">
            <ShieldCheck className="w-5 h-5 text-blue-600 shrink-0 mt-0.5" />
            <p className="text-xs text-blue-800 leading-normal">
              <strong>Compliance Notice:</strong> By submitting, you authorize VeriLoan MicroFinance Group to parse uploaded documentation with Gemini OCR models to calculate risk indexes.
            </p>
          </div>

          <button
            type="submit"
            id="register-submit-btn"
            disabled={loading}
            className="w-full bg-blue-600 hover:bg-blue-500 text-white font-bold py-3.5 px-4 rounded-xl flex items-center justify-center gap-2 transition-all cursor-pointer shadow-md text-sm mt-4"
          >
            {loading ? "Registering & Grading Profile..." : "Submit Profile Registration"}
            <ArrowRight className="w-4 h-4" />
          </button>
        </form>

        <div className="text-center text-xs text-slate-500 border-t border-slate-100 pt-4">
          Already registered on file?{" "}
          <span onClick={() => onNavigate("login")} className="text-blue-600 font-bold hover:underline cursor-pointer">
            Sign in here
          </span>
        </div>
      </div>
    </div>
  );
}
