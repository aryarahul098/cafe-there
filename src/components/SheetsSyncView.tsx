import React, { useState } from 'react';
import {
  FileSpreadsheet,
  CheckCircle2,
  ExternalLink,
  RefreshCw,
  PlusCircle,
  Download,
  ShieldCheck,
  HelpCircle,
  AlertTriangle,
} from 'lucide-react';
import { User } from 'firebase/auth';
import { Transaction, TargetConfig } from '../types';
import {
  createCafeSpreadsheet,
  resyncExistingSheet,
  SyncResult,
} from '../services/sheetsService';

interface SheetsSyncViewProps {
  user: User | null;
  accessToken: string | null;
  onLogin: () => void;
  onLogout: () => void;
  isLoggingIn: boolean;
  transactions: Transaction[];
  targetConfig: TargetConfig;
  linkedSheetId: string | null;
  linkedSheetUrl: string | null;
  onSetLinkedSheet: (id: string | null, url: string | null) => void;
}

export const SheetsSyncView: React.FC<SheetsSyncViewProps> = ({
  user,
  accessToken,
  onLogin,
  onLogout,
  isLoggingIn,
  transactions,
  targetConfig,
  linkedSheetId,
  linkedSheetUrl,
  onSetLinkedSheet,
}) => {
  const [isSyncing, setIsSyncing] = useState(false);
  const [syncStatus, setSyncStatus] = useState<string | null>(null);
  const [syncError, setSyncError] = useState<string | null>(null);
  const [showConfirmModal, setShowConfirmModal] = useState<boolean>(false);
  const [pendingAction, setPendingAction] = useState<'create' | 'resync' | null>(null);

  // Trigger Sheet creation
  const handleCreateSheetConfirmed = async () => {
    if (!accessToken) {
      setSyncError('Google token expired or missing. Please reconnect.');
      return;
    }

    setIsSyncing(true);
    setSyncStatus('Creating and formatting your Café Google Sheet...');
    setSyncError(null);

    const result: SyncResult = await createCafeSpreadsheet(
      accessToken,
      targetConfig.cafeName,
      transactions,
      targetConfig
    );

    setIsSyncing(false);
    if (result.success && result.spreadsheetId && result.spreadsheetUrl) {
      onSetLinkedSheet(result.spreadsheetId, result.spreadsheetUrl);
      setSyncStatus(`Successfully created spreadsheet! ${result.updatedRows} transactions synced.`);
    } else {
      setSyncError(result.message);
    }
  };

  // Trigger Sheet resync
  const handleResyncConfirmed = async () => {
    if (!accessToken || !linkedSheetId) {
      setSyncError('Google token or linked spreadsheet missing.');
      return;
    }

    setIsSyncing(true);
    setSyncStatus('Updating Google Sheet tabs with current transactions & profit summaries...');
    setSyncError(null);

    const result: SyncResult = await resyncExistingSheet(
      accessToken,
      linkedSheetId,
      transactions,
      targetConfig
    );

    setIsSyncing(false);
    if (result.success) {
      setSyncStatus('Google Sheet successfully updated with all current transactions!');
    } else {
      setSyncError(result.message);
    }
  };

  // Safe initiation with required confirmation modal (Mandated by Workspace skill)
  const initiateAction = (action: 'create' | 'resync') => {
    setPendingAction(action);
    setShowConfirmModal(true);
  };

  const handleConfirmAction = () => {
    setShowConfirmModal(false);
    if (pendingAction === 'create') {
      handleCreateSheetConfirmed();
    } else if (pendingAction === 'resync') {
      handleResyncConfirmed();
    }
    setPendingAction(null);
  };

  // Download local CSV
  const handleDownloadCSV = () => {
    const headers = [
      'Date',
      'Time',
      'Type',
      'Category',
      `Amount (${targetConfig.currency})`,
      'Payment Method',
      'Notes',
      'Receipt #',
    ];
    const rows = transactions.map((t) => [
      t.date,
      t.time,
      t.type.toUpperCase(),
      `"${t.category.replace(/"/g, '""')}"`,
      t.amount,
      t.paymentMethod.toUpperCase(),
      `"${(t.notes || '').replace(/"/g, '""')}"`,
      `"${(t.receiptNumber || '').replace(/"/g, '""')}"`,
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map((e) => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `${targetConfig.cafeName || 'cafe'}_cashflow_export.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Overview Explanation Banner answering the user's initial question */}
      <div className="bg-gradient-to-r from-stone-900 via-amber-950/40 to-stone-900 border border-amber-500/30 rounded-3xl p-6 sm:p-8 shadow-md">
        <div className="flex items-start gap-4">
          <div className="w-12 h-12 rounded-2xl bg-amber-500/20 text-amber-400 flex items-center justify-center shrink-0 border border-amber-500/30">
            <HelpCircle className="w-6 h-6" />
          </div>
          <div className="space-y-2">
            <h2 className="text-xl sm:text-2xl font-extrabold text-white">
              What is this called? It is your Café Cash Flow &amp; Profit Tracker!
            </h2>
            <p className="text-sm text-stone-300 leading-relaxed">
              In business, calculating money coming in and money going out is called{' '}
              <b className="text-amber-300">Cash Flow Management</b> (Cash In vs. Cash Out) and{' '}
              <b className="text-emerald-300">Net Profit Tracking</b>.
            </p>
            <p className="text-xs text-stone-400 leading-relaxed">
              Traditional accounting is full of confusing ledgers, double-entries, and debit/credit rules
              that small café owners shouldn't have to suffer through. With this app, you just enter daily
              cash in and out, count your till drawer, track targets, and sync directly to Google Sheets with 1 click!
            </p>
          </div>
        </div>
      </div>

      {/* Main Google Sheets Connection Card */}
      <div className="bg-stone-900 border border-stone-800 rounded-3xl p-6 sm:p-8 shadow-sm space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-stone-800 pb-5">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center border border-emerald-500/30">
              <FileSpreadsheet className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-white">Google Sheets Live Synchronization</h3>
              <p className="text-xs text-stone-400">
                Keep your café books safe and accessible anywhere on your Google Drive
              </p>
            </div>
          </div>

          {/* Account status badge */}
          {user ? (
            <div className="flex items-center gap-2">
              <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-emerald-500/15 border border-emerald-500/30 text-xs text-emerald-300 font-semibold">
                <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                <span>Connected: {user.email}</span>
              </div>
              <button
                onClick={onLogout}
                className="text-xs text-stone-400 hover:text-red-400 px-2 py-1 rounded hover:bg-stone-800"
              >
                Disconnect
              </button>
            </div>
          ) : (
            <div className="text-xs text-stone-400">Not connected yet</div>
          )}
        </div>

        {!user ? (
          /* Sign in with Google (using official GSI button styling from skill) */
          <div className="py-8 text-center space-y-4 max-w-md mx-auto">
            <p className="text-xs text-stone-300">
              Sign in with your Google Account with permission to create and sync your café cash-flow
              spreadsheet directly to your personal Google Sheets.
            </p>

            <div className="flex justify-center">
              <button
                id="google-signin-btn"
                onClick={onLogin}
                disabled={isLoggingIn}
                className="gsi-material-button inline-flex items-center gap-3 px-5 py-3 rounded-xl bg-white hover:bg-stone-100 text-stone-800 font-semibold text-sm shadow-md transition-all active:scale-95 disabled:opacity-50"
              >
                <div className="gsi-material-button-icon w-5 h-5">
                  <svg
                    version="1.1"
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 48 48"
                    className="w-full h-full"
                  >
                    <path
                      fill="#EA4335"
                      d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"
                    ></path>
                    <path
                      fill="#4285F4"
                      d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"
                    ></path>
                    <path
                      fill="#FBBC05"
                      d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z"
                    ></path>
                    <path
                      fill="#34A853"
                      d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"
                    ></path>
                  </svg>
                </div>
                <span className="gsi-material-button-contents">
                  {isLoggingIn ? 'Connecting...' : 'Sign in with Google'}
                </span>
              </button>
            </div>
          </div>
        ) : (
          /* When signed in: Linked sheet controls */
          <div className="space-y-6">
            {linkedSheetUrl ? (
              <div className="bg-stone-950 p-5 rounded-2xl border border-emerald-500/30 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="w-5 h-5 text-emerald-400" />
                    <span className="font-bold text-sm text-white">Active Google Sheet Linked</span>
                  </div>
                  <p className="text-xs text-stone-400 mt-1">
                    Spreadsheet ID: <code className="text-amber-300 text-[11px]">{linkedSheetId}</code>
                  </p>
                </div>

                <div className="flex items-center gap-3 flex-wrap">
                  <a
                    id="open-google-sheet-link"
                    href={linkedSheetUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-stone-950 font-bold text-xs shadow transition-all"
                  >
                    <span>Open in Google Sheets</span>
                    <ExternalLink className="w-3.5 h-3.5" />
                  </a>

                  <button
                    id="resync-sheet-btn"
                    onClick={() => initiateAction('resync')}
                    disabled={isSyncing}
                    className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-stone-800 hover:bg-stone-700 text-stone-200 font-semibold text-xs border border-stone-700 transition-all disabled:opacity-50"
                  >
                    <RefreshCw className={`w-3.5 h-3.5 ${isSyncing ? 'animate-spin' : ''}`} />
                    <span>{isSyncing ? 'Updating Sheet...' : 'Update & Re-Sync'}</span>
                  </button>
                </div>
              </div>
            ) : (
              <div className="bg-stone-950 p-6 rounded-2xl border border-stone-800 text-center space-y-4">
                <p className="text-xs text-stone-300 max-w-md mx-auto">
                  You haven't generated a Google Sheet for your café yet. Click below to automatically
                  create a formatted spreadsheet with <b>"Cash Flow Log"</b> and{' '}
                  <b>"Daily Profit &amp; Targets"</b> tabs!
                </p>

                <button
                  id="create-sheet-btn"
                  onClick={() => initiateAction('create')}
                  disabled={isSyncing}
                  className="inline-flex items-center gap-2 px-6 py-3 rounded-2xl bg-amber-400 hover:bg-amber-300 text-stone-950 font-bold text-sm shadow-md transition-all active:scale-95 disabled:opacity-50"
                >
                  <PlusCircle className="w-4 h-4" />
                  <span>{isSyncing ? 'Creating Sheet...' : 'Create My Café Google Sheet'}</span>
                </button>
              </div>
            )}

            {/* Sync feedback alerts */}
            {syncStatus && (
              <div className="p-3 bg-emerald-500/10 border border-emerald-500/30 rounded-xl text-xs text-emerald-300 flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 shrink-0" />
                <span>{syncStatus}</span>
              </div>
            )}

            {syncError && (
              <div className="p-4 bg-rose-500/15 border border-rose-500/40 rounded-2xl text-xs text-rose-200 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                <div className="flex items-start gap-2.5">
                  <AlertTriangle className="w-5 h-5 text-rose-400 shrink-0 mt-0.5" />
                  <div className="space-y-1">
                    <span className="font-bold block text-white">Google Sheets Sync Notice</span>
                    <span className="text-rose-200 leading-relaxed">{syncError}</span>
                  </div>
                </div>
                <button
                  id="reauth-google-btn"
                  onClick={onLogin}
                  disabled={isLoggingIn}
                  className="shrink-0 px-3.5 py-2 rounded-xl bg-rose-500 hover:bg-rose-400 text-stone-950 font-bold text-xs shadow transition-all active:scale-95 self-end sm:self-center"
                >
                  {isLoggingIn ? 'Connecting...' : 'Re-authorize Google Permissions'}
                </button>
              </div>
            )}

            {/* Offline CSV Backup Alternative */}
            <div className="pt-4 border-t border-stone-800 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 text-xs">
              <div className="text-stone-400">
                Want an offline backup or Excel file? You can export your {transactions.length} entries as CSV anytime.
              </div>
              <button
                id="export-csv-btn"
                onClick={handleDownloadCSV}
                className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-stone-800 hover:bg-stone-700 text-stone-300 font-semibold border border-stone-700"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Download CSV File</span>
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Mandatory User Confirmation Dialog before Workspace updates */}
      {showConfirmModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-xs">
          <div
            id="workspace-confirm-dialog"
            className="bg-stone-900 border border-amber-500/40 rounded-2xl max-w-md w-full p-6 shadow-2xl space-y-4"
          >
            <div className="flex items-center gap-3 text-amber-400">
              <ShieldCheck className="w-6 h-6" />
              <h3 className="text-base font-bold text-white">
                {pendingAction === 'create'
                  ? 'Create New Google Sheet in Your Account?'
                  : 'Update and Sync Google Sheet Data?'}
              </h3>
            </div>

            <p className="text-xs text-stone-300 leading-relaxed">
              {pendingAction === 'create'
                ? `This will create a new Google Sheet named "${targetConfig.cafeName} - Cash Flow & Profit Tracker" in your Google Drive and populate it with ${transactions.length} transactions and daily summaries.`
                : `This will update the "Cash Flow Log" and "Daily Profit & Targets" tabs on your linked Google Sheet with your current ${transactions.length} transactions.`}
            </p>

            <div className="flex justify-end gap-3 pt-2">
              <button
                onClick={() => setShowConfirmModal(false)}
                className="px-4 py-2 rounded-xl bg-stone-800 text-stone-300 hover:bg-stone-700 text-xs font-semibold"
              >
                Cancel
              </button>
              <button
                id="confirm-sheet-action-btn"
                onClick={handleConfirmAction}
                className="px-4 py-2 rounded-xl bg-amber-400 hover:bg-amber-300 text-stone-950 font-bold text-xs shadow"
              >
                Confirm &amp; Proceed
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
