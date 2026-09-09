import React from 'react';
import { Coffee, Target, CalendarDays, FileSpreadsheet, LogOut, CheckCircle2, BookOpen } from 'lucide-react';
import { User } from 'firebase/auth';
import { PWAInstallButton } from './PWAInstallButton';

interface HeaderProps {
  activeTab: 'daily' | 'target' | 'monthly' | 'sheets';
  setActiveTab: (tab: 'daily' | 'target' | 'monthly' | 'sheets') => void;
  cafeName: string;
  currency: string;
  setCurrency: (c: string) => void;
  user: User | null;
  onLogin: () => void;
  onLogout: () => void;
  isLoggingIn: boolean;
  isSheetLinked: boolean;
  onOpenGuide: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  activeTab,
  setActiveTab,
  cafeName,
  currency,
  setCurrency,
  user,
  onLogin,
  onLogout,
  isLoggingIn,
  isSheetLinked,
  onOpenGuide,
}) => {
  const currencies = ['₹', '$', '£', '€', 'A$', 'C$', '¥', 'AED'];

  return (
    <header className="bg-stone-900 text-stone-100 border-b border-stone-800 sticky top-0 z-30 shadow-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between py-3 gap-3">
          {/* Brand & Cafe Name */}
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-500/20 border border-amber-500/40 flex items-center justify-center text-amber-400 shrink-0 shadow-inner">
              <Coffee className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-lg font-bold tracking-tight text-white">{cafeName || 'CAFE THERE'}</h1>
                <span className="text-[11px] font-semibold uppercase tracking-wider px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/30">
                  Cash Flow & Profit
                </span>
              </div>
              <p className="text-xs text-stone-400">Simple daily in & out • Zero accounting headache</p>
            </div>
          </div>

          {/* Right Controls: How to Use Guide, Install App, Currency & Google Account */}
          <div className="flex items-center gap-2 flex-wrap">
            {/* PWA Install Button */}
            <PWAInstallButton />

            {/* Guide Button */}
            <button
              id="header-guide-btn"
              onClick={onOpenGuide}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-stone-800 hover:bg-stone-700 text-amber-300 border border-amber-500/30 text-xs font-semibold shadow-sm transition-all"
              title="Learn how to use this tracker and daily routine"
            >
              <BookOpen className="w-3.5 h-3.5" />
              <span>How to Use</span>
            </button>

            {/* Currency Selector */}
            <div className="flex items-center bg-stone-800/80 rounded-lg p-1 border border-stone-700 text-xs">
              <span className="text-stone-400 px-2 font-medium">Currency:</span>
              <select
                id="currency-select"
                value={currency}
                onChange={(e) => setCurrency(e.target.value)}
                className="bg-stone-900 text-amber-300 font-bold px-2 py-1 rounded border border-stone-700 focus:outline-none focus:ring-1 focus:ring-amber-400"
              >
                {currencies.map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </select>
            </div>

            {/* Google Sheets connection status / Sign in */}
            {user ? (
              <div className="flex items-center gap-2 bg-stone-800/90 border border-emerald-500/40 rounded-lg px-3 py-1.5 text-xs">
                <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></div>
                <div className="flex flex-col text-left">
                  <span className="text-stone-300 font-medium truncate max-w-[140px] sm:max-w-[180px]">
                    {user.email}
                  </span>
                  {isSheetLinked && (
                    <span className="text-[10px] text-emerald-400 flex items-center gap-1 font-semibold">
                      <CheckCircle2 className="w-3 h-3" /> Sheets Linked
                    </span>
                  )}
                </div>
                <button
                  id="google-logout-btn"
                  onClick={onLogout}
                  title="Sign out of Google"
                  className="ml-1 text-stone-400 hover:text-red-400 p-1 rounded hover:bg-stone-700/50 transition-colors"
                >
                  <LogOut className="w-3.5 h-3.5" />
                </button>
              </div>
            ) : (
              <button
                id="google-signin-header-btn"
                onClick={onLogin}
                disabled={isLoggingIn}
                className="flex items-center gap-2 bg-stone-800 hover:bg-stone-700 text-stone-200 border border-stone-600 px-3 py-1.5 rounded-lg text-xs font-medium transition-all shadow-sm active:scale-95 disabled:opacity-50"
              >
                <FileSpreadsheet className="w-3.5 h-3.5 text-emerald-400" />
                <span>{isLoggingIn ? 'Connecting...' : 'Connect Google Sheets'}</span>
              </button>
            )}
          </div>
        </div>

        {/* Navigation Tabs */}
        <nav className="flex space-x-1 sm:space-x-2 border-t border-stone-800 pt-2 pb-2 overflow-x-auto text-sm">
          <button
            id="tab-daily"
            onClick={() => setActiveTab('daily')}
            className={`flex items-center gap-2 px-3.5 py-2 rounded-lg font-medium transition-all whitespace-nowrap ${
              activeTab === 'daily'
                ? 'bg-amber-500 text-stone-950 font-semibold shadow'
                : 'text-stone-300 hover:text-white hover:bg-stone-800'
            }`}
          >
            <Coffee className="w-4 h-4" />
            <span>Daily Cash Flow</span>
          </button>

          <button
            id="tab-target"
            onClick={() => setActiveTab('target')}
            className={`flex items-center gap-2 px-3.5 py-2 rounded-lg font-medium transition-all whitespace-nowrap relative ${
              activeTab === 'target'
                ? 'bg-amber-500 text-stone-950 font-semibold shadow'
                : 'text-stone-300 hover:text-white hover:bg-stone-800'
            }`}
          >
            <Target className="w-4 h-4" />
            <span>Target Profit & Motivation</span>
            <span className="w-2 h-2 rounded-full bg-amber-400 absolute top-1.5 right-1.5 animate-ping"></span>
          </button>

          <button
            id="tab-monthly"
            onClick={() => setActiveTab('monthly')}
            className={`flex items-center gap-2 px-3.5 py-2 rounded-lg font-medium transition-all whitespace-nowrap ${
              activeTab === 'monthly'
                ? 'bg-amber-500 text-stone-950 font-semibold shadow'
                : 'text-stone-300 hover:text-white hover:bg-stone-800'
            }`}
          >
            <CalendarDays className="w-4 h-4" />
            <span>Monthly P&L Report</span>
          </button>

          <button
            id="tab-sheets"
            onClick={() => setActiveTab('sheets')}
            className={`flex items-center gap-2 px-3.5 py-2 rounded-lg font-medium transition-all whitespace-nowrap ${
              activeTab === 'sheets'
                ? 'bg-amber-500 text-stone-950 font-semibold shadow'
                : 'text-stone-300 hover:text-white hover:bg-stone-800'
            }`}
          >
            <FileSpreadsheet className="w-4 h-4" />
            <span>Google Sheets Sync</span>
          </button>
        </nav>
      </div>
    </header>
  );
};
