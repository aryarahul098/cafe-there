import React, { useState, useEffect } from 'react';
import { User } from 'firebase/auth';
import { Header } from './components/Header';
import { CashFlowView } from './components/CashFlowView';
import { TargetProfitView } from './components/TargetProfitView';
import { MonthlyReportView } from './components/MonthlyReportView';
import { SheetsSyncView } from './components/SheetsSyncView';
import { QuickAddModal } from './components/QuickAddModal';
import { CashDrawerModal } from './components/CashDrawerModal';
import { HowToUseModal } from './components/HowToUseModal';
import {
  Transaction,
  TargetConfig,
  TransactionType,
  CashDrawerRecord,
} from './types';
import {
  getStoredTransactions,
  saveTransactions,
  getStoredTargets,
  saveTargets,
  getLinkedSheetInfo,
  saveLinkedSheetInfo,
  getStoredCashDrawer,
  saveCashDrawer,
} from './utils/storage';
import { initAuth, googleSignIn, logout, getAccessToken } from './services/firebase';
import { appendTransactionToSheet } from './services/sheetsService';
import { useOnlineStatus } from './hooks/useOnlineStatus';
import { WifiOff } from 'lucide-react';

export default function App() {
  const isOnline = useOnlineStatus();
  const [activeTab, setActiveTab] = useState<'daily' | 'target' | 'monthly' | 'sheets'>('daily');
  const [transactions, setTransactions] = useState<Transaction[]>(() => getStoredTransactions());
  const [targetConfig, setTargetConfig] = useState<TargetConfig>(() => getStoredTargets());
  const [selectedDate, setSelectedDate] = useState<string>('2026-09-09');

  // Modal states
  const [isAddModalOpen, setIsAddModalOpen] = useState<boolean>(false);
  const [addModalType, setAddModalType] = useState<TransactionType>('in');
  const [isDrawerModalOpen, setIsDrawerModalOpen] = useState<boolean>(false);
  const [isGuideModalOpen, setIsGuideModalOpen] = useState<boolean>(false);

  // Auth & Sheets states
  const [user, setUser] = useState<User | null>(null);
  const [accessToken, setAccessToken] = useState<string | null>(null);
  const [isLoggingIn, setIsLoggingIn] = useState<boolean>(false);
  const [linkedSheet, setLinkedSheet] = useState<{ id: string | null; url: string | null }>(() =>
    getLinkedSheetInfo()
  );

  // Drawer record for selected date
  const [drawerRecord, setDrawerRecord] = useState<CashDrawerRecord>(() =>
    getStoredCashDrawer('2026-09-09')
  );

  // Refresh drawer record when date changes
  useEffect(() => {
    setDrawerRecord(getStoredCashDrawer(selectedDate));
  }, [selectedDate]);

  // Auth listener initialization
  useEffect(() => {
    const unsubscribe = initAuth(
      (currentUser, token) => {
        setUser(currentUser);
        setAccessToken(token);
      },
      () => {
        setUser(null);
        setAccessToken(null);
      }
    );
    return () => {
      if (typeof unsubscribe === 'function') unsubscribe();
    };
  }, []);

  // Sync state changes to storage
  useEffect(() => {
    saveTransactions(transactions);
  }, [transactions]);

  useEffect(() => {
    saveTargets(targetConfig);
  }, [targetConfig]);

  // Handle Google login
  const handleLogin = async () => {
    setIsLoggingIn(true);
    try {
      const result = await googleSignIn();
      if (result) {
        setUser(result.user);
        setAccessToken(result.accessToken);
      }
    } catch (err) {
      console.error('Sign-in failed:', err);
    } finally {
      setIsLoggingIn(false);
    }
  };

  // Handle Google logout
  const handleLogout = async () => {
    try {
      await logout();
      setUser(null);
      setAccessToken(null);
    } catch (err) {
      console.error('Logout error:', err);
    }
  };

  // Add new transaction
  const handleAddTransaction = async (txData: Omit<Transaction, 'id' | 'createdAt'>) => {
    const newTx: Transaction = {
      ...txData,
      id: `tx-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      createdAt: Date.now(),
    };

    setTransactions((prev) => [newTx, ...prev]);

    // If Google Sheet is linked and token active, auto-append in background
    const currentToken = accessToken || (await getAccessToken());
    if (currentToken && linkedSheet.id) {
      appendTransactionToSheet(currentToken, linkedSheet.id, newTx).catch((err) =>
        console.warn('Auto-sync append error:', err)
      );
    }
  };

  // Delete transaction
  const handleDeleteTransaction = (id: string) => {
    setTransactions((prev) => prev.filter((t) => t.id !== id));
  };

  // Open Add modal with specified type
  const handleOpenAddModal = (type: TransactionType) => {
    setAddModalType(type);
    setIsAddModalOpen(true);
  };

  // Update target config
  const handleUpdateTargetConfig = (newConfig: TargetConfig) => {
    setTargetConfig(newConfig);
  };

  // Update linked sheet info
  const handleSetLinkedSheet = (id: string | null, url: string | null) => {
    setLinkedSheet({ id, url });
    saveLinkedSheetInfo(id, url);
  };

  // Save cash drawer record
  const handleSaveDrawerRecord = (record: CashDrawerRecord) => {
    setDrawerRecord(record);
    saveCashDrawer(record);
  };

  // Compute daily cash in/out for the cash drawer modal
  const dayTransactions = transactions.filter((t) => t.date === selectedDate);
  const cashInToday = dayTransactions
    .filter((t) => t.type === 'in' && t.paymentMethod === 'cash')
    .reduce((sum, t) => sum + t.amount, 0);
  const cashOutToday = dayTransactions
    .filter((t) => t.type === 'out' && t.paymentMethod === 'cash')
    .reduce((sum, t) => sum + t.amount, 0);

  return (
    <div className="min-h-screen bg-stone-950 text-stone-100 font-sans antialiased selection:bg-amber-500 selection:text-stone-950">
      {/* Top Header & Navigation */}
      <Header
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        cafeName={targetConfig.cafeName}
        currency={targetConfig.currency}
        setCurrency={(newCurr) => setTargetConfig((c) => ({ ...c, currency: newCurr }))}
        user={user}
        onLogin={handleLogin}
        onLogout={handleLogout}
        isLoggingIn={isLoggingIn}
        isSheetLinked={!!linkedSheet.id}
        onOpenGuide={() => setIsGuideModalOpen(true)}
      />

      {/* Main Content Area */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-6">
        {activeTab === 'daily' && (
          <CashFlowView
            transactions={transactions}
            selectedDate={selectedDate}
            setSelectedDate={setSelectedDate}
            targetConfig={targetConfig}
            onOpenAddModal={handleOpenAddModal}
            onOpenDrawerModal={() => setIsDrawerModalOpen(true)}
            onDeleteTransaction={handleDeleteTransaction}
            drawerRecord={drawerRecord}
          />
        )}

        {activeTab === 'target' && (
          <TargetProfitView
            transactions={transactions}
            selectedDate={selectedDate}
            targetConfig={targetConfig}
            onUpdateTargetConfig={handleUpdateTargetConfig}
          />
        )}

        {activeTab === 'monthly' && (
          <MonthlyReportView
            transactions={transactions}
            selectedDate={selectedDate}
            onSelectDate={(date) => {
              setSelectedDate(date);
              setActiveTab('daily');
            }}
            targetConfig={targetConfig}
          />
        )}

        {activeTab === 'sheets' && (
          <SheetsSyncView
            user={user}
            accessToken={accessToken}
            onLogin={handleLogin}
            onLogout={handleLogout}
            isLoggingIn={isLoggingIn}
            transactions={transactions}
            targetConfig={targetConfig}
            linkedSheetId={linkedSheet.id}
            linkedSheetUrl={linkedSheet.url}
            onSetLinkedSheet={handleSetLinkedSheet}
          />
        )}
      </main>

      {/* Quick Add Transaction Modal */}
      <QuickAddModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        onAddTransaction={handleAddTransaction}
        currency={targetConfig.currency}
        defaultType={addModalType}
        selectedDate={selectedDate}
      />

      {/* Cash Drawer Till Check Modal */}
      <CashDrawerModal
        isOpen={isDrawerModalOpen}
        onClose={() => setIsDrawerModalOpen(false)}
        date={selectedDate}
        currency={targetConfig.currency}
        drawerRecord={drawerRecord}
        cashInToday={cashInToday}
        cashOutToday={cashOutToday}
        onSave={handleSaveDrawerRecord}
      />

      {/* Daily Routine & How to Use Guide Modal */}
      <HowToUseModal
        isOpen={isGuideModalOpen}
        onClose={() => setIsGuideModalOpen(false)}
        cafeName={targetConfig.cafeName}
        currency={targetConfig.currency}
      />

      {/* Offline Status Notification */}
      {!isOnline && (
        <div className="fixed bottom-4 left-4 z-50 flex items-center gap-2 rounded-xl bg-amber-600 px-4 py-2.5 text-xs font-semibold text-white shadow-2xl border border-amber-400/40 animate-pulse">
          <WifiOff className="w-4 h-4" />
          <span>Offline Mode — All entries are saved safely on your device</span>
        </div>
      )}
    </div>
  );
}
