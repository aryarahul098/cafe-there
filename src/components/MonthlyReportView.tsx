import React, { useState, useMemo } from 'react';
import {
  Calendar,
  ArrowDownRight,
  ArrowUpRight,
  TrendingUp,
  Award,
  ChevronRight,
  CheckCircle2,
  Clock,
  ArrowRight,
} from 'lucide-react';
import { Transaction, TargetConfig } from '../types';

interface MonthlyReportViewProps {
  transactions: Transaction[];
  selectedDate: string;
  onSelectDate: (date: string) => void;
  targetConfig: TargetConfig;
}

export const MonthlyReportView: React.FC<MonthlyReportViewProps> = ({
  transactions,
  selectedDate,
  onSelectDate,
  targetConfig,
}) => {
  const [selectedMonth, setSelectedMonth] = useState<string>(selectedDate.substring(0, 7));

  // Available months from transactions
  const availableMonths = useMemo(() => {
    const set = new Set<string>();
    for (const t of transactions) {
      if (t.date && t.date.length >= 7) {
        set.add(t.date.substring(0, 7));
      }
    }
    // Always include current month
    set.add(new Date().toISOString().substring(0, 7));
    return Array.from(set).sort().reverse();
  }, [transactions]);

  // Monthly stats and day-by-day table
  const {
    totalIn,
    totalOut,
    netProfit,
    margin,
    daysList,
    bestDay,
    avgDailyProfit,
  } = useMemo(() => {
    let tIn = 0;
    let tOut = 0;
    const dayMap: Record<string, { in: number; out: number; count: number }> = {};

    for (const t of transactions) {
      if (t.date.startsWith(selectedMonth)) {
        if (!dayMap[t.date]) dayMap[t.date] = { in: 0, out: 0, count: 0 };
        dayMap[t.date].count++;

        if (t.type === 'in') {
          tIn += t.amount;
          dayMap[t.date].in += t.amount;
        } else {
          tOut += t.amount;
          dayMap[t.date].out += t.amount;
        }
      }
    }

    const nProfit = tIn - tOut;
    const pMargin = tIn > 0 ? (nProfit / tIn) * 100 : 0;

    // Convert dayMap to sorted array
    const sortedDays = Object.keys(dayMap)
      .sort()
      .reverse()
      .map((date) => {
        const d = dayMap[date];
        const profit = d.in - d.out;
        const targetMet = profit >= targetConfig.dailyTarget;
        return {
          date,
          in: d.in,
          out: d.out,
          profit,
          targetMet,
          count: d.count,
        };
      });

    // Best day
    let topDay: { date: string; profit: number } | null = null;
    sortedDays.forEach((d) => {
      if (!topDay || d.profit > topDay.profit) {
        topDay = { date: d.date, profit: d.profit };
      }
    });

    // Average daily profit
    const avgProfit = sortedDays.length > 0 ? nProfit / sortedDays.length : 0;

    return {
      totalIn: tIn,
      totalOut: tOut,
      netProfit: nProfit,
      margin: pMargin,
      daysList: sortedDays,
      bestDay: topDay,
      avgDailyProfit: avgProfit,
    };
  }, [transactions, selectedMonth, targetConfig.dailyTarget]);

  return (
    <div className="space-y-6 pb-12">
      {/* Month Selector Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 bg-stone-900 border border-stone-800 p-4 rounded-2xl shadow-sm">
        <div className="flex items-center gap-2">
          <Calendar className="w-5 h-5 text-amber-400" />
          <h2 className="text-base font-bold text-white">Monthly Profit &amp; Loss Overview</h2>
        </div>

        <div className="flex items-center gap-2">
          <label className="text-xs text-stone-400 font-medium">Select Month:</label>
          <select
            id="month-selector"
            value={selectedMonth}
            onChange={(e) => setSelectedMonth(e.target.value)}
            className="bg-stone-950 text-amber-300 font-bold px-3 py-2 rounded-xl border border-stone-700 text-xs focus:outline-none focus:border-amber-400"
          >
            {availableMonths.map((m) => (
              <option key={m} value={m}>
                {new Date(`${m}-01T00:00:00`).toLocaleDateString(undefined, {
                  month: 'long',
                  year: 'numeric',
                })}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* 4 Monthly KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Monthly Revenue */}
        <div className="bg-stone-900 border border-emerald-500/30 rounded-2xl p-5 shadow-sm">
          <div className="text-xs text-emerald-400 font-semibold uppercase tracking-wider flex items-center gap-1 mb-1">
            <ArrowDownRight className="w-4 h-4" /> Monthly Cash In (Sales)
          </div>
          <div className="text-2xl sm:text-3xl font-extrabold text-white">
            {targetConfig.currency}{totalIn.toFixed(2)}
          </div>
          <p className="text-[11px] text-stone-400 mt-2">
            Across {daysList.length} recorded business days
          </p>
        </div>

        {/* Total Monthly Expenses */}
        <div className="bg-stone-900 border border-rose-500/30 rounded-2xl p-5 shadow-sm">
          <div className="text-xs text-rose-400 font-semibold uppercase tracking-wider flex items-center gap-1 mb-1">
            <ArrowUpRight className="w-4 h-4" /> Monthly Cash Out (Expenses)
          </div>
          <div className="text-2xl sm:text-3xl font-extrabold text-white">
            {targetConfig.currency}{totalOut.toFixed(2)}
          </div>
          <p className="text-[11px] text-stone-400 mt-2">
            Total expenses logged this month
          </p>
        </div>

        {/* Net Monthly Profit */}
        <div
          className={`border rounded-2xl p-5 shadow-sm ${
            netProfit >= 0 ? 'bg-stone-900 border-amber-500/40' : 'bg-stone-900 border-rose-500/40'
          }`}
        >
          <div className="text-xs text-amber-400 font-semibold uppercase tracking-wider flex items-center gap-1 mb-1">
            <TrendingUp className="w-4 h-4" /> Net Monthly Profit
          </div>
          <div
            className={`text-2xl sm:text-3xl font-extrabold ${
              netProfit >= 0 ? 'text-amber-300' : 'text-rose-400'
            }`}
          >
            {targetConfig.currency}{netProfit.toFixed(2)}
          </div>
          <div className="flex items-center justify-between mt-2 text-[11px] text-stone-400">
            <span>Net Profit Margin:</span>
            <span className="font-bold text-white">{margin.toFixed(1)}%</span>
          </div>
        </div>

        {/* Average & Best Day */}
        <div className="bg-stone-900 border border-stone-800 rounded-2xl p-5 shadow-sm">
          <div className="text-xs text-stone-300 font-semibold uppercase tracking-wider flex items-center gap-1 mb-1">
            <Award className="w-4 h-4 text-amber-400" /> Daily Profit Average
          </div>
          <div className="text-2xl sm:text-3xl font-extrabold text-white">
            {targetConfig.currency}{avgDailyProfit.toFixed(2)}
          </div>
          <p className="text-[11px] text-stone-400 mt-2">
            Best day:{' '}
            <b className="text-amber-300">
              {bestDay ? `${bestDay.date} (${targetConfig.currency}${bestDay.profit.toFixed(0)})` : 'N/A'}
            </b>
          </p>
        </div>
      </div>

      {/* Day-by-Day Performance Table */}
      <div className="w-full bg-stone-900 border border-stone-800 rounded-2xl shadow-sm overflow-hidden">
        <div className="p-4 border-b border-stone-800 bg-stone-950/40 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
          <h3 className="text-sm font-bold text-white flex items-center gap-2">
            <Calendar className="w-4 h-4 text-amber-400" />
            <span>Day-by-Day Profit Breakdown ({selectedMonth})</span>
          </h3>
          <span className="text-xs text-stone-400">
            Target: {targetConfig.currency}{targetConfig.dailyTarget}/day
          </span>
        </div>

        {daysList.length === 0 ? (
          <div className="p-8 text-center text-stone-500 text-xs">
            No transactions recorded in {selectedMonth}.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-stone-950/60 text-stone-400 border-b border-stone-800 uppercase tracking-wider font-semibold">
                <tr>
                  <th className="py-3 px-4">Date</th>
                  <th className="py-3 px-4 text-emerald-400">Cash In</th>
                  <th className="py-3 px-4 text-rose-400">Cash Out</th>
                  <th className="py-3 px-4 text-amber-300">Net Profit</th>
                  <th className="py-3 px-4 text-center">Target Status</th>
                  <th className="py-3 px-4 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-stone-800">
                {daysList.map((d) => {
                  const isSelected = d.date === selectedDate;
                  return (
                    <tr
                      key={d.date}
                      className={`hover:bg-stone-800/40 transition-colors ${
                        isSelected ? 'bg-amber-500/10' : ''
                      }`}
                    >
                      <td className="py-3 px-4 font-bold text-white whitespace-nowrap">
                        {d.date}
                        <span className="block text-[10px] text-stone-500 font-normal">
                          {new Date(`${d.date}T00:00:00`).toLocaleDateString(undefined, {
                            weekday: 'short',
                          })}
                        </span>
                      </td>
                      <td className="py-3 px-4 font-semibold text-emerald-400 whitespace-nowrap">
                        +{targetConfig.currency}{d.in.toFixed(2)}
                      </td>
                      <td className="py-3 px-4 font-semibold text-rose-400 whitespace-nowrap">
                        -{targetConfig.currency}{d.out.toFixed(2)}
                      </td>
                      <td className="py-3 px-4 font-extrabold whitespace-nowrap">
                        <span className={d.profit >= 0 ? 'text-amber-300' : 'text-rose-400'}>
                          {targetConfig.currency}{d.profit.toFixed(2)}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-center whitespace-nowrap">
                        {d.targetMet ? (
                          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 text-[11px] font-bold border border-emerald-500/30">
                            <CheckCircle2 className="w-3 h-3" /> Hit! 🔥
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-stone-800 text-stone-400 text-[11px]">
                            Pending
                          </span>
                        )}
                      </td>
                      <td className="py-3 px-4 text-right whitespace-nowrap">
                        <button
                          onClick={() => onSelectDate(d.date)}
                          className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-stone-800 hover:bg-amber-500 hover:text-stone-950 text-stone-300 text-[11px] font-semibold transition-all"
                          title="Open day details"
                        >
                          <span>View Day</span>
                          <ArrowRight className="w-3 h-3" />
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};
