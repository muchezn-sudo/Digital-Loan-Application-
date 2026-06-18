import React, { useState } from "react";
import { Landmark, Eye, EyeOff, KeyRound, AlertCircle, ArrowRight } from "lucide-react";

interface LoginPageProps {
  onLoginSuccess: (token: string, user: any) => void;
  onNavigate: (page: string) => void;
}

export default function LoginPage({ onLoginSuccess, onNavigate }: LoginPageProps) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    if (!email || !password) {
      setError("Please fill in both email and password fields.");
      return;
    }

    setLoading(true);
    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Login action failed. Check email or password.");
      }

      onLoginSuccess(data.token, data.user);
    } catch (err: any) {
      setError(err.message || "Something went wrong.");
    } finally {
      setLoading(false);
    }
  };

  const handleQuickSeedLogin = (seededEmail: string) => {
    setEmail(seededEmail);
    setPassword("password123");
  };

  return (
    <div id="login-page" className="min-h-[80vh] flex items-center justify-center bg-slate-50 py-12 px-4 sm:px-6 lg:px-8 font-sans">
      <div className="max-w-md w-full space-y-8 bg-white p-8 rounded-2xl border border-slate-100 shadow-xl">
        
        {/* Logo and Titles */}
        <div className="text-center">
          <div className="mx-auto h-12 w-12 bg-blue-50 text-blue-600 rounded-xl flex items-center justify-center">
            <Landmark className="w-6 h-6" />
          </div>
          <h2 className="mt-4 text-3xl font-extrabold text-slate-900 tracking-tight">Welcome Back</h2>
          <p className="mt-2 text-xs text-slate-500">
            Access secure credit portfolios, OCR document tables, and audit ledgers.
          </p>
        </div>

        {error && (
          <div className="bg-rose-50 border border-rose-100 text-rose-800 rounded-xl p-3.5 flex items-start gap-2 text-xs">
            <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
            <span>{error}</span>
          </div>
        )}

        <form className="mt-6 space-y-4" onSubmit={handleSubmit}>
          <div>
            <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">Email Address</label>
            <input
              type="email"
              id="login-email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="customer@veriloan.com"
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-slate-950 text-xs focus:outline-none focus:ring-2 focus:ring-blue-500/25 bg-slate-50"
              required
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">Password</label>
            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                id="login-password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full pl-3.5 pr-10 py-2.5 rounded-xl border border-slate-200 text-slate-950 text-xs focus:outline-none focus:ring-2 focus:ring-blue-500/25 bg-slate-50"
                required
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                id="login-toggle-password"
                className="absolute inset-y-0 right-3 flex items-center text-slate-400 hover:text-slate-600 cursor-pointer"
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          <div className="flex items-center justify-between text-xs pt-1">
            <div className="flex items-center gap-1.5">
              <input type="checkbox" id="login-remember" className="rounded text-blue-500" />
              <label htmlFor="login-remember" className="text-slate-600">Keep me logged in</label>
            </div>
            <span onClick={() => alert("Credentials for seed testing: Password for all seed users is 'password123'")} className="text-blue-600 hover:underline cursor-pointer">
              Forgot Password?
            </span>
          </div>

          <button
            type="submit"
            id="btn-login-submit"
            disabled={loading}
            className="w-full bg-blue-600 hover:bg-blue-500 text-white font-bold py-3 px-4 rounded-xl flex items-center justify-center gap-2 transition-all cursor-pointer shadow-md mt-6"
          >
            {loading ? "Authenticating Persona..." : "Sign In Securely"}
            <ArrowRight className="w-4 h-4" />
          </button>
        </form>

        {/* Quick Testing Personas Box */}
        <div className="border-t border-slate-100 pt-6 mt-6 space-y-3">
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block font-mono text-center">
            PERSONA QUICK LOGIN CREDENTIALS
          </span>
          <div className="grid grid-cols-2 gap-2 text-xs">
            <button
              onClick={() => handleQuickSeedLogin("customer@veriloan.com")}
              className="p-2 border border-slate-150 rounded-lg hover:bg-slate-50 text-left cursor-pointer"
            >
              <strong className="block text-slate-950 font-bold">Alex Mercer</strong>
              <span className="text-[10px] text-blue-600">customer@veriloan.com</span>
            </button>
            <button
              onClick={() => handleQuickSeedLogin("officer@veriloan.com")}
              className="p-2 border border-slate-150 rounded-lg hover:bg-slate-50 text-left cursor-pointer"
            >
              <strong className="block text-slate-950 font-bold">Sarah Connor</strong>
              <span className="text-[10px] text-amber-600">officer@veriloan.com</span>
            </button>
            <button
              onClick={() => handleQuickSeedLogin("manager@veriloan.com")}
              className="p-2 border border-slate-150 rounded-lg hover:bg-slate-50 text-left cursor-pointer"
            >
              <strong className="block text-slate-950 font-bold">Bruce Wayne</strong>
              <span className="text-[10px] text-emerald-600">manager@veriloan.com</span>
            </button>
            <button
              onClick={() => handleQuickSeedLogin("admin@veriloan.com")}
              className="p-2 border border-slate-150 rounded-lg hover:bg-slate-50 text-left cursor-pointer"
            >
              <strong className="block text-slate-950 font-bold">Clark Kent</strong>
              <span className="text-[10px] text-purple-600">admin@veriloan.com</span>
            </button>
          </div>
          <p className="text-[10px] text-center text-amber-800 bg-amber-50 p-1.5 rounded-lg">
            Password: <strong>password123</strong> for all accounts.
          </p>
        </div>

        <div className="text-center text-xs text-slate-500 pt-2">
          New client profile?{" "}
          <span onClick={() => onNavigate("register")} className="text-blue-600 font-bold hover:underline cursor-pointer">
            Create account
          </span>
        </div>
      </div>
    </div>
  );
}
