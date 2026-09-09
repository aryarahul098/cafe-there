import React, { useState } from 'react';
import { X, ArrowDownRight, ArrowUpRight, Check, CreditCard, Banknote, Smartphone, HelpCircle } from 'lucide-react';
import { Transaction, TransactionType, PaymentMethod } from '../types';

interface QuickAddModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAddTransaction: (tx: Omit<Transaction, 'id' | 'createdAt'>) => void;
  currency: string;
  defaultType?: TransactionType;
  selectedDate: string;
}

export const QuickAddModal: React.FC<QuickAddModalProps> = ({
  isOpen,
  onClose,
  onAddTransaction,
  currency,
  defaultType = 'in',
  selectedDate,
}) => {
  const [type, setType] = useState<TransactionType>(defaultType);
  const [amount, setAmount] = useState<string>('');
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('cash');
  const [notes, setNotes] = useState<string>('');
  const [receiptNumber, setReceiptNumber] = useState<string>('');
  const [date, setDate] = useState<string>(selectedDate);
  const [time, setTime] = useState<string>(
    new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: false })
  );

  if (!isOpen) return null;

  const handleTypeSwitch = (newType: TransactionType) => {
    setType(newType);
  };

  const handleAddAmount = (extra: number) => {
    const current = parseFloat(amount) || 0;
    setAmount((current + extra).toFixed(2).replace(/\.00$/, ''));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const numAmount = parseFloat(amount);
    if (!numAmount || numAmount <= 0) {
      alert('Please enter a valid amount greater than 0.');
      return;
    }

    const trimmedNotes = notes.trim();
    const fallbackCategory = type === 'in' ? 'Sales / Revenue' : 'Expense / Purchase';

    onAddTransaction({
      date,
      time: time || '12:00',
      type,
      category: trimmedNotes || fallbackCategory,
      amount: numAmount,
      paymentMethod,
      notes: trimmedNotes,
      receiptNumber: receiptNumber.trim() || undefined,
    });

    // Reset and close
    setAmount('');
    setNotes('');
    setReceiptNumber('');
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-xs animate-in fade-in duration-200">
      <div
        id="quick-add-modal"
        className="bg-stone-900 border border-stone-800 text-stone-100 rounded-2xl w-full max-w-lg shadow-2xl overflow-hidden flex flex-col max-h-[92vh]"
      >
        {/* Modal Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-stone-800 bg-stone-950/60">
          <div className="flex items-center gap-2">
            <div
              className={`w-8 h-8 rounded-lg flex items-center justify-center ${
                type === 'in' ? 'bg-emerald-500/20 text-emerald-400' : 'bg-rose-500/20 text-rose-400'
              }`}
            >
              {type === 'in' ? <ArrowDownRight className="w-5 h-5" /> : <ArrowUpRight className="w-5 h-5" />}
            </div>
            <div>
              <h2 className="text-base font-bold text-white">
                {type === 'in' ? 'Add Cash In (Sales & Revenue)' : 'Add Cash Out (Café Expense)'}
              </h2>
              <p className="text-xs text-stone-400">Record money flow directly into your daily book</p>
            </div>
          </div>
          <button
            id="close-add-modal-btn"
            onClick={onClose}
            className="text-stone-400 hover:text-white p-1 rounded-lg hover:bg-stone-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-5 overflow-y-auto">
          {/* Type Selector Pills */}
          <div className="grid grid-cols-2 gap-2 p-1 bg-stone-950 rounded-xl border border-stone-800">
            <button
              type="button"
              id="type-in-btn"
              onClick={() => handleTypeSwitch('in')}
              className={`flex items-center justify-center gap-2 py-2.5 rounded-lg text-sm font-bold transition-all ${
                type === 'in'
                  ? 'bg-emerald-600 text-white shadow-md'
                  : 'text-stone-400 hover:text-stone-200'
              }`}
            >
              <ArrowDownRight className="w-4 h-4" />
              <span>CASH IN (Sale)</span>
            </button>
            <button
              type="button"
              id="type-out-btn"
              onClick={() => handleTypeSwitch('out')}
              className={`flex items-center justify-center gap-2 py-2.5 rounded-lg text-sm font-bold transition-all ${
                type === 'out'
                  ? 'bg-rose-600 text-white shadow-md'
                  : 'text-stone-400 hover:text-stone-200'
              }`}
            >
              <ArrowUpRight className="w-4 h-4" />
              <span>CASH OUT (Expense)</span>
            </button>
          </div>

          {/* Big Amount Input */}
          <div>
            <label className="block text-xs font-semibold text-stone-300 uppercase tracking-wider mb-1.5">
              Amount ({currency})
            </label>
            <div className="relative flex items-center">
              <span className="absolute left-4 text-2xl font-bold text-stone-400">{currency}</span>
              <input
                id="transaction-amount-input"
                type="number"
                step="0.01"
                min="0.01"
                required
                autoFocus
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                placeholder="0.00"
                className="w-full bg-stone-950 border border-stone-700 focus:border-amber-400 focus:ring-2 focus:ring-amber-400/20 text-white text-3xl font-extrabold pl-11 pr-4 py-3 rounded-xl focus:outline-none tracking-tight"
              />
            </div>
            {/* Quick add chips */}
            <div className="flex gap-2 mt-2 flex-wrap items-center">
              <span className="text-xs text-stone-500 self-center">Quick +:</span>
              {(currency === '₹' ? [50, 100, 200, 500, 1000] : [5, 10, 20, 50, 100]).map((val) => (
                <button
                  key={val}
                  type="button"
                  onClick={() => handleAddAmount(val)}
                  className="px-2.5 py-1 text-xs font-semibold rounded-lg bg-stone-800 hover:bg-stone-700 text-amber-300 border border-stone-700 active:scale-95 transition-all"
                >
                  +{currency}{val}
                </button>
              ))}
            </div>
          </div>

          {/* Payment Method */}
          <div>
            <label className="block text-xs font-semibold text-stone-300 uppercase tracking-wider mb-1.5">
              Payment Method
            </label>
            <div className="grid grid-cols-4 gap-2">
              {[
                { id: 'online', label: 'UPI / QR', icon: Smartphone },
                { id: 'cash', label: 'Cash (Till)', icon: Banknote },
                { id: 'card', label: 'Card / POS', icon: CreditCard },
                { id: 'other', label: 'Other', icon: HelpCircle },
              ].map((m) => {
                const IconComponent = m.icon;
                const isSelected = paymentMethod === m.id;
                return (
                  <button
                    key={m.id}
                    type="button"
                    onClick={() => setPaymentMethod(m.id as PaymentMethod)}
                    className={`flex flex-col items-center justify-center p-2.5 rounded-xl border text-xs transition-all ${
                      isSelected
                        ? 'bg-amber-500/20 border-amber-500 text-amber-300 font-bold shadow-inner'
                        : 'bg-stone-950/60 border-stone-800 text-stone-400 hover:bg-stone-800 hover:text-stone-200'
                    }`}
                  >
                    <IconComponent className="w-4 h-4 mb-1" />
                    <span>{m.label}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Description / Note */}
          <div>
            <label className="block text-xs font-semibold text-stone-300 mb-1">
              Description / Note (Optional)
            </label>
            <input
              type="text"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder={type === 'in' ? 'e.g. Morning coffee rush, Table 4, Counter sales' : 'e.g. Amul Milk, Coffee beans, Sugar, Staff daily wage'}
              className="w-full bg-stone-950 border border-stone-700 text-stone-200 text-xs px-3 py-2.5 rounded-xl focus:outline-none focus:border-amber-400 placeholder:text-stone-600"
            />
          </div>

          {/* Date & Time */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-stone-300 mb-1">Date</label>
              <input
                type="date"
                required
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="w-full bg-stone-950 border border-stone-700 text-stone-200 text-xs px-3 py-2 rounded-xl focus:outline-none focus:border-amber-400"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-stone-300 mb-1">Time</label>
              <input
                type="time"
                value={time}
                onChange={(e) => setTime(e.target.value)}
                className="w-full bg-stone-950 border border-stone-700 text-stone-200 text-xs px-3 py-2 rounded-xl focus:outline-none focus:border-amber-400"
              />
            </div>
          </div>

          {/* Optional Bill / Receipt # */}
          <div>
            <label className="block text-xs font-medium text-stone-400 mb-1">
              Bill / Receipt # (Optional)
            </label>
            <input
              type="text"
              value={receiptNumber}
              onChange={(e) => setReceiptNumber(e.target.value)}
              placeholder="e.g. INV-1049"
              className="w-full bg-stone-950 border border-stone-700 text-stone-200 text-xs px-3 py-2 rounded-xl focus:outline-none focus:border-amber-400 placeholder:text-stone-600"
            />
          </div>

          {/* Submit Button */}
          <div className="pt-2">
            <button
              id="save-transaction-btn"
              type="submit"
              className={`w-full py-3 px-4 rounded-xl text-stone-950 font-bold text-sm flex items-center justify-center gap-2 shadow-lg transition-all active:scale-[0.98] ${
                type === 'in'
                  ? 'bg-emerald-400 hover:bg-emerald-300'
                  : 'bg-rose-400 hover:bg-rose-300'
              }`}
            >
              <Check className="w-4 h-4" />
              <span>
                Save {type === 'in' ? 'Cash In' : 'Expense'} ({currency}
                {parseFloat(amount) ? parseFloat(amount).toFixed(2) : '0.00'})
              </span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
