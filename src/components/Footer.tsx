import { Landmark, Shield, FileText, CheckCircle } from "lucide-react";

export default function Footer() {
  return (
    <footer className="bg-slate-900 text-slate-400 font-sans border-t border-slate-800 py-10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <div className="p-1.5 bg-blue-600 rounded text-white text-xs">
                <Landmark className="w-4 h-4" />
              </div>
              <span className="font-extrabold text-white text-base">VeriLoan Instituional</span>
            </div>
            <p className="text-xs leading-normal">
              Empowering global consumers and SMEs with instant, transparent capital, powered by verified document intelligence models.
            </p>
          </div>

          <div>
            <h4 className="text-xs font-bold text-white uppercase tracking-wider mb-3">Core Offerings</h4>
            <ul className="space-y-1.5 text-xs">
              <li><a href="#" className="hover:text-blue-400">Green Solar Home Retrofits</a></li>
              <li><a href="#" className="hover:text-blue-400">SME Capital Growth Facility</a></li>
              <li><a href="#" className="hover:text-blue-400">Personal Emergency Liquidity</a></li>
              <li><a href="#" className="hover:text-blue-400">Education Support Financing</a></li>
            </ul>
          </div>

          <div>
            <h4 className="text-xs font-bold text-white uppercase tracking-wider mb-3">System Features</h4>
            <ul className="space-y-1.5 text-xs">
              <li className="flex items-center gap-1.5">
                <CheckCircle className="w-3 h-3 text-emerald-500 shrink-0" />
                <span>Gemini API Credit Underwriting</span>
              </li>
              <li className="flex items-center gap-1.5">
                <CheckCircle className="w-3 h-3 text-emerald-500 shrink-0" />
                <span>Real-time Document OCR Parser</span>
              </li>
              <li className="flex items-center gap-1.5">
                <CheckCircle className="w-3 h-3 text-emerald-500 shrink-0" />
                <span>Durable Local Persistence (No Mocks)</span>
              </li>
            </ul>
          </div>

          <div>
            <h4 className="text-xs font-bold text-white uppercase tracking-wider mb-3">Compliance & Security</h4>
            <div className="space-y-2 text-xs leading-normal">
              <div className="flex gap-2">
                <Shield className="w-5 h-5 text-blue-500 shrink-0 mt-0.5" />
                <p>Fully compliant with WCAG design standards and secure file transfer policies.</p>
              </div>
              <div className="flex gap-2">
                <FileText className="w-5 h-5 text-blue-500 shrink-0 mt-0.5" />
                <p>Finacing rates set dynamically under state banking board regulations.</p>
              </div>
            </div>
          </div>
        </div>

        <div className="mt-8 pt-8 border-t border-slate-800/80 text-center text-xs text-slate-500 flex flex-col sm:flex-row justify-between items-center gap-4">
          <p>© 2026 VeriLoan MicroFinance Group Inc. All rights reserved.</p>
          <div className="flex gap-4">
            <span className="hover:text-slate-300 cursor-pointer">Privacy Charter</span>
            <span className="hover:text-slate-300 cursor-pointer">Terms of Service</span>
            <span className="hover:text-slate-300 cursor-pointer">Regulatory Disclosures</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
