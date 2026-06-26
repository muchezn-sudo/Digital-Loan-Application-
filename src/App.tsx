import { useEffect, useState } from "react";
import { User, LoanApplication, CustomerProfile, NotificationRecord } from "./types";
import RoleSwitcher from "./components/RoleSwitcher";
import Navigation from "./components/Navigation";
import Footer from "./components/Footer";

// Pages
import LandingPage from "./pages/LandingPage";
import LoginPage from "./pages/LoginPage";
import RegisterPage from "./pages/RegisterPage";
import CustomerDashboard from "./pages/CustomerDashboard";
import MultiStepLoanForm from "./pages/MultiStepLoanForm";
import LoanTrackerPage from "./pages/LoanTrackerPage";
import OfficerDashboard from "./pages/OfficerDashboard";
import ManagerDashboard from "./pages/ManagerDashboard";
import AdminDashboard from "./pages/AdminDashboard";

export default function App() {
  const [currentPage, setCurrentPage] = useState<string>("landing");
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<CustomerProfile | null>(null);
  const [loans, setLoans] = useState<LoanApplication[]>([]);
  const [notifications, setNotifications] = useState<NotificationRecord[]>([]);
  const [selectedContextId, setSelectedContextId] = useState<string | null>(null);

  // Transfer presets from Lander calculator
  const [amountPreset, setAmountPreset] = useState<number | undefined>(undefined);
  const [tenurePreset, setTenurePreset] = useState<number | undefined>(undefined);

  // Restore session token on load
  const restoreSession = async (shouldRedirectOnSuccess = false) => {
    const token = localStorage.getItem("veriloan_token");
    if (!token) {
      setCurrentUser(null);
      setProfile(null);
      return;
    }

    try {
      const res = await fetch("/api/auth/me", {
        headers: { "Authorization": `Bearer ${token}` }
      });
      if (res.ok) {
        const data = await res.json();
        setCurrentUser(data.user);
        setProfile(data.profile || null);
        
        // Sync role-specific records on boot
        if (data.user.role === "customer") {
          fetchMyLoans(token);
          fetchNotifications(token);
        }

        // Auto-redirect to appropriate dashboard if user is currently on guest/landing screens
        if (shouldRedirectOnSuccess) {
          if (data.user.role === "customer") {
            setCurrentPage("customer-dashboard");
          } else if (data.user.role === "officer") {
            setCurrentPage("officer-dashboard");
          } else if (data.user.role === "manager") {
            setCurrentPage("manager-dashboard");
          } else if (data.user.role === "admin") {
            setCurrentPage("admin-dashboard");
          }
        }
      } else {
        // ONLY clear credentials if server explicitly rejects with a 401/403 (unauthorized/invalid token).
        // If the server returns a 502/504, we are offline/starting up and should keep our token.
        if (res.status === 401 || res.status === 403) {
          localStorage.removeItem("veriloan_token");
          setCurrentUser(null);
          setProfile(null);
        }
      }
    } catch (e) {
      console.warn("Offline/reconnecting restore session error:", e);
    }
  };

  useEffect(() => {
    restoreSession(true);
  }, []);

  const fetchMyLoans = async (token: string) => {
    try {
      const res = await fetch("/api/loans/my-applications", {
        headers: { "Authorization": `Bearer ${token}` }
      });
      if (res.ok) {
        const list = await res.json();
        setLoans(list);
      }
    } catch (e) {
      console.error(e);
    }
  };

  const fetchNotifications = async (token: string) => {
    try {
      const res = await fetch("/api/notifications", {
        headers: { "Authorization": `Bearer ${token}` }
      });
      if (res.ok) {
        const list = await res.json();
        setNotifications(list);
      }
    } catch (e) {
      console.error(e);
    }
  };

  const handleLoginSuccess = async (token: string, user: User) => {
    localStorage.setItem("veriloan_token", token);
    setCurrentUser(user);
    
    // Route role specific workspace dashboards IMMEDIATELY (no blocking)
    if (user.role === "customer") {
      setCurrentPage("customer-dashboard");
    } else if (user.role === "officer") {
      setCurrentPage("officer-dashboard");
    } else if (user.role === "manager") {
      setCurrentPage("manager-dashboard");
    } else if (user.role === "admin") {
      setCurrentPage("admin-dashboard");
    } else {
      setCurrentPage("landing");
    }

    // Sync any supplementary session details in the background without blocking the UI login transitions
    try {
      const res = await fetch("/api/auth/me", {
        headers: { "Authorization": `Bearer ${token}` }
      });
      if (res.ok) {
        const data = await res.json();
        setCurrentUser(data.user);
        setProfile(data.profile || null);
        
        if (data.user.role === "customer") {
          fetchMyLoans(token);
          fetchNotifications(token);
        }
      }
    } catch (e) {
      console.warn("Failed background user sync:", e);
    }
  };

  const handleRegisterSuccess = async (token: string, user: User) => {
    localStorage.setItem("veriloan_token", token);
    setCurrentUser(user);
    setCurrentPage("customer-dashboard");

    try {
      const res = await fetch("/api/auth/me", {
        headers: { "Authorization": `Bearer ${token}` }
      });
      if (res.ok) {
        const data = await res.json();
        setCurrentUser(data.user);
        setProfile(data.profile || null);
      }
    } catch (e) {
      console.warn("Failed background profile registration sync:", e);
    }
  };

  const handleLogout = async () => {
    const token = localStorage.getItem("veriloan_token");
    if (token) {
      try {
        await fetch("/api/auth/logout", {
          method: "POST",
          headers: { "Authorization": `Bearer ${token}` }
        });
      } catch (e) {
        console.warn(e);
      }
    }
    localStorage.removeItem("veriloan_token");
    setCurrentUser(null);
    setProfile(null);
    setLoans([]);
    setNotifications([]);
    setSelectedContextId(null);
    setCurrentPage("landing");
  };

  // Vetting Switcher Persona Login Logic
  const handleSwitchUser = async (email: string) => {
    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password: "password123" }) // Seed password
      });

      if (res.ok) {
        const data = await res.json();
        await handleLoginSuccess(data.token, data.user);
      } else {
        alert("Failed shifting credentials session index.");
      }
    } catch (err: any) {
      alert(err.message || "Credential switch failure.");
    }
  };

  // Submission Wizard finished
  const handleLoanSubmissionSuccess = (newLoan: any) => {
    const token = localStorage.getItem("veriloan_token") || "";
    fetchMyLoans(token);
    fetchNotifications(token);
    setSelectedContextId(newLoan.id);
    setCurrentPage("loan-track");
  };

  // Nav router supporting slider overrides
  const handleNavigate = (targetPage: string, amountPresetTerm?: number, tenurePresetTerm?: number) => {
    if (amountPresetTerm && tenurePresetTerm) {
      setAmountPreset(amountPresetTerm);
      setTenurePreset(tenurePresetTerm);
    } else {
      setAmountPreset(undefined);
      setTenurePreset(undefined);
    }
    
    // Save details on specific transitions
    if (targetPage.startsWith("loan-track") || targetPage.startsWith("loan-upload-docs")) {
      // Split ID matching
      const parts = targetPage.split("/");
      if (parts[1]) {
        setSelectedContextId(parts[1]);
        setCurrentPage(parts[0]);
        return;
      }
    }

    // Standard redirect boundaries
    if (targetPage === "loan-track" && amountPresetTerm) {
      setSelectedContextId(amountPresetTerm.toString()); // Context override helper
      setCurrentPage("loan-track");
      return;
    }

    setCurrentPage(targetPage);
  };

  // Deep status tracking link
  const handleRowSelectNavigate = (targetPage: string, contextId?: string) => {
    if (contextId) {
      setSelectedContextId(contextId);
    }
    setCurrentPage(targetPage);
  };

  return (
    <div className="flex flex-col min-h-screen bg-[#f1f5f9] text-slate-900 selection:bg-blue-600/10 selection:text-blue-600">
      
      {/* Testing console bar */}
      <RoleSwitcher currentUser={currentUser} onSwitchUser={handleSwitchUser} />

      {/* Responsive Navigation */}
      <Navigation
        currentUser={currentUser}
        notifications={notifications}
        onLogout={handleLogout}
        onNavigate={handleNavigate}
        currentPage={currentPage}
      />

      {/* Core Pages Gateway Router */}
      <main className="flex-grow">
        {currentPage === "landing" && (
          <LandingPage onNavigate={handleNavigate} />
        )}

        {currentPage === "login" && (
          <LoginPage onLoginSuccess={handleLoginSuccess} onNavigate={handleNavigate} />
        )}

        {currentPage === "register" && (
          <RegisterPage onRegisterSuccess={handleRegisterSuccess} onNavigate={handleNavigate} />
        )}

        {currentPage === "customer-dashboard" && (
          <CustomerDashboard
            currentUser={currentUser}
            profile={profile}
            loans={loans}
            onNavigate={handleRowSelectNavigate}
          />
        )}

        {currentPage === "loan-apply" && (
          <MultiStepLoanForm
            currentUser={currentUser}
            profile={profile}
            initialAmount={amountPreset}
            initialTenure={tenurePreset}
            onSubmitSuccess={handleLoanSubmissionSuccess}
            onNavigate={handleNavigate}
          />
        )}

        {currentPage === "loan-track" && selectedContextId && (
          <LoanTrackerPage
            loanId={selectedContextId}
            onNavigate={handleNavigate}
          />
        )}

        {currentPage === "officer-dashboard" && (
          <OfficerDashboard
            currentUser={currentUser}
            onNavigate={handleRowSelectNavigate}
          />
        )}

        {currentPage === "manager-dashboard" && (
          <ManagerDashboard
            currentUser={currentUser}
            onNavigate={handleRowSelectNavigate}
          />
        )}

        {currentPage === "admin-dashboard" && (
          <AdminDashboard />
        )}
      </main>

      {/* Consistent styling Footer */}
      <Footer />
    </div>
  );
}
