import { useState } from "react";
import { User, NotificationRecord } from "../types";
import { Landmark, Bell, LogOut, CheckSquare, ListFilter, ShieldCheck, HelpCircle, Activity, LayoutGrid } from "lucide-react";

interface NavigationProps {
  currentUser: User | null;
  notifications: NotificationRecord[];
  onLogout: () => void;
  onNavigate: (page: string) => void;
  currentPage: string;
}

export default function Navigation({ currentUser, notifications, onLogout, onNavigate, currentPage }: NavigationProps) {
  const [showNotifications, setShowNotifications] = useState(false);
  const unreadCount = notifications.filter(n => !n.read).length;

  const getRoleIcon = (role?: string) => {
    switch (role) {
      case "customer": return <LayoutGrid className="w-4 h-4 text-blue-500" />;
      case "officer": return <ListFilter className="w-4 h-4 text-amber-500" />;
      case "manager": return <ShieldCheck className="w-4 h-4 text-emerald-500" />;
      case "admin": return <Activity className="w-4 h-4 text-purple-500" />;
      default: return null;
    }
  };

  return (
    <nav className="bg-slate-900 border-b border-slate-800 text-white font-sans sticky top-0 z-40">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          
          {/* Brand Logo */}
          <div onClick={() => onNavigate("landing")} className="flex items-center gap-2.5 cursor-pointer hover:opacity-90 select-none">
            <div className="p-2 bg-sky-500 rounded-lg text-slate-950">
              <Landmark className="w-5 h-5" />
            </div>
            <div>
              <span className="font-extrabold text-lg tracking-tight bg-gradient-to-r from-sky-400 to-teal-200 bg-clip-text text-transparent">VeriLoan</span>
              <span className="hidden sm:inline-block text-[10px] text-slate-400 uppercase font-mono tracking-widest block leading-tight">AI UNDERWRITING</span>
            </div>
          </div>

          {/* Navigation links based on active credentials */}
          <div className="hidden md:flex items-center space-x-1.5">
            <button
              onClick={() => onNavigate("landing")}
              id="nav-landing"
              className={`px-3 py-2 rounded-md text-sm font-medium transition-all cursor-pointer ${currentPage === "landing" ? "bg-slate-800 text-white" : "text-slate-300 hover:bg-slate-800/60 hover:text-white"}`}
            >
              Home
            </button>

            {currentUser && (
              <>
                {currentUser.role === "customer" && (
                  <>
                    <button
                      onClick={() => onNavigate("customer-dashboard")}
                      id="nav-customer-dashboard"
                      className={`px-3 py-2 rounded-md text-sm font-medium transition-all cursor-pointer ${currentPage === "customer-dashboard" ? "bg-slate-800 text-blue-400 font-semibold" : "text-slate-300 hover:bg-slate-800/60 hover:text-white"}`}
                    >
                      Customer Space
                    </button>
                    <button
                      onClick={() => onNavigate("loan-apply")}
                      id="nav-loan-apply"
                      className={`px-3 py-2 rounded-md text-sm font-medium transition-all cursor-pointer ${currentPage === "loan-apply" ? "bg-slate-800 text-blue-400 font-semibold" : "text-slate-300 hover:bg-slate-800/60 hover:text-white"}`}
                    >
                      Apply For Loan
                    </button>
                  </>
                )}

                {(currentUser.role === "officer" || currentUser.role === "manager" || currentUser.role === "admin") && (
                  <button
                    onClick={() => onNavigate("officer-dashboard")}
                    id="nav-officer-dashboard"
                    className={`px-3 py-2 rounded-md text-sm font-medium transition-all cursor-pointer ${currentPage === "officer-dashboard" ? "bg-slate-800 text-amber-400 font-semibold" : "text-slate-300 hover:bg-slate-800/60 hover:text-white"}`}
                  >
                    Officer Queue
                  </button>
                )}

                {(currentUser.role === "manager" || currentUser.role === "admin") && (
                  <button
                    onClick={() => onNavigate("manager-dashboard")}
                    id="nav-manager-dashboard"
                    className={`px-3 py-2 rounded-md text-sm font-medium transition-all cursor-pointer ${currentPage === "manager-dashboard" ? "bg-slate-800 text-emerald-400 font-semibold" : "text-slate-300 hover:bg-slate-800/60 hover:text-white"}`}
                  >
                    Manager Desk
                  </button>
                )}

                {currentUser.role === "admin" && (
                  <button
                    onClick={() => onNavigate("admin-dashboard")}
                    id="nav-admin-dashboard"
                    className={`px-3 py-2 rounded-md text-sm font-medium transition-all cursor-pointer ${currentPage === "admin-dashboard" ? "bg-slate-800 text-purple-400 font-semibold" : "text-slate-300 hover:bg-slate-800/60 hover:text-white"}`}
                  >
                    Admin Console
                  </button>
                )}
              </>
            )}
          </div>

          {/* User actions and profile badges */}
          <div className="flex items-center gap-4">
            {currentUser ? (
              <div className="flex items-center gap-3">
                {/* Active user tag badge */}
                <div className="hidden lg:flex flex-col items-end leading-none font-sans">
                  <span className="text-xs font-semibold text-slate-100">{currentUser.name}</span>
                  <span className="text-[10px] text-slate-400 uppercase font-mono tracking-wider mt-0.5 flex items-center gap-1">
                    {getRoleIcon(currentUser.role)}
                    {currentUser.role}
                  </span>
                </div>

                {/* Notifications center bell */}
                <div className="relative">
                  <button
                    onClick={() => setShowNotifications(!showNotifications)}
                    id="nav-bell-icon"
                    className="p-1.5 hover:bg-slate-800 rounded-lg text-slate-300 hover:text-white transition-all relative cursor-pointer"
                  >
                    <Bell className="w-5 h-5" />
                    {unreadCount > 0 && (
                      <span className="absolute top-0.5 right-0.5 bg-rose-600 text-[10px] font-bold h-4 w-4 rounded-full flex items-center justify-center text-white scale-90 origin-top-right">
                        {unreadCount}
                      </span>
                    )}
                  </button>

                  {/* Notification Dropdown Box */}
                  {showNotifications && (
                    <div id="notif-dropdown" className="absolute right-0 mt-3 w-80 bg-white rounded-xl shadow-2xl border border-slate-100 text-slate-900 overflow-hidden z-50 animate-fade-in">
                      <div className="px-4 py-3 bg-slate-50 border-b border-slate-100 flex justify-between items-center">
                        <span className="font-bold text-xs text-slate-900">Recent Alerts & AI Logs</span>
                        <span className="text-[10px] bg-blue-100 text-blue-800 px-2 py-0.5 rounded font-bold uppercase font-mono">
                          {notifications.length} Alerts
                        </span>
                      </div>
                      <div className="max-h-64 overflow-y-auto divide-y divide-slate-100">
                        {notifications.length === 0 ? (
                          <div className="px-4 py-8 text-center text-xs text-slate-400">
                            No notifications on file.
                          </div>
                        ) : (
                          notifications.map((n) => (
                            <div key={n.id} className={`p-3.5 hover:bg-slate-50 transition-all ${!n.read ? "bg-blue-50/40" : ""}`}>
                              <h4 className="font-bold text-xs text-slate-900 leading-tight block">{n.title}</h4>
                              <p className="text-xs text-slate-500 mt-1 leading-normal">{n.message}</p>
                              <span className="text-[9px] text-slate-400 uppercase font-mono block mt-1">
                                {new Date(n.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                              </span>
                            </div>
                          ))
                        )}
                      </div>
                    </div>
                  )}
                </div>

                {/* LogOut action button */}
                <button
                  onClick={onLogout}
                  id="btn-logout-nav"
                  className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 hover:text-rose-400 border border-slate-700 rounded-lg text-xs font-semibold flex items-center gap-1.5 cursor-pointer transition-all"
                  title="Log out securely"
                >
                  <LogOut className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline">Logout</span>
                </button>
              </div>
            ) : (
              <div className="flex gap-2.5">
                <button
                  onClick={() => onNavigate("login")}
                  id="nav-login-btn"
                  className="px-3.5 py-1.5 bg-slate-800 border border-slate-700 hover:bg-slate-750 hover:text-white rounded-lg text-xs font-semibold cursor-pointer transition-all"
                >
                  Sign In
                </button>
                <button
                  onClick={() => onNavigate("register")}
                  id="nav-register-btn"
                  className="px-3.5 py-1.5 bg-blue-600 hover:bg-blue-500 rounded-lg text-xs font-semibold cursor-pointer transition-all shadow-sm"
                >
                  Apply Now
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}
