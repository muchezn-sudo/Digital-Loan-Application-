import { LogIn, HelpCircle } from "lucide-react";
import { User } from "../types";

interface RoleSwitcherProps {
  currentUser: User | null;
  onSwitchUser: (email: string) => void;
}

export default function RoleSwitcher({ currentUser, onSwitchUser }: RoleSwitcherProps) {
  const seedUsers = [
    { name: "Alex Mercer", email: "customer@veriloan.com", role: "customer", desc: "Customer Account" },
    { name: "Sarah Connor", email: "officer@veriloan.com", role: "officer", desc: "Senior Loan Officer" },
    { name: "Bruce Wayne", email: "manager@veriloan.com", role: "manager", desc: "Executive Director" },
    { name: "Clark Kent", email: "admin@veriloan.com", role: "admin", desc: "System Administrator" },
  ];

  return (
    <div id="role-switcher-panel" className="bg-amber-50 border-y border-amber-200 py-2.5 px-4 text-xs font-sans text-amber-900">
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <span className="flex h-2 w-2 rounded-full bg-amber-500 animate-pulse"></span>
          <span className="font-semibold text-amber-950">Vetting Testing Console:</span>
          <p className="text-amber-800">
            Switch banking personas below to test automated OCR comparisons, risk assessments, escalations, or audits instantly.
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          {seedUsers.map((u) => {
            const isActive = currentUser && currentUser.email === u.email;
            return (
              <button
                key={u.email}
                onClick={() => onSwitchUser(u.email)}
                id={`btn-switch-${u.role}`}
                className={`px-3 py-1.5 rounded-md font-medium transition-all cursor-pointer flex items-center gap-1 ${
                  isActive
                    ? "bg-amber-600 text-white shadow-sm ring-2 ring-amber-300 scale-105"
                    : "bg-white hover:bg-amber-100 border border-amber-200 text-amber-950 text-xs"
                }`}
              >
                <LogIn className="w-3.5 h-3.5" />
                <span>{u.name} ({u.role})</span>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
