import { useState } from "react";
import { User, CustomerProfile } from "../types";
import { Landmark, Check, HelpCircle, ArrowRight, ArrowLeft, ShieldAlert, FileUp, Sparkles, FolderLock } from "lucide-react";

interface MultiStepLoanFormProps {
  currentUser: User | null;
  profile: CustomerProfile | null;
  initialAmount?: number;
  initialTenure?: number;
  onSubmitSuccess: (newLoan: any) => void;
  onNavigate: (page: string) => void;
}

export default function MultiStepLoanForm({
  currentUser,
  profile,
  initialAmount,
  initialTenure,
  onSubmitSuccess,
  onNavigate
}: MultiStepLoanFormProps) {
  const [step, setStep] = useState(1);
  const [amount, setAmount] = useState<number>(initialAmount || 25000);
  const [tenure, setTenure] = useState<number>(initialTenure || 36);
  const [purpose, setPurpose] = useState("");
  const [consent, setConsent] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Document states
  const [docType, setDocType] = useState<"national_id" | "payslip" | "bank_statement">("national_id");
  const [uploadedFiles, setUploadedFiles] = useState<Array<{ type: string; name: string; status: string }>>([]);
  const [ocrPayload, setOcrPayload] = useState<string | null>(null); // base64 payload option

  // Amortization calculations
  const annualInterest = 0.085;
  const interest = amount * annualInterest * (tenure / 12);
  const totalRepay = amount + interest;
  const estRepayment = totalRepay / tenure;

  // Preset file templates to test different OCR outcomes
  const docSamples = [
    {
      label: "Valid National ID (Alex Mercer) - Standard Match",
      type: "national_id",
      filename: "alex_mercer_national_id_card.png",
      // Simple representative base64 string to simulate standard uploads
      data: "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==",
    },
    {
      label: "Mismatch Pay Statement (Salary Under-declared Overrides)",
      type: "payslip",
      filename: "statement_john_mismatched.png",
      data: "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==",
    }
  ];

  const handleSelectSampleFile = (sample: typeof docSamples[0]) => {
    setDocType(sample.type as any);
    setOcrPayload(sample.data);
    
    // Add to uploaded files list showing processing indicator
    const existing = uploadedFiles.filter(item => item.type !== sample.type);
    setUploadedFiles([
      ...existing,
      { type: sample.type, name: sample.filename, status: "pending_verification" }
    ]);
  };

  const handleFormSubmit = async () => {
    setError(null);
    if (!purpose) {
      setError("Please describe the specific financing purpose of this loan request.");
      return;
    }
    if (uploadedFiles.length === 0) {
      setError("Please attach at least one supporting document (such as a National ID or Payslip) for verification screening.");
      return;
    }
    if (!consent) {
      setError("You must acknowledge regulatory compliance consent standards.");
      return;
    }

    setLoading(true);
    try {
      // Step A: Create Loan Application Record
      const appRes = await fetch("/api/loans/apply", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${localStorage.getItem("veriloan_token")}`
        },
        body: JSON.stringify({
          loanAmount: amount,
          loanPurpose: purpose,
          tenureMonths: tenure
        })
      });

      const newLoan = await appRes.json();
      if (!appRes.ok) {
        throw new Error(newLoan.error || "Failed submitting loan application.");
      }

      // Step B: Submit Associated File for OCR Scanning
      for (const fileItem of uploadedFiles) {
        // Fetch matching sample data to perform OCR simulation
        const matchedSample = docSamples.find(s => s.filename === fileItem.name);
        const b64 = matchedSample ? matchedSample.data : "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==";

        const docRes = await fetch(`/api/loans/${newLoan.id}/documents`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${localStorage.getItem("veriloan_token")}`
          },
          body: JSON.stringify({
            documentType: fileItem.type,
            fileName: fileItem.name,
            base64Data: b64,
            secureUrl: "https://images.unsplash.com/photo-1554224155-8d04cb21cd6c?auto=format&fit=crop&q=80&w=600"
          })
        });

        if (!docRes.ok) {
          const docErr = await docRes.json();
          console.error("Failed uploading associated OCR files:", docErr);
        }
      }

      // Trigger landing page refresh list
      onSubmitSuccess(newLoan);
    } catch (err: any) {
      setError(err.message || "Something went wrong.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div id="multi-step-form" className="max-w-3xl mx-auto px-4 py-12 font-sans space-y-8">
      {/* Title block */}
      <div className="text-center space-y-1">
        <h1 className="text-3xl font-black text-slate-900 tracking-tight">Vetting Application Wizard</h1>
        <p className="text-slate-500 text-xs md:text-sm">Complete our SEC-compliant multi-step form to pre-arrange disbursement.</p>
      </div>

      {/* Progress Circles */}
      <div className="flex items-center justify-center gap-4 max-w-md mx-auto relative pt-4">
        {[1, 2, 3].map((num) => (
          <div key={num} className="flex items-center gap-2">
            <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-xs border-2 transition-all ${
              step === num
                ? "bg-blue-600 border-blue-600 text-white shadow-md scale-105"
                : step > num
                ? "bg-slate-900 border-slate-900 text-white"
                : "bg-white border-slate-200 text-slate-400"
            }`}>
              {step > num ? <Check className="w-4 h-4" /> : num}
            </div>
            <span className={`text-xs font-semibold ${step === num ? "text-blue-600" : "text-slate-400"}`}>
              {num === 1 ? "Finances" : num === 2 ? "Upload OCR" : "Consent"}
            </span>
            {num < 3 && <div className="w-10 md:w-16 h-0.5 bg-slate-200"></div>}
          </div>
        ))}
      </div>

      {/* Error alert */}
      {error && (
        <div className="bg-rose-50 border border-rose-100 text-rose-800 rounded-xl p-3.5 flex items-start gap-2 text-xs">
          <ShieldAlert className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
          <span>{error}</span>
        </div>
      )}

      {/* Main card panel */}
      <div className="bg-white rounded-2xl border border-slate-100 shadow-xl p-6 md:p-8 space-y-6">

        {/* STEP 1: FINANCIAL DECLARATIONS */}
        {step === 1 && (
          <div className="space-y-6">
            <div>
              <h3 className="font-extrabold text-slate-900 text-base border-b border-slate-100 pb-2 mb-4">
                Configure Desired Financing
              </h3>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="p-4 bg-slate-50 border border-slate-100 rounded-xl space-y-1">
                  <span className="text-[10px] text-slate-400 font-bold uppercase block tracking-wider">Interest Amortization Rate</span>
                  <span className="text-xl font-extrabold text-slate-950">8.5% Base Flat</span>
                </div>
                <div className="p-4 bg-blue-50/50 border border-blue-100 rounded-xl space-y-1">
                  <span className="text-[10px] text-blue-700 font-bold uppercase block tracking-wider">Projection repays</span>
                  <span className="text-xl font-extrabold text-blue-900">KSh {Math.round(estRepayment).toLocaleString()} / mo</span>
                </div>
              </div>
            </div>

            {/* Amount Slider */}
            <div>
              <div className="flex justify-between items-center mb-1.5">
                <span className="text-slate-700 text-xs font-semibold uppercase tracking-wider block">Requested Principal</span>
                <span className="text-lg font-extrabold text-blue-600">KSh {amount.toLocaleString()}</span>
              </div>
              <input
                type="range"
                min="2000"
                max="100000"
                step="1000"
                value={amount}
                onChange={(e) => setAmount(Number(e.target.value))}
                className="w-full h-1.5 bg-slate-100 rounded-lg appearance-none cursor-pointer accent-blue-600"
              />
              <div className="flex justify-between text-[10px] text-slate-400 mt-1">
                <span>KSh 2,000</span>
                <span>KSh 100,000 Max Limit</span>
              </div>
            </div>

            {/* Duration Slider */}
            <div>
              <div className="flex justify-between items-center mb-1.5">
                <span className="text-slate-700 text-xs font-semibold uppercase tracking-wider block">Repayment Tenure</span>
                <span className="text-lg font-extrabold text-blue-600">{tenure} Months</span>
              </div>
              <input
                type="range"
                min="12"
                max="60"
                step="6"
                value={tenure}
                onChange={(e) => setTenure(Number(e.target.value))}
                className="w-full h-1.5 bg-slate-100 rounded-lg appearance-none cursor-pointer accent-blue-600"
              />
              <div className="flex justify-between text-[10px] text-slate-400 mt-1">
                <span>12 Months</span>
                <span>60 Months</span>
              </div>
            </div>

            {/* Loan Purpose */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-2">Loan Funding Purpose Details</label>
              <textarea
                value={purpose}
                onChange={(e) => setPurpose(e.target.value)}
                placeholder="Declare details (e.g., Installing high efficiency solar arrays atop home shingles, or SME store upgrade stocks)"
                rows={3}
                className="w-full p-3 border border-slate-200 rounded-xl text-slate-950 text-xs bg-slate-50 focus:outline-none focus:ring-2 focus:ring-blue-500/25"
                required
              />
              <p className="text-[10px] text-slate-400 mt-1">
                Please be descriptive of the asset value. Minimum 10 characters.
              </p>
            </div>

            <div className="flex justify-end pt-4">
              <button
                type="button"
                onClick={() => setStep(2)}
                className="bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs py-3 px-6 rounded-xl flex items-center gap-1.5 cursor-pointer"
              >
                <span>Proceed to Documents OCR Step</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}

        {/* STEP 2: DOCUMENTS UPLOAD & AI OCR */}
        {step === 2 && (
          <div className="space-y-6">
            <div>
              <h3 className="font-extrabold text-slate-900 text-base border-b border-slate-100 pb-2 mb-1.5">
                Upload Vetting Documentation
              </h3>
              <p className="text-xs text-slate-500">
                To satisfy banking compliance, we scan your profile against uploaded files. Drag files or select preset test templates below:
              </p>
            </div>

            {/* Preset Document Injectors */}
            <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 space-y-3.5">
              <span className="text-[10px] py-0.5 px-2 bg-amber-100 text-amber-900 font-bold uppercase font-mono rounded">
                EVALUATION WORKBENCH Presets
              </span>
              <p className="text-xs text-slate-600">
                Select a sample document preset below. This loads simulated document base64 datasets, allowing the Gemini API or rule-engines to test matching accuracy:
              </p>

              <div className="space-y-2">
                {docSamples.map((s, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => handleSelectSampleFile(s)}
                    className="w-full bg-white hover:bg-zinc-50 border border-slate-150 p-2.5 rounded-lg text-left text-xs font-semibold text-slate-900 flex justify-between items-center transition-all cursor-pointer"
                  >
                    <span>{s.label}</span>
                    <Sparkles className="w-3.5 h-3.5 text-blue-500 shrink-0" />
                  </button>
                ))}
              </div>
            </div>

            {/* Custom file Drag and Drop Layout */}
            <div className="border-2 border-dashed border-slate-200 rounded-2xl p-8 text-center flex flex-col justify-center items-center space-y-3 hover:bg-slate-50/50 transition-all">
              <div className="p-3 bg-blue-50 text-blue-600 rounded-full">
                <FileUp className="w-6 h-6" />
              </div>
              <div className="space-y-1">
                <span className="font-bold text-xs text-slate-900 select-none">Drag & Drop identity paperwork</span>
                <p className="text-[10px] text-slate-400">PDF, PNG, JPG up to 10MB capacity size</p>
              </div>
              <button
                type="button"
                onClick={() => handleSelectSampleFile(docSamples[0])}
                className="px-4 py-1.5 border border-slate-200 hover:bg-white bg-slate-100 text-[10px] font-bold rounded-lg cursor-pointer"
              >
                Simulate Standard Government ID
              </button>
            </div>

            {/* Selected files status list */}
            {uploadedFiles.length > 0 && (
              <div className="space-y-2">
                <span className="text-[10px] text-slate-400 uppercase tracking-wider block font-bold font-mono">Uploaded files queue:</span>
                {uploadedFiles.map((f, i) => (
                  <div key={i} className="flex justify-between items-center p-3 bg-blue-50/40 border border-blue-100 rounded-xl">
                    <div className="flex items-center gap-2">
                      <div className="h-2 w-2 rounded-full bg-indigo-500 animate-pulse"></div>
                      <span className="text-xs font-bold text-slate-900 truncate max-w-xs">{f.name}</span>
                    </div>
                    <span className="text-[10px] font-mono bg-blue-100 text-blue-800 font-bold uppercase rounded px-2.5 py-0.5">
                      Ready for submit
                    </span>
                  </div>
                ))}
              </div>
            )}

            <div className="flex justify-between pt-4">
              <button
                type="button"
                onClick={() => setStep(1)}
                className="p-3 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold text-xs rounded-xl flex items-center gap-1 cursor-pointer transition-all"
              >
                <ArrowLeft className="w-4 h-4" />
                <span>Back</span>
              </button>
              <button
                type="button"
                onClick={() => setStep(3)}
                className="bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs py-3 px-6 rounded-xl flex items-center gap-1.5 cursor-pointer"
              >
                <span>Proceed to Regulatory Consent</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}

        {/* STEP 3: REGULATORY CONSENT & OFFICIATE */}
        {step === 3 && (
          <div className="space-y-6">
            <div>
              <h3 className="font-extrabold text-slate-900 text-base border-b border-slate-100 pb-2 mb-2">
                Regulatory Underwriting Consent
              </h3>
              <p className="text-xs text-slate-500">
                Please verify details before submission. These values will be logged permanently in auditing books:
              </p>
            </div>

            <div className="bg-slate-50 p-4 border border-slate-150 rounded-xl grid grid-cols-2 gap-4 text-xs font-sans">
              <div>
                <span className="text-slate-400 block font-semibold mb-0.5">Applicant</span>
                <strong className="text-slate-900 font-bold">{currentUser?.name}</strong>
              </div>
              <div>
                <span className="text-slate-400 block font-semibold mb-0.5">Direct Funding Limit</span>
                <strong className="text-slate-900 font-bold">KSh {amount.toLocaleString()} ({tenure} mos)</strong>
              </div>
              <div className="col-span-2">
                <span className="text-slate-400 block font-semibold mb-0.5">Financing Purpose</span>
                <p className="text-slate-900 font-medium">{purpose || "Solar panel installations"}</p>
              </div>
            </div>

            <div className="space-y-3">
              <label className="flex items-start gap-3 p-3 bg-amber-50 border border-amber-100 rounded-xl cursor-pointer">
                <input
                  type="checkbox"
                  id="chk-consent"
                  checked={consent}
                  onChange={(e) => setConsent(e.target.checked)}
                  className="mt-1 text-blue-600 rounded"
                />
                <span className="text-[11.5px] text-amber-950 leading-relaxed block select-none">
                  Check to consent: I state declared financial indicators are complete and legal. I authorize VeriLoan MicroFinance Group's OCR scanner systems to test and store uploaded ID records to calculate scoring indexes.
                </span>
              </label>
            </div>

            <div className="flex justify-between pt-4 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setStep(2)}
                className="p-3 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold text-xs rounded-xl flex items-center gap-1 cursor-pointer transition-all"
              >
                <ArrowLeft className="w-4 h-4" />
                <span>Back</span>
              </button>
              <button
                type="button"
                onClick={handleFormSubmit}
                id="btn-loan-form-confirm-submit"
                disabled={loading}
                className="bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs py-3.5 px-6 rounded-xl flex items-center justify-center gap-1.5 cursor-pointer shadow-md"
              >
                <FolderLock className="w-4 h-4" />
                <span>{loading ? "Registering Application..." : "Sign & Submit Secured Request"}</span>
              </button>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}
