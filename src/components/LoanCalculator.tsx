import { useState } from "react";
import { Calculator, ArrowRight, Star } from "lucide-react";

interface LoanCalculatorProps {
  onApplyPreset: (amount: number, tenure: number) => void;
}

export default function LoanCalculator({ onApplyPreset }: LoanCalculatorProps) {
  const [amount, setAmount] = useState<number>(25000);
  const [tenure, setTenure] = useState<number>(36);
  const annualInterest = 0.085; // 8.5% Base Interest

  const calculatedInterest = amount * annualInterest * (tenure / 12);
  const totalRepayment = amount + calculatedInterest;
  const monthlyRepayment = totalRepayment / tenure;

  return (
    <div id="loan-calculator" className="bg-white rounded-2xl shadow-xl border border-slate-100 p-6 md:p-8 max-w-2xl mx-auto font-sans">
      <div className="flex items-center gap-3 mb-6">
        <div className="p-3 bg-blue-50 text-blue-600 rounded-xl">
          <Calculator className="w-6 h-6" />
        </div>
        <div>
          <h3 className="text-xl font-bold text-slate-900">Interactive Loan Calculator</h3>
          <p className="text-sm text-slate-500">Calculate estimated monthly fees at our premium 8.5% annual rate.</p>
        </div>
      </div>

      <div className="space-y-6">
        {/* Amount Slider */}
        <div>
          <div className="flex justify-between items-center mb-2">
            <span className="text-slate-700 font-medium">Desired Loan Amount</span>
            <span className="text-xl font-extrabold text-blue-600">${amount.toLocaleString()}</span>
          </div>
          <input
            type="range"
            id="slider-amount"
            min="1000"
            max="150000"
            step="1000"
            value={amount}
            onChange={(e) => setAmount(Number(e.target.value))}
            className="w-full h-2 bg-slate-100 rounded-lg appearance-none cursor-pointer accent-blue-600"
          />
          <div className="flex justify-between text-xs text-slate-400 mt-1">
            <span>$1,000</span>
            <span>$75,000</span>
            <span>$150,000</span>
          </div>
        </div>

        {/* Tenure Slider */}
        <div>
          <div className="flex justify-between items-center mb-2">
            <span className="text-slate-700 font-medium">Repayment Duration</span>
            <span className="text-xl font-extrabold text-blue-600">{tenure} Months</span>
          </div>
          <input
            type="range"
            id="slider-tenure"
            min="6"
            max="60"
            step="6"
            value={tenure}
            onChange={(e) => setTenure(Number(e.target.value))}
            className="w-full h-2 bg-slate-100 rounded-lg appearance-none cursor-pointer accent-blue-600"
          />
          <div className="flex justify-between text-xs text-slate-400 mt-1">
            <span>6 Months</span>
            <span>30 Months</span>
            <span>60 Months</span>
          </div>
        </div>
      </div>

      {/* Estimates Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-8 pt-6 border-t border-slate-100">
        <div className="bg-slate-50 p-4 rounded-xl">
          <span className="text-xs text-slate-500 font-semibold uppercase tracking-wider block">Estimated Monthly Fee</span>
          <span className="text-2xl font-black text-slate-950">${monthlyRepayment.toFixed(2)}</span>
          <span className="text-xs text-slate-400 block mt-1">Principal + interest combined</span>
        </div>
        <div className="bg-blue-50/50 p-4 rounded-xl">
          <span className="text-xs text-blue-800 font-semibold uppercase tracking-wider block">Total Interest Margin</span>
          <span className="text-2xl font-black text-blue-900">${calculatedInterest.toLocaleString(undefined, { maximumFractionDigits: 2 })}</span>
          <span className="text-xs text-blue-700 block mt-1">8.5% flat financing rate</span>
        </div>
      </div>

      <div className="bg-amber-50 border border-amber-100 rounded-xl p-3 flex items-start gap-2.5 mt-5">
        <Star className="w-5 h-5 text-amber-500 shrink-0 mt-0.5" fill="currentColor" />
        <p className="text-xs text-amber-800 leading-normal">
          <strong>AI Guard Check:</strong> Rates shown are highly representative. Our underwriting models will review debt levels and OCR documents to lock in custom micro-reductions.
        </p>
      </div>

      <button
        type="button"
        id="btn-calculator-apply"
        onClick={() => onApplyPreset(amount, tenure)}
        className="w-full mt-6 bg-slate-900 hover:bg-slate-850 text-white font-bold py-3 px-6 rounded-xl flex items-center justify-center gap-2 hover:scale-[1.01] hover:shadow-lg transition-all cursor-pointer"
      >
        <span>Apply Now with This Calculation</span>
        <ArrowRight className="w-4 h-4" />
      </button>
    </div>
  );
}
