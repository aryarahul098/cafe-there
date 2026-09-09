import React from 'react';
import {
  X,
  BookOpen,
  Coffee,
  CheckCircle2,
  Calendar,
  Banknote,
  FileSpreadsheet,
  Download,
  Smartphone,
  TrendingUp,
  Target,
  Sparkles,
} from 'lucide-react';

interface HowToUseModalProps {
  isOpen: boolean;
  onClose: () => void;
  cafeName: string;
  currency: string;
}

export const HowToUseModal: React.FC<HowToUseModalProps> = ({
  isOpen,
  onClose,
  cafeName,
  currency,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-xs animate-in fade-in duration-200">
      <div
        id="how-to-use-modal"
        className="bg-stone-900 border border-amber-500/40 text-stone-100 rounded-3xl w-full max-w-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]"
      >
        {/* Modal Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-stone-800 bg-stone-950/80">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-500/20 text-amber-400 border border-amber-500/30 flex items-center justify-center shrink-0">
              <BookOpen className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-bold text-white flex items-center gap-2">
                <span>How to Use {cafeName} Tracker</span>
                <span className="text-[10px] font-extrabold uppercase px-2 py-0.5 rounded-full bg-amber-400 text-stone-950">
                  Daily Guide
                </span>
              </h2>
              <p className="text-xs text-stone-400">Everything you need to master your café cash flow &amp; profits</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-stone-400 hover:text-white p-1.5 rounded-lg hover:bg-stone-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 space-y-6 overflow-y-auto text-xs sm:text-sm">
          {/* Section 1: What is this? */}
          <div className="bg-stone-950/70 border border-stone-800 rounded-2xl p-4 sm:p-5 space-y-2">
            <div className="flex items-center gap-2 text-amber-400 font-bold text-sm">
              <Coffee className="w-4 h-4" />
              <span>1. What is this? (Cash Flow vs. Traditional Accounting)</span>
            </div>
            <p className="text-stone-300 leading-relaxed">
              This is a purpose-built <b>Cash Flow &amp; Daily Net Profit Tracker</b> for <b>{cafeName}</b>.
              Traditional accounting uses confusing debits, credits, and balance sheets that take hours. Here, it is simple:
            </p>
            <div className="p-3 bg-stone-900 rounded-xl border border-stone-800 font-mono text-xs text-amber-300 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-1">
              <span><b>Cash In</b> (Customer sales)</span>
              <span>—</span>
              <span><b>Cash Out</b> (Milk, beans, packaging, wages)</span>
              <span>=</span>
              <span className="text-emerald-400 font-bold"><b>Net Profit</b></span>
            </div>
          </div>

          {/* Section 2: Daily Workflow */}
          <div className="space-y-3">
            <div className="flex items-center gap-2 text-emerald-400 font-bold text-sm">
              <Calendar className="w-4 h-4" />
              <span>2. How to Use This Daily (3 Simple Steps)</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {/* Step 1 */}
              <div className="bg-stone-950/70 border border-stone-800 rounded-2xl p-4 space-y-2">
                <div className="w-6 h-6 rounded-full bg-amber-500 text-stone-950 font-extrabold flex items-center justify-center text-xs">
                  1
                </div>
                <h4 className="font-bold text-white text-xs">Morning: Open Register</h4>
                <p className="text-stone-400 text-[11px] leading-relaxed">
                  Click <b>"Till Check"</b>. Enter your morning starting cash float in the register/galla (e.g. {currency}2,000).
                </p>
              </div>

              {/* Step 2 */}
              <div className="bg-stone-950/70 border border-stone-800 rounded-2xl p-4 space-y-2">
                <div className="w-6 h-6 rounded-full bg-emerald-500 text-stone-950 font-extrabold flex items-center justify-center text-xs">
                  2
                </div>
                <h4 className="font-bold text-white text-xs">Daytime: Log In &amp; Out</h4>
                <p className="text-stone-400 text-[11px] leading-relaxed">
                  Tap <b>"+ Cash In"</b> for sales or <b>"- Expense"</b> when buying milk, ice, or paying staff. Tag by <b>UPI / QR</b>, <b>Cash</b>, or <b>Card</b>.
                </p>
              </div>

              {/* Step 3 */}
              <div className="bg-stone-950/70 border border-stone-800 rounded-2xl p-4 space-y-2">
                <div className="w-6 h-6 rounded-full bg-cyan-500 text-stone-950 font-extrabold flex items-center justify-center text-xs">
                  3
                </div>
                <h4 className="font-bold text-white text-xs">Evening: Close Till &amp; Check Target</h4>
                <p className="text-stone-400 text-[11px] leading-relaxed">
                  Count the cash in your drawer, enter it in <b>"Till Check"</b> to verify no money is missing. Then check <b>Target Profit</b> to celebrate today's numbers!
                </p>
              </div>
            </div>
          </div>

          {/* Section 3: How to Access Your Data Daily */}
          <div className="space-y-3">
            <div className="flex items-center gap-2 text-cyan-400 font-bold text-sm">
              <FileSpreadsheet className="w-4 h-4" />
              <span>3. How Can I Access My Data Daily?</span>
            </div>

            <div className="space-y-2.5">
              <div className="flex items-start gap-3 p-3.5 bg-stone-950/70 border border-stone-800 rounded-xl">
                <Smartphone className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
                <div className="space-y-1 text-xs">
                  <span className="font-bold text-white block">Instant On-Device Storage (Always Offline-Ready)</span>
                  <p className="text-stone-400 text-[11px]">
                    Every single transaction is automatically saved to your device’s local browser storage. Refreshing the browser or opening it tomorrow retains your entire history without needing to create an account.
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3 p-3.5 bg-stone-950/70 border border-stone-800 rounded-xl">
                <FileSpreadsheet className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
                <div className="space-y-1 text-xs">
                  <span className="font-bold text-white block">1-Click Live Google Sheets Sync</span>
                  <p className="text-stone-400 text-[11px]">
                    Go to the <b>"Google Sheets Sync"</b> tab. Click <b>"Sign in with Google"</b> and <b>"Create My Café Google Sheet"</b>. The app will create a formatted spreadsheet on your Google Drive with <i>"Cash Flow Log"</i> and <i>"Daily Profit &amp; Targets"</i> tabs, accessible from your mobile phone, tablet, or laptop anywhere!
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3 p-3.5 bg-stone-950/70 border border-stone-800 rounded-xl">
                <Download className="w-5 h-5 text-cyan-400 shrink-0 mt-0.5" />
                <div className="space-y-1 text-xs">
                  <span className="font-bold text-white block">Download Offline Excel / CSV</span>
                  <p className="text-stone-400 text-[11px]">
                    Under the Google Sheets tab, click <b>"Download CSV File"</b> at any time to export your full transactions directly into Microsoft Excel or share with your chartered accountant / bookkeeper.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="px-6 py-3 bg-stone-950 border-t border-stone-800 flex justify-end">
          <button
            id="close-guide-btn"
            onClick={onClose}
            className="px-5 py-2.5 rounded-xl bg-amber-400 hover:bg-amber-300 text-stone-950 font-bold text-xs shadow transition-all active:scale-95"
          >
            Got It, Let's Track! ☕
          </button>
        </div>
      </div>
    </div>
  );
};
