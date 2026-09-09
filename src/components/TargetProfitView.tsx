import React, { useState, useMemo, useEffect } from 'react';
import {
  Target,
  Trophy,
  Flame,
  Coffee,
  Sparkles,
  TrendingUp,
  Settings,
  CheckCircle,
  Clock,
  Zap,
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { Transaction, TargetConfig } from '../types';

interface TargetProfitViewProps {
  transactions: Transaction[];
  selectedDate: string;
  targetConfig: TargetConfig;
  onUpdateTargetConfig: (config: TargetConfig) => void;
}

export const TargetProfitView: React.FC<TargetProfitViewProps> = ({
  transactions,
  selectedDate,
  targetConfig,
  onUpdateTargetConfig,
}) => {
  const [isEditingConfig, setIsEditingConfig] = useState(false);
  const [dailyTargetInput, setDailyTargetInput] = useState(targetConfig.dailyTarget.toString());
  const [monthlyTargetInput, setMonthlyTargetInput] = useState(targetConfig.monthlyTarget.toString());
  const [avgPriceInput, setAvgPriceInput] = useState(targetConfig.avgItemPrice.toString());
  const [cafeNameInput, setCafeNameInput] = useState(targetConfig.cafeName);

  // Calculate today's net profit
  const todayProfit = useMemo(() => {
    let profit = 0;
    for (const t of transactions) {
      if (t.date === selectedDate) {
        if (t.type === 'in') profit += t.amount;
        else profit -= t.amount;
      }
    }
    return profit;
  }, [transactions, selectedDate]);

  // Current month prefix (YYYY-MM)
  const currentMonth = selectedDate.substring(0, 7);

  // Month-to-date net profit
  const { monthProfit, monthRevenue, daysActive, daysTargetHit, streak } = useMemo(() => {
    const datesMap: Record<string, number> = {};

    for (const t of transactions) {
      if (t.date.startsWith(currentMonth)) {
        if (!datesMap[t.date]) datesMap[t.date] = 0;
        if (t.type === 'in') datesMap[t.date] += t.amount;
        else datesMap[t.date] -= t.amount;
      }
    }

    let mProfit = 0;
    let mRev = 0;
    for (const t of transactions) {
      if (t.date.startsWith(currentMonth)) {
        if (t.type === 'in') {
          mRev += t.amount;
          mProfit += t.amount;
        } else {
          mProfit -= t.amount;
        }
      }
    }

    let hits = 0;
    const sortedDates = Object.keys(datesMap).sort();
    sortedDates.forEach((d) => {
      if (datesMap[d] >= targetConfig.dailyTarget) {
        hits++;
      }
    });

    // Compute current consecutive streak ending on or before selectedDate
    let currentStreak = 0;
    const pastDates = sortedDates.filter((d) => d <= selectedDate).reverse();
    for (const d of pastDates) {
      if (datesMap[d] >= targetConfig.dailyTarget) {
        currentStreak++;
      } else {
        break;
      }
    }

    return {
      monthProfit: mProfit,
      monthRevenue: mRev,
      daysActive: sortedDates.length,
      daysTargetHit: hits,
      streak: currentStreak,
    };
  }, [transactions, currentMonth, targetConfig.dailyTarget, selectedDate]);

  const dailyPercentage = targetConfig.dailyTarget > 0 ? (todayProfit / targetConfig.dailyTarget) * 100 : 0;
  const isDailyTargetHit = todayProfit >= targetConfig.dailyTarget;
  const dailyDifference = todayProfit - targetConfig.dailyTarget;
  const remainingToday = Math.max(0, targetConfig.dailyTarget - todayProfit);

  const monthlyPercentage =
    targetConfig.monthlyTarget > 0 ? (monthProfit / targetConfig.monthlyTarget) * 100 : 0;
  const isMonthlyTargetHit = monthProfit >= targetConfig.monthlyTarget;

  // Trigger celebratory confetti
  const triggerCelebration = () => {
    confetti({
      particleCount: 100,
      spread: 70,
      origin: { y: 0.6 },
      colors: ['#f59e0b', '#10b981', '#3b82f6', '#ec4899', '#ffffff'],
    });
  };

  // Automatically trigger confetti if target was hit today
  useEffect(() => {
    if (isDailyTargetHit && todayProfit > 0) {
      triggerCelebration();
    }
  }, [isDailyTargetHit, selectedDate]);

  const handleSaveConfig = (e: React.FormEvent) => {
    e.preventDefault();
    onUpdateTargetConfig({
      ...targetConfig,
      cafeName: cafeNameInput.trim() || 'My Café',
      dailyTarget: Math.max(1, parseFloat(dailyTargetInput) || 100),
      monthlyTarget: Math.max(1, parseFloat(monthlyTargetInput) || 3000),
      avgItemPrice: Math.max(1, parseFloat(avgPriceInput) || 4.5),
    });
    setIsEditingConfig(false);
  };

  // Sales push units
  const avgPrice = targetConfig.avgItemPrice || 4.5;
  const coffeesNeeded = Math.ceil(remainingToday / avgPrice);
  const pastriesNeeded = Math.ceil(remainingToday / (avgPrice * 0.9));
  const combosNeeded = Math.ceil(remainingToday / (avgPrice * 2.2));

  return (
    <div className="space-y-6 pb-12">
      {/* Top Motivator Banner */}
      <div
        className={`relative overflow-hidden rounded-3xl p-6 sm:p-8 border shadow-xl transition-all ${
          isDailyTargetHit
            ? 'bg-gradient-to-br from-amber-950 via-stone-900 to-emerald-950 border-amber-500/50'
            : 'bg-gradient-to-br from-stone-900 via-stone-900 to-stone-950 border-stone-800'
        }`}
      >
        <div className="relative z-10 flex flex-col md:flex-row md:items-center md:justify-between gap-6">
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <span
                className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider ${
                  isDailyTargetHit
                    ? 'bg-amber-400 text-stone-950 animate-bounce'
                    : 'bg-stone-800 text-amber-300 border border-amber-500/30'
                }`}
              >
                <Flame className="w-4 h-4 fill-current" />
                {isDailyTargetHit ? 'TARGET HIT! 🔥' : 'DAILY PROFIT TARGET'}
              </span>
              <span className="text-xs text-stone-400">Date: {selectedDate}</span>
            </div>

            <h2 className="text-2xl sm:text-4xl font-extrabold text-white tracking-tight">
              {isDailyTargetHit ? (
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-300 via-yellow-200 to-emerald-300">
                  Target Crushed! {targetConfig.currency}{todayProfit.toFixed(2)}
                </span>
              ) : (
                <span>
                  {targetConfig.currency}{todayProfit.toFixed(2)}{' '}
                  <span className="text-stone-400 text-xl font-normal">
                    / {targetConfig.currency}{targetConfig.dailyTarget}
                  </span>
                </span>
              )}
            </h2>

            <p className="text-sm text-stone-300 max-w-xl">
              {isDailyTargetHit ? (
                <span>
                  Incredible hustle! You exceeded today's net profit goal by{' '}
                  <b className="text-emerald-300 font-bold">
                    +{targetConfig.currency}{dailyDifference.toFixed(2)}
                  </b>
                  . Keep the espresso flowing! ☕
                </span>
              ) : (
                <span>
                  You need{' '}
                  <b className="text-amber-300 font-bold">
                    {targetConfig.currency}{remainingToday.toFixed(2)}
                  </b>{' '}
                  more in net profit to hit your {selectedDate} target goal.
                </span>
              )}
            </p>
          </div>

          {/* Right Action & Celebration Buttons */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
            <button
              id="celebrate-btn"
              onClick={triggerCelebration}
              className="flex items-center justify-center gap-2 px-5 py-3 rounded-2xl bg-amber-500 hover:bg-amber-400 text-stone-950 font-extrabold text-sm shadow-lg shadow-amber-500/20 active:scale-95 transition-all"
            >
              <Sparkles className="w-4 h-4" />
              <span>Celebrate Now! 🎉</span>
            </button>
            <button
              id="edit-targets-toggle-btn"
              onClick={() => setIsEditingConfig(!isEditingConfig)}
              className="flex items-center justify-center gap-2 px-4 py-3 rounded-2xl bg-stone-800 hover:bg-stone-700 text-stone-300 text-sm font-semibold border border-stone-700 transition-all"
            >
              <Settings className="w-4 h-4" />
              <span>{isEditingConfig ? 'Hide Settings' : 'Change Targets'}</span>
            </button>
          </div>
        </div>

        {/* Big Progress Bar */}
        <div className="relative z-10 mt-6">
          <div className="flex justify-between text-xs font-semibold mb-2">
            <span className="text-stone-300">Today's Profit Goal Progress</span>
            <span
              className={
                isDailyTargetHit ? 'text-amber-300 font-bold' : 'text-stone-400'
              }
            >
              {dailyPercentage.toFixed(0)}% (Goal: {targetConfig.currency}{targetConfig.dailyTarget})
            </span>
          </div>
          <div className="w-full h-4 bg-stone-950/80 rounded-full overflow-hidden p-0.5 border border-stone-700">
            <div
              className={`h-full rounded-full transition-all duration-700 ${
                isDailyTargetHit
                  ? 'bg-gradient-to-r from-amber-400 to-emerald-400'
                  : 'bg-gradient-to-r from-amber-600 to-amber-400'
              }`}
              style={{ width: `${Math.min(100, Math.max(3, dailyPercentage))}%` }}
            ></div>
          </div>
        </div>
      </div>

      {/* Target Settings Drawer / Form (toggleable) */}
      {isEditingConfig && (
        <div
          id="target-settings-panel"
          className="bg-stone-900 border border-amber-500/40 rounded-2xl p-6 shadow-md animate-in fade-in"
        >
          <div className="flex items-center justify-between mb-4 border-b border-stone-800 pb-3">
            <div>
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <Target className="w-5 h-5 text-amber-400" />
                Customize Your Café Targets
              </h3>
              <p className="text-xs text-stone-400">
                Adjust realistic daily and monthly profit goals that motivate you and your staff
              </p>
            </div>
          </div>

          <form onSubmit={handleSaveConfig} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div>
              <label className="block text-xs font-semibold text-stone-300 mb-1">
                Café Business Name
              </label>
              <input
                type="text"
                value={cafeNameInput}
                onChange={(e) => setCafeNameInput(e.target.value)}
                className="w-full bg-stone-950 border border-stone-700 text-stone-200 text-xs px-3 py-2 rounded-xl focus:outline-none focus:border-amber-400"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-stone-300 mb-1">
                Daily Net Profit Target ({targetConfig.currency})
              </label>
              <input
                type="number"
                min="1"
                step="1"
                value={dailyTargetInput}
                onChange={(e) => setDailyTargetInput(e.target.value)}
                className="w-full bg-stone-950 border border-stone-700 text-amber-300 font-bold text-xs px-3 py-2 rounded-xl focus:outline-none focus:border-amber-400"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-stone-300 mb-1">
                Monthly Net Profit Target ({targetConfig.currency})
              </label>
              <input
                type="number"
                min="1"
                step="10"
                value={monthlyTargetInput}
                onChange={(e) => setMonthlyTargetInput(e.target.value)}
                className="w-full bg-stone-950 border border-stone-700 text-amber-300 font-bold text-xs px-3 py-2 rounded-xl focus:outline-none focus:border-amber-400"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-stone-300 mb-1">
                Avg Drink / Item Price ({targetConfig.currency})
              </label>
              <input
                type="number"
                min="0.5"
                step="0.1"
                value={avgPriceInput}
                onChange={(e) => setAvgPriceInput(e.target.value)}
                className="w-full bg-stone-950 border border-stone-700 text-stone-200 text-xs px-3 py-2 rounded-xl focus:outline-none focus:border-amber-400"
              />
            </div>

            <div className="sm:col-span-2 lg:col-span-4 flex justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setIsEditingConfig(false)}
                className="px-4 py-2 rounded-xl bg-stone-800 text-stone-300 text-xs hover:bg-stone-700"
              >
                Cancel
              </button>
              <button
                id="save-target-config-btn"
                type="submit"
                className="px-5 py-2 rounded-xl bg-amber-400 hover:bg-amber-300 text-stone-950 font-bold text-xs shadow-md"
              >
                Save New Targets
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Actionable Motivation Engine & Streak Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Card 1: What to sell to hit today's remaining target */}
        <div className="bg-stone-900 border border-stone-800 rounded-2xl p-5 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-amber-400 flex items-center gap-1.5">
              <Zap className="w-4 h-4" /> Target Push Calculator
            </span>
            <span className="text-[11px] text-stone-500">Sales Ideas</span>
          </div>

          {remainingToday > 0 ? (
            <>
              <p className="text-xs text-stone-300">
                To bridge the remaining{' '}
                <b className="text-amber-300">{targetConfig.currency}{remainingToday.toFixed(2)}</b>,
                your café team can push:
              </p>
              <div className="space-y-2.5">
                <div className="flex items-center justify-between p-2.5 rounded-xl bg-stone-950 border border-stone-800/80 text-xs">
                  <div className="flex items-center gap-2">
                    <Coffee className="w-4 h-4 text-amber-400" />
                    <span>Specialty Coffees</span>
                  </div>
                  <span className="font-extrabold text-amber-300">~{coffeesNeeded} cups</span>
                </div>
                <div className="flex items-center justify-between p-2.5 rounded-xl bg-stone-950 border border-stone-800/80 text-xs">
                  <div className="flex items-center gap-2">
                    <span className="text-sm">🥐</span>
                    <span>Pastries & Muffins</span>
                  </div>
                  <span className="font-extrabold text-amber-300">~{pastriesNeeded} items</span>
                </div>
                <div className="flex items-center justify-between p-2.5 rounded-xl bg-stone-950 border border-stone-800/80 text-xs">
                  <div className="flex items-center gap-2">
                    <span className="text-sm">🥪</span>
                    <span>Coffee + Meal Combos</span>
                  </div>
                  <span className="font-extrabold text-amber-300">~{combosNeeded} combos</span>
                </div>
              </div>
            </>
          ) : (
            <div className="py-6 text-center space-y-2">
              <Trophy className="w-10 h-10 text-amber-400 mx-auto animate-pulse" />
              <p className="text-sm font-bold text-white">No Push Needed Today!</p>
              <p className="text-xs text-stone-400">
                You've already exceeded your target. Every extra order from here is bonus profit!
              </p>
            </div>
          )}
        </div>

        {/* Card 2: Streak & Consistency */}
        <div className="bg-stone-900 border border-stone-800 rounded-2xl p-5 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-rose-400 flex items-center gap-1.5">
              <Flame className="w-4 h-4" /> Momentum & Streak
            </span>
            <span className="text-[11px] text-stone-500">Consistency</span>
          </div>

          <div className="text-center py-2 space-y-1">
            <div className="text-4xl font-extrabold text-white flex items-center justify-center gap-1">
              <span>{streak}</span>
              <span className="text-2xl">🔥</span>
            </div>
            <p className="text-xs font-bold text-amber-300 uppercase tracking-wide">
              {streak > 0 ? `${streak}-Day Target Hit Streak!` : 'Start a New Streak Today!'}
            </p>
          </div>

          <div className="pt-2 border-t border-stone-800 text-xs space-y-2 text-stone-400">
            <div className="flex justify-between">
              <span>Days target reached this month:</span>
              <span className="font-bold text-white">
                {daysTargetHit} of {daysActive} days
              </span>
            </div>
            <div className="flex justify-between">
              <span>Success Rate:</span>
              <span className="font-bold text-emerald-400">
                {daysActive > 0 ? ((daysTargetHit / daysActive) * 100).toFixed(0) : 0}%
              </span>
            </div>
          </div>
        </div>

        {/* Card 3: Monthly Target Snapshot */}
        <div className="bg-stone-900 border border-stone-800 rounded-2xl p-5 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-cyan-400 flex items-center gap-1.5">
              <TrendingUp className="w-4 h-4" /> Monthly Milestone
            </span>
            <span className="text-[11px] text-stone-500">{currentMonth}</span>
          </div>

          <div className="space-y-1">
            <div className="text-2xl font-extrabold text-white">
              {targetConfig.currency}{monthProfit.toFixed(2)}
            </div>
            <p className="text-xs text-stone-400">
              Goal: {targetConfig.currency}{targetConfig.monthlyTarget.toFixed(2)} (
              {monthlyPercentage.toFixed(0)}% achieved)
            </p>
          </div>

          {/* Month progress */}
          <div className="w-full h-2.5 bg-stone-950 rounded-full overflow-hidden border border-stone-800">
            <div
              className="h-full bg-cyan-400 rounded-full"
              style={{ width: `${Math.min(100, Math.max(3, monthlyPercentage))}%` }}
            ></div>
          </div>

          <div className="pt-1 text-[11px] text-stone-400 flex justify-between">
            <span>
              Remaining:{' '}
              <b className="text-stone-200">
                {targetConfig.currency}
                {Math.max(0, targetConfig.monthlyTarget - monthProfit).toFixed(2)}
              </b>
            </span>
            {isMonthlyTargetHit && (
              <span className="text-emerald-400 font-bold flex items-center gap-1">
                <CheckCircle className="w-3 h-3" /> Monthly Target Met!
              </span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
