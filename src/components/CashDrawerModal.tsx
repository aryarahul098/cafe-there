import React, { useState } from 'react';
import { X, Banknote, CheckCircle, AlertTriangle, ShieldCheck } from 'lucide-react';
import { CashDrawerRecord } from '../types';

interface CashDrawerModalProps {
  isOpen: boolean;
  onClose: () => void;
  date: string;
  currency: string;
  drawerRecord: CashDrawerRecord;
  cashInToday: number;
  cashOutToday: number;
  onSave: (record: CashDrawerRecord) => void;
}

export const CashDrawerModal: React.FC<CashDrawerModalProps> = ({
  isOpen,
  onClose,
  date,
  currency,
  drawerRecord,
  cashInToday,
  cashOutToday,
  onSave,
}) => {
  const [openingCash, setOpeningCash] = useState<number>(drawerRecord.openingCash || 100);
  const [actualCash, setActualCash] = useState<string>(
    drawerRecord.closingCashActual !== undefined ? drawerRecord.closingCashActual.toString() : ''
  );
  const [notes, setNotes] = useState<string>(drawerRecord.notes || '');

  if (!isOpen) return null;

  const expectedClosing = openingCash + cashInToday - cashOutToday;
  const actualNum = parseFloat(actualCash);
  const difference = !isNaN(actualNum) ? actualNum - expectedClosing : null;

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    onSave({
      date,
      openingCash,
      closingCashCalculated: expectedClosing,
      closingCashActual: !isNaN(actualNum) ? actualNum : undefined,
      notes: notes.trim() || undefined,
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-xs">
      <div
        id="cash-drawer-modal"
        className="bg-stone-900 border border-stone-800 text-stone-100 rounded-2xl w-full max-w-md shadow-2xl overflow-hidden"
      >
        <div className="flex items-center justify-between px-6 py-4 border-b border-stone-800 bg-stone-950/60">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-amber-500/20 text-amber-400 flex items-center justify-center">
              <Banknote className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-white">Daily Cash Drawer Reconciliation</h2>
              <p className="text-xs text-stone-400">Match physical cash in till with your records</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-stone-400 hover:text-white p-1 rounded-lg hover:bg-stone-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSave} className="p-6 space-y-4 text-xs sm:text-sm">
          {/* Opening Cash Float */}
          <div>
            <label className="block text-xs font-semibold text-stone-300 uppercase tracking-wider mb-1">
              Morning Opening Float ({currency})
            </label>
            <p className="text-[11px] text-stone-400 mb-1.5">Starting cash change in till at opening</p>
            <input
              type="number"
              step="0.01"
              value={openingCash}
              onChange={(e) => setOpeningCash(parseFloat(e.target.value) || 0)}
              className="w-full bg-stone-950 border border-stone-700 text-amber-300 font-bold px-3 py-2 rounded-xl focus:outline-none focus:border-amber-400"
            />
          </div>

          {/* Cash flow calculation summary */}
          <div className="bg-stone-950/80 rounded-xl p-3 border border-stone-800 space-y-2 text-xs">
            <div className="flex justify-between text-stone-400">
              <span>+ Cash Sales Today:</span>
              <span className="font-semibold text-emerald-400">
                +{currency}{cashInToday.toFixed(2)}
              </span>
            </div>
            <div className="flex justify-between text-stone-400">
              <span>- Cash Paid Out (Expenses):</span>
              <span className="font-semibold text-rose-400">
                -{currency}{cashOutToday.toFixed(2)}
              </span>
            </div>
            <div className="border-t border-stone-800 pt-2 flex justify-between font-bold text-stone-200">
              <span>Expected Cash in Drawer:</span>
              <span className="text-amber-400 text-sm">
                {currency}{expectedClosing.toFixed(2)}
              </span>
            </div>
          </div>

          {/* Actual Cash Counted */}
          <div>
            <label className="block text-xs font-semibold text-stone-300 uppercase tracking-wider mb-1">
              Actual Cash Counted at Close ({currency})
            </label>
            <p className="text-[11px] text-stone-400 mb-1.5">Count all coins and bills in the drawer</p>
            <input
              type="number"
              step="0.01"
              value={actualCash}
              onChange={(e) => setActualCash(e.target.value)}
              placeholder="e.g. 195.50"
              className="w-full bg-stone-950 border border-stone-700 text-white font-bold text-base px-3 py-2 rounded-xl focus:outline-none focus:border-amber-400"
            />
          </div>

          {/* Difference Status */}
          {difference !== null && (
            <div
              className={`p-3 rounded-xl border flex items-center gap-2 text-xs ${
                Math.abs(difference) < 0.05
                  ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-300'
                  : difference > 0
                  ? 'bg-cyan-500/10 border-cyan-500/30 text-cyan-300'
                  : 'bg-rose-500/10 border-rose-500/30 text-rose-300'
              }`}
            >
              {Math.abs(difference) < 0.05 ? (
                <>
                  <ShieldCheck className="w-5 h-5 text-emerald-400 shrink-0" />
                  <div>
                    <span className="font-bold">Perfect Match!</span> The drawer is balanced to the cent.
                  </div>
                </>
              ) : difference > 0 ? (
                <>
                  <CheckCircle className="w-5 h-5 text-cyan-400 shrink-0" />
                  <div>
                    <span className="font-bold">Drawer is Over by +{currency}{difference.toFixed(2)}</span>
                    <p className="text-[11px] text-stone-400">Likely unrecorded tip or customer rounding</p>
                  </div>
                </>
              ) : (
                <>
                  <AlertTriangle className="w-5 h-5 text-rose-400 shrink-0" />
                  <div>
                    <span className="font-bold">Drawer is Short by {currency}{Math.abs(difference).toFixed(2)}</span>
                    <p className="text-[11px] text-stone-400">Check for unrecorded cash expense or change error</p>
                  </div>
                </>
              )}
            </div>
          )}

          {/* Notes */}
          <div>
            <label className="block text-xs font-semibold text-stone-300 mb-1">Reconciliation Notes (Optional)</label>
            <input
              type="text"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="e.g. Banked $150, left $100 float for tomorrow morning"
              className="w-full bg-stone-950 border border-stone-700 text-stone-200 text-xs px-3 py-2 rounded-xl focus:outline-none focus:border-amber-400"
            />
          </div>

          <div className="pt-2">
            <button
              type="submit"
              className="w-full py-2.5 rounded-xl bg-amber-400 hover:bg-amber-300 text-stone-950 font-bold text-xs flex items-center justify-center gap-1.5 transition-all shadow-md"
            >
              Save Cash Drawer Check
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
