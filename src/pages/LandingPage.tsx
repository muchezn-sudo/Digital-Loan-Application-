import { Landmark, Sparkles, Receipt, ShieldAlert, Award, ArrowRight, Check } from "lucide-react";
import LoanCalculator from "../components/LoanCalculator";

interface LandingPageProps {
  onNavigate: (page: string, amountPreset?: number, tenurePreset?: number) => void;
}

export default function LandingPage({ onNavigate }: LandingPageProps) {
  const loanProducts = [
    {
      title: "EcoSmart Green Mortgage",
      apr: "7.9% APR",
      limit: "$5,000 - $150,050",
      desc: "Zero emission heating, solar paneling, and wall insulation retrofits.",
      features: ["No early setup fee", "AI pre-qualification in 2 mins", "Direct contractor dispatch available"]
    },
    {
      title: "SME Commercial Accelerator",
      apr: "8.9% APR",
      limit: "$10,000 - $350,000",
      desc: "Equipment upgrade, stock replenishing, or corporate expansion workspace investments.",
      features: ["Flexible cash flow match repayments", "OCR statement processing", "Executive threshold manager sign-off"]
    },
    {
      title: "Personal Liquidity Buffer",
      apr: "9.5% APR",
      limit: "$1,000 - $25,000",
      desc: "Unsecured personal emergency bridging, education cost assist, or family travel needs.",
      features: ["Same-day bank disbursement", "Pure credit rating backing", "No collateral required"]
    }
  ];

  const handleApplyPreset = (amount: number, tenure: number) => {
    onNavigate("loan-apply", amount, tenure);
  };

  return (
    <div id="landing-page" className="min-h-screen bg-[#f1f5f9] font-sans">
      {/* Hero Section */}
      <header className="bg-gradient-to-b from-slate-900 to-slate-950 text-white py-16 px-4 md:py-24 text-center relative overflow-hidden">
        {/* Subtle grid accent background */}
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#1e293b_1px,transparent_1px),linear-gradient(to_bottom,#1e293b_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)] opacity-35"></div>

        <div className="max-w-4xl mx-auto relative z-10 space-y-6">
          <div className="inline-flex items-center gap-1.5 bg-sky-500/15 border border-sky-500/30 text-sky-300 px-3 py-1 rounded-full text-xs font-semibold uppercase tracking-wider">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Automated AI Credit Underwriting</span>
          </div>

          <h1 className="text-4xl md:text-6xl font-black tracking-tight text-white leading-tight">
            Institutional Lending <br/>
            <span className="bg-gradient-to-r from-sky-400 via-sky-300 to-teal-200 bg-clip-text text-transparent">Optimized in Microseconds</span>
          </h1>

          <p className="text-slate-300 text-sm md:text-lg max-w-2xl mx-auto leading-relaxed">
            Apply digitally with instant OCR validation of pay statements, self-updating neural credit profiles, and lightning-fast bank transfers.
          </p>

          <div className="flex flex-col sm:flex-row justify-center gap-4 pt-4">
            <button
              onClick={() => onNavigate("register")}
              id="hero-apply-btn"
              className="bg-sky-500 hover:bg-sky-400 text-slate-950 font-bold px-8 py-3.5 rounded-xl flex items-center justify-center gap-2 hover:scale-[1.01] hover:shadow-xl transition-all cursor-pointer"
            >
              <span>Initialize Loan Application</span>
              <ArrowRight className="w-4 h-4" />
            </button>
            <a
              href="#loan-calculator-box"
              id="hero-calculator-btn"
              className="bg-slate-800 hover:bg-slate-700 text-white font-semibold px-8 py-3.5 rounded-xl border border-slate-700 flex items-center justify-center"
            >
              Calculators
            </a>
          </div>
        </div>
      </header>

      {/* Feature Grids */}
      <section className="max-w-7xl mx-auto px-4 py-16">
        <div className="text-center max-w-2xl mx-auto mb-12">
          <span className="text-sky-600 font-mono text-[10px] uppercase tracking-widest font-bold">DIGITAL WORKFLOW</span>
          <h2 className="text-2xl md:text-3.5xl font-extrabold text-slate-900 tracking-tight">How VeriLoan Works</h2>
          <p className="text-slate-500 text-xs md:text-sm mt-3 leading-relaxed">
            We bypass traditional red tape with compliant optical scanners and credit verification services.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="card text-center flex flex-col items-center">
            <div className="w-12 h-12 bg-sky-50 text-sky-600 rounded-xl flex items-center justify-center mb-4 font-bold border border-sky-100">
              01
            </div>
            <h3 className="font-bold text-slate-900 text-sm md:text-base">Fast Approvals</h3>
            <p className="text-xs text-slate-500 mt-2 leading-relaxed">
              Automated score cards analyze applications, assigning key risk rankings immediately upon submission.
            </p>
          </div>

          <div className="card text-center flex flex-col items-center">
            <div className="w-12 h-12 bg-sky-50 text-sky-600 rounded-xl flex items-center justify-center mb-4 font-bold border border-sky-100">
              02
            </div>
            <h3 className="font-bold text-slate-900 text-sm md:text-base">AI Credit Underwriting</h3>
            <p className="text-xs text-slate-500 mt-2 leading-relaxed">
              We leverage Gemini models to cross-vet income statements and calculate deep debt solvency.
            </p>
          </div>

          <div className="card text-center flex flex-col items-center">
            <div className="w-12 h-12 bg-sky-50 text-sky-600 rounded-xl flex items-center justify-center mb-4 font-bold border border-sky-100">
              03
            </div>
            <h3 className="font-bold text-slate-900 text-sm md:text-base">Instant OCR Verification</h3>
            <p className="text-xs text-slate-500 mt-2 leading-relaxed">
              Drag-and-drop your National ID or Salary slip to initiate automatic mismatch and flag reports under 10 seconds.
            </p>
          </div>

          <div className="card text-center flex flex-col items-center">
            <div className="w-12 h-12 bg-indigo-50 text-indigo-600 rounded-xl flex items-center justify-center mb-4 font-bold border border-indigo-100">
              04
            </div>
            <h3 className="font-bold text-slate-900 text-sm md:text-base">Escalated Vault Guard</h3>
            <p className="text-xs text-slate-500 mt-2 leading-relaxed">
              Large loan increments ($50,050+) are automatically routed to director queues under strict access logs.
            </p>
          </div>
        </div>
      </section>

      {/* Integration Calculation Section */}
      <section id="loan-calculator-box" className="py-16 bg-[#e2e8f0]/40 border-y border-slate-200">
        <div className="max-w-7xl mx-auto px-4">
          <div className="text-center max-w-xl mx-auto mb-10">
            <span className="text-sky-600 font-mono text-[10px] uppercase tracking-widest font-bold">INTERACTIVE CALCULATOR</span>
            <h2 className="text-2xl md:text-3.5xl font-black text-slate-900">Configure Financing Parameters</h2>
            <p className="text-xs text-slate-500 mt-2">
              Slide to match your desired capital criteria. Calculations route seamlessly to our multi-step application wizard.
            </p>
          </div>
          <LoanCalculator onApplyPreset={handleApplyPreset} />
        </div>
      </section>

      {/* Loan Products Comparison */}
      <section className="max-w-7xl mx-auto px-4 py-16">
        <div className="text-center max-w-xl mx-auto mb-12">
          <span className="text-sky-600 font-mono text-[10px] uppercase tracking-widest font-bold">LOAN SUITE</span>
          <h2 className="text-2xl md:text-3.5xl font-black text-slate-900">Featured Credit Facilities</h2>
          <p className="text-xs text-slate-500 mt-2">
            Clear product disclosures. Apply with peace of mind.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {loanProducts.map((p, index) => (
            <div key={index} id={`product-card-${index}`} className="card hover:border-slate-300 transition-all flex flex-col justify-between">
              <div className="space-y-4">
                <div className="flex justify-between items-start">
                  <h3 className="font-extrabold text-slate-900 text-base leading-tight">{p.title}</h3>
                  <span className="bg-sky-50 text-sky-800 text-[10px] px-2 py-0.5 rounded-md font-bold shrink-0 border border-sky-100">{p.apr}</span>
                </div>
                <span className="text-[10px] text-slate-400 block uppercase tracking-wide font-mono font-bold">{p.limit} limit</span>
                <p className="text-xs md:text-sm text-slate-500 leading-relaxed">{p.desc}</p>

                <ul className="space-y-2 pt-2">
                  {p.features.map((feature, idx) => (
                    <li key={idx} className="flex items-center gap-2 text-xs text-slate-600">
                      <Check className="w-3.5 h-3.5 text-sky-500 shrink-0" />
                      <span>{feature}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <button
                onClick={() => handleApplyPreset(15000, 24)}
                id={`btn-product-apply-${index}`}
                className="w-full mt-6 py-2.5 bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs rounded-xl flex items-center justify-center gap-1 cursor-pointer transition-all"
              >
                <span>Select & Configure</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
