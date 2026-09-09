import React, { useState, useMemo } from 'react';
import {
  ArrowDownRight,
  ArrowUpRight,
  TrendingUp,
  Banknote,
  Plus,
  Minus,
  Search,
  ChevronLeft,
  ChevronRight,
  Calendar,
  Trash2,
  Receipt,
  CreditCard,
  Smartphone,
  AlertCircle,
  HelpCircle,
} from 'lucide-react';
import { Transaction, TargetConfig, CashDrawerRecord, TransactionType } from '../types';

interface CashFlowViewProps {
  transactions: Transaction[];
  selectedDate: string;
  setSelectedDate: (date: string) => void;
  targetConfig: TargetConfig;
  onOpenAddModal: (type: TransactionType) => void;
  onOpenDrawerModal: () => void;
  onDeleteTransaction: (id: string) => void;
  drawerRecord: CashDrawerRecord;
}

export const CashFlowView: React.FC<CashFlowViewProps> = ({
  transactions,
  selectedDate,
  setSelectedDate,
  targetConfig,
  onOpenAddModal,
  onOpenDrawerModal,
  onDeleteTransaction,
  drawerRecord,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [filterType, setFilterType] = useState<'all' | 'in' | 'out'>('all');
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);

  // Filter transactions for selected day
  const dayTransactions = useMemo(() => {
    return transactions
      .filter((t) => t.date === selectedDate)
      .sort((a, b) => b.createdAt - a.createdAt);
  }, [transactions, selectedDate]);

  // Daily totals
  const { totalIn, totalOut, netProfit, cashIn, cardIn, onlineIn, cashOut } = useMemo(() => {
    let tIn = 0;
    let tOut = 0;
    let cIn = 0;
    let cdIn = 0;
    let oIn = 0;
    let cOut = 0;

    for (const t of dayTransactions) {
      if (t.type === 'in') {
        tIn += t.amount;
        if (t.paymentMethod === 'cash') cIn += t.amount;
        else if (t.paymentMethod === 'card') cdIn += t.amount;
        else if (t.paymentMethod === 'online') oIn += t.amount;
      } else {
        tOut += t.amount;
        if (t.paymentMethod === 'cash') cOut += t.amount;
      }
    }
    return {
      totalIn: tIn,
      totalOut: tOut,
      netProfit: tIn - tOut,
      cashIn: cIn,
      cardIn: cdIn,
      onlineIn: oIn,
      cashOut: cOut,
    };
  }, [dayTransactions]);

  // Expected drawer balance
  const expectedTill = (drawerRecord.openingCash !== undefined ? drawerRecord.openingCash : 2000) + cashIn - cashOut;

  // Filtered list for display
  const displayedTransactions = useMemo(() => {
    return dayTransactions.filter((t) => {
      const matchesType = filterType === 'all' || t.type === filterType;
      const matchesSearch =
        searchQuery === '' ||
        t.category.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (t.notes && t.notes.toLowerCase().includes(searchQuery.toLowerCase())) ||
        (t.receiptNumber && t.receiptNumber.toLowerCase().includes(searchQuery.toLowerCase()));
      return matchesType && matchesSearch;
    });
  }, [dayTransactions, filterType, searchQuery]);

  // Date stepper
  const handleStepDay = (days: number) => {
    const current = new Date(selectedDate);
    current.setDate(current.getDate() + days);
    setSelectedDate(current.toISOString().split('T')[0]);
  };

  const handleSetToday = () => {
    const today = new Date().toISOString().split('T')[0];
    setSelectedDate(today);
  };

  const isToday = selectedDate === new Date().toISOString().split('T')[0];
  const targetPercent = targetConfig.dailyTarget > 0 ? (netProfit / targetConfig.dailyTarget) * 100 : 0;
  const isTargetHit = netProfit >= targetConfig.dailyTarget;

  return (
    <div className="space-y-6 pb-12">
      {/* Date Navigation Bar & Quick Action */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 bg-stone-900/90 border border-stone-800 p-3 sm:p-4 rounded-2xl shadow-sm">
        <div className="flex items-center gap-2">
          <button
            id="prev-day-btn"
            onClick={() => handleStepDay(-1)}
            className="p-2 rounded-xl bg-stone-800 hover:bg-stone-700 text-stone-300 transition-colors"
            title="Previous day"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>

          <div className="flex items-center gap-2 bg-stone-950 px-3 py-2 rounded-xl border border-stone-800">
            <Calendar className="w-4 h-4 text-amber-400 shrink-0" />
            <input
              id="selected-date-picker"
              type="date"
              value={selectedDate}
              onChange={(e) => e.target.value && setSelectedDate(e.target.value)}
              className="bg-transparent text-white font-bold text-sm focus:outline-none cursor-pointer"
            />
          </div>

          <button
            id="next-day-btn"
            onClick={() => handleStepDay(1)}
            className="p-2 rounded-xl bg-stone-800 hover:bg-stone-700 text-stone-300 transition-colors"
            title="Next day"
          >
            <ChevronRight className="w-4 h-4" />
          </button>

          {!isToday && (
            <button
              id="today-shortcut-btn"
              onClick={handleSetToday}
              className="px-3 py-1.5 rounded-lg bg-amber-500/20 text-amber-300 border border-amber-500/30 text-xs font-semibold hover:bg-amber-500/30 transition-all"
            >
              Back to Today
            </button>
          )}
        </div>

        {/* Quick Action Buttons */}
        <div className="flex items-center gap-2 flex-wrap">
          <button
            id="quick-add-in-btn"
            onClick={() => onOpenAddModal('in')}
            className="flex-1 sm:flex-initial flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-stone-950 font-bold text-xs sm:text-sm shadow-md transition-all active:scale-95"
          >
            <Plus className="w-4 h-4" />
            <span>+ Cash In (Sale)</span>
          </button>
          <button
            id="quick-add-out-btn"
            onClick={() => onOpenAddModal('out')}
            className="flex-1 sm:flex-initial flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-rose-500 hover:bg-rose-400 text-stone-950 font-bold text-xs sm:text-sm shadow-md transition-all active:scale-95"
          >
            <Minus className="w-4 h-4" />
            <span>- Expense (Out)</span>
          </button>
          <button
            id="drawer-check-btn"
            onClick={onOpenDrawerModal}
            className="flex items-center justify-center gap-1.5 px-3 py-2.5 rounded-xl bg-stone-800 hover:bg-stone-700 text-amber-300 border border-amber-500/30 font-semibold text-xs transition-all"
            title="Check physical cash in drawer"
          >
            <Banknote className="w-4 h-4" />
            <span>Till Check</span>
          </button>
        </div>
      </div>

      {/* 4 KPI Dashboard Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Card 1: Total Cash In */}
        <div className="bg-stone-900 border border-emerald-500/30 rounded-2xl p-5 shadow-sm relative overflow-hidden">
          <div className="flex items-center justify-between text-xs text-stone-400 mb-1">
            <span className="font-semibold uppercase tracking-wider text-emerald-400 flex items-center gap-1">
              <ArrowDownRight className="w-3.5 h-3.5" /> Total Cash In
            </span>
            <span className="text-[11px] text-stone-500">Sales & Revenue</span>
          </div>
          <div className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight mt-1">
            {targetConfig.currency}{totalIn.toFixed(2)}
          </div>
          {/* Breakdown Pills */}
          <div className="flex items-center gap-1.5 mt-3 pt-3 border-t border-stone-800 text-[11px] text-stone-400 flex-wrap">
            <span className="bg-stone-950 px-2 py-0.5 rounded border border-stone-800">
              Cash: <b className="text-stone-200">{targetConfig.currency}{cashIn.toFixed(0)}</b>
            </span>
            <span className="bg-stone-950 px-2 py-0.5 rounded border border-stone-800">
              Card: <b className="text-stone-200">{targetConfig.currency}{cardIn.toFixed(0)}</b>
            </span>
            {onlineIn > 0 && (
              <span className="bg-stone-950 px-2 py-0.5 rounded border border-stone-800">
                UPI / Online: <b className="text-stone-200">{targetConfig.currency}{onlineIn.toFixed(0)}</b>
              </span>
            )}
          </div>
        </div>

        {/* Card 2: Total Cash Out */}
        <div className="bg-stone-900 border border-rose-500/30 rounded-2xl p-5 shadow-sm relative overflow-hidden">
          <div className="flex items-center justify-between text-xs text-stone-400 mb-1">
            <span className="font-semibold uppercase tracking-wider text-rose-400 flex items-center gap-1">
              <ArrowUpRight className="w-3.5 h-3.5" /> Total Cash Out
            </span>
            <span className="text-[11px] text-stone-500">Daily Expenses</span>
          </div>
          <div className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight mt-1">
            {targetConfig.currency}{totalOut.toFixed(2)}
          </div>
          <div className="flex items-center justify-between mt-3 pt-3 border-t border-stone-800 text-[11px] text-stone-400">
            <span>
              Cash paid: <b className="text-rose-300">{targetConfig.currency}{cashOut.toFixed(2)}</b>
            </span>
            <span>
              {dayTransactions.filter((t) => t.type === 'out').length} expense items
            </span>
          </div>
        </div>

        {/* Card 3: Daily Net Profit */}
        <div
          className={`border rounded-2xl p-5 shadow-sm relative overflow-hidden transition-all ${
            netProfit >= 0
              ? 'bg-stone-900 border-amber-500/40'
              : 'bg-stone-900 border-rose-600/50'
          }`}
        >
          <div className="flex items-center justify-between text-xs text-stone-400 mb-1">
            <span className="font-semibold uppercase tracking-wider text-amber-400 flex items-center gap-1">
              <TrendingUp className="w-3.5 h-3.5" /> Daily Net Profit
            </span>
            <span className="text-[11px] text-stone-500">In minus Out</span>
          </div>
          <div
            className={`text-2xl sm:text-3xl font-extrabold tracking-tight mt-1 ${
              netProfit >= 0 ? 'text-amber-300' : 'text-rose-400'
            }`}
          >
            {netProfit < 0 ? '-' : ''}
            {targetConfig.currency}{Math.abs(netProfit).toFixed(2)}
          </div>
          <div className="flex items-center justify-between mt-3 pt-3 border-t border-stone-800 text-[11px]">
            <span className="text-stone-400">
              Target: <b className="text-stone-300">{targetConfig.currency}{targetConfig.dailyTarget}</b>
            </span>
            <span
              className={`font-bold px-2 py-0.5 rounded-full ${
                isTargetHit
                  ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                  : 'bg-stone-800 text-stone-400'
              }`}
            >
              {isTargetHit ? '🔥 Target Hit!' : `${Math.max(0, targetPercent).toFixed(0)}% reached`}
            </span>
          </div>
        </div>

        {/* Card 4: Cash Drawer Status */}
        <div className="bg-stone-900 border border-stone-800 rounded-2xl p-5 shadow-sm relative overflow-hidden">
          <div className="flex items-center justify-between text-xs text-stone-400 mb-1">
            <span className="font-semibold uppercase tracking-wider text-stone-300 flex items-center gap-1">
              <Banknote className="w-3.5 h-3.5 text-amber-400" /> Till Drawer Cash
            </span>
            <button
              onClick={onOpenDrawerModal}
              className="text-[11px] text-amber-400 hover:underline font-semibold"
            >
              Count
            </button>
          </div>
          <div className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight mt-1">
            {targetConfig.currency}{expectedTill.toFixed(2)}
          </div>
          <div className="flex items-center justify-between mt-3 pt-3 border-t border-stone-800 text-[11px] text-stone-400">
            <span>Float: {targetConfig.currency}{drawerRecord.openingCash || 100}</span>
            {drawerRecord.closingCashActual !== undefined ? (
              <span className="text-emerald-400 font-semibold">
                Reconciled: {targetConfig.currency}{drawerRecord.closingCashActual}
              </span>
            ) : (
              <span className="text-stone-500 italic">Not counted yet</span>
            )}
          </div>
        </div>
      </div>

      {/* Transactions Section */}
      <div className="bg-stone-900 border border-stone-800 rounded-2xl shadow-sm overflow-hidden">
        {/* Controls Header */}
        <div className="p-4 border-b border-stone-800 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 bg-stone-950/40">
          <div>
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <span>Day Activity Log ({selectedDate})</span>
              <span className="text-xs font-normal text-stone-400">
                • {displayedTransactions.length} of {dayTransactions.length} entries
              </span>
            </h3>
          </div>

          <div className="flex items-center gap-2 flex-wrap">
            {/* Search */}
            <div className="relative">
              <Search className="w-3.5 h-3.5 text-stone-500 absolute left-3 top-2.5" />
              <input
                id="search-transactions-input"
                type="text"
                placeholder="Search notes, items..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="bg-stone-900 border border-stone-700 text-xs text-stone-200 pl-8 pr-3 py-1.5 rounded-xl focus:outline-none focus:border-amber-400 placeholder:text-stone-600 w-40 sm:w-48"
              />
            </div>

            {/* Filter Pills */}
            <div className="flex bg-stone-950 p-1 rounded-xl border border-stone-800 text-xs font-medium">
              <button
                id="filter-all-btn"
                onClick={() => setFilterType('all')}
                className={`px-2.5 py-1 rounded-lg transition-all ${
                  filterType === 'all'
                    ? 'bg-stone-800 text-white font-bold'
                    : 'text-stone-400 hover:text-stone-200'
                }`}
              >
                All
              </button>
              <button
                id="filter-in-btn"
                onClick={() => setFilterType('in')}
                className={`px-2.5 py-1 rounded-lg transition-all ${
                  filterType === 'in'
                    ? 'bg-emerald-600/30 text-emerald-300 font-bold border border-emerald-500/40'
                    : 'text-stone-400 hover:text-stone-200'
                }`}
              >
                In ({dayTransactions.filter((t) => t.type === 'in').length})
              </button>
              <button
                id="filter-out-btn"
                onClick={() => setFilterType('out')}
                className={`px-2.5 py-1 rounded-lg transition-all ${
                  filterType === 'out'
                    ? 'bg-rose-600/30 text-rose-300 font-bold border border-rose-500/40'
                    : 'text-stone-400 hover:text-stone-200'
                }`}
              >
                Out ({dayTransactions.filter((t) => t.type === 'out').length})
              </button>
            </div>
          </div>
        </div>

        {/* Transactions List */}
        {displayedTransactions.length === 0 ? (
          <div className="p-12 text-center text-stone-400 space-y-3">
            <div className="w-12 h-12 mx-auto rounded-2xl bg-stone-800/80 flex items-center justify-center text-stone-500">
              <Receipt className="w-6 h-6" />
            </div>
            <div>
              <p className="text-sm font-semibold text-stone-300">
                {dayTransactions.length === 0
                  ? `No cash flow recorded for ${selectedDate}`
                  : 'No transactions match your search filter'}
              </p>
              <p className="text-xs text-stone-500 mt-0.5">
                {dayTransactions.length === 0
                  ? 'Tap below to log sales or expenses for this day'
                  : 'Try clearing the search or switching filter to "All"'}
              </p>
            </div>
            {dayTransactions.length === 0 && (
              <div className="flex justify-center gap-2 pt-2">
                <button
                  onClick={() => onOpenAddModal('in')}
                  className="px-4 py-2 bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 rounded-xl text-xs font-semibold hover:bg-emerald-500/30 transition-all"
                >
                  + Add Morning Sales
                </button>
                <button
                  onClick={() => onOpenAddModal('out')}
                  className="px-4 py-2 bg-rose-500/20 text-rose-300 border border-rose-500/40 rounded-xl text-xs font-semibold hover:bg-rose-500/30 transition-all"
                >
                  - Add Expense
                </button>
              </div>
            )}
          </div>
        ) : (
          <div className="divide-y divide-stone-800/80">
            {displayedTransactions.map((tx) => {
              const isDeleteConfirm = deleteConfirmId === tx.id;
              return (
                <div
                  key={tx.id}
                  className="p-4 hover:bg-stone-800/30 transition-colors flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 text-xs"
                >
                  {/* Left info */}
                  <div className="flex items-start gap-3">
                    <div
                      className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 mt-0.5 ${
                        tx.type === 'in'
                          ? 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/30'
                          : 'bg-rose-500/15 text-rose-400 border border-rose-500/30'
                      }`}
                    >
                      {tx.type === 'in' ? (
                        <ArrowDownRight className="w-5 h-5" />
                      ) : (
                        <ArrowUpRight className="w-5 h-5" />
                      )}
                    </div>
                    <div>
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-bold text-sm text-stone-100">
                          {tx.notes || (tx.type === 'in' ? 'Cash In (Sale)' : 'Expense (Cash Out)')}
                        </span>
                        {/* Payment badge */}
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-stone-800 text-stone-400 text-[10px] font-medium border border-stone-700">
                          {tx.paymentMethod === 'cash' && <Banknote className="w-2.5 h-2.5" />}
                          {tx.paymentMethod === 'card' && <CreditCard className="w-2.5 h-2.5" />}
                          {tx.paymentMethod === 'online' && <Smartphone className="w-2.5 h-2.5" />}
                          <span className="capitalize">{tx.paymentMethod === 'online' ? 'UPI / QR' : tx.paymentMethod}</span>
                        </span>
                        {tx.receiptNumber && (
                          <span className="text-[10px] text-stone-500 bg-stone-950 px-1.5 py-0.5 rounded">
                            #{tx.receiptNumber}
                          </span>
                        )}
                      </div>
                      <span className="text-[11px] text-stone-500 mt-1 block">
                        Logged at {tx.time || '12:00'}
                      </span>
                    </div>
                  </div>

                  {/* Right Amount & Actions */}
                  <div className="flex items-center justify-between sm:justify-end gap-4 shrink-0 pl-12 sm:pl-0">
                    <div className="text-right">
                      <div
                        className={`text-base sm:text-lg font-extrabold tracking-tight ${
                          tx.type === 'in' ? 'text-emerald-400' : 'text-rose-400'
                        }`}
                      >
                        {tx.type === 'in' ? '+' : '-'}
                        {targetConfig.currency}
                        {tx.amount.toFixed(2)}
                      </div>
                      <span className="text-[10px] text-stone-500 uppercase font-medium">
                        {tx.type === 'in' ? 'Revenue' : 'Expense'}
                      </span>
                    </div>

                    {/* Delete action with safety confirmation */}
                    {isDeleteConfirm ? (
                      <div className="flex items-center gap-1 bg-stone-950 p-1 rounded-xl border border-red-500/50 animate-in fade-in">
                        <span className="text-[10px] text-red-400 px-1 font-semibold">Delete?</span>
                        <button
                          onClick={() => {
                            onDeleteTransaction(tx.id);
                            setDeleteConfirmId(null);
                          }}
                          className="px-2 py-1 bg-red-600 hover:bg-red-500 text-white rounded text-[10px] font-bold"
                        >
                          Yes
                        </button>
                        <button
                          onClick={() => setDeleteConfirmId(null)}
                          className="px-2 py-1 bg-stone-800 hover:bg-stone-700 text-stone-300 rounded text-[10px]"
                        >
                          No
                        </button>
                      </div>
                    ) : (
                      <button
                        onClick={() => setDeleteConfirmId(tx.id)}
                        className="text-stone-500 hover:text-red-400 p-1.5 rounded-lg hover:bg-stone-800 transition-colors"
                        title="Delete entry"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Helpful Café Accounting Tip Footer */}
      <div className="bg-stone-900/60 border border-stone-800/80 rounded-2xl p-4 flex items-start gap-3 text-xs text-stone-400">
        <HelpCircle className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
        <div className="space-y-1">
          <p className="font-semibold text-stone-300">Café Owner Rule of Thumb:</p>
          <p>
            You don't need complex double-entry accounting. Just record every customer sale as{' '}
            <b className="text-emerald-400">Cash In</b>, and every bean/milk/ingredient expense as{' '}
            <b className="text-rose-400">Cash Out</b>. Your net profit is calculated automatically,
            and your till drawer stays 100% accountable!
          </p>
        </div>
      </div>
    </div>
  );
};
