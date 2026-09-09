import { Transaction, TargetConfig } from '../types';

export interface SyncResult {
  success: boolean;
  spreadsheetId?: string;
  spreadsheetUrl?: string;
  updatedRows?: number;
  message: string;
}

/**
 * Creates a formatted Google Sheet for the café and populates initial tabs & transactions
 */
export async function createCafeSpreadsheet(
  accessToken: string,
  cafeName: string,
  transactions: Transaction[],
  targetConfig: TargetConfig
): Promise<SyncResult> {
  try {
    const title = `${cafeName || 'My Cafe'} - Cash Flow & Profit Tracker`;
    
    // 1. Create spreadsheet with 2 sheets: "Cash Flow Log" and "Daily Summary"
    const createResponse = await fetch('https://sheets.googleapis.com/v4/spreadsheets', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        properties: {
          title,
        },
        sheets: [
          {
            properties: {
              title: 'Cash Flow Log',
              gridProperties: {
                frozenRowCount: 1,
              },
            },
          },
          {
            properties: {
              title: 'Daily Profit & Targets',
              gridProperties: {
                frozenRowCount: 1,
              },
            },
          },
        ],
      }),
    });

    if (!createResponse.ok) {
      const err = await createResponse.json().catch(() => ({}));
      const rawMsg = err?.error?.message || `Failed to create sheet: ${createResponse.statusText}`;
      if (rawMsg.toLowerCase().includes('insufficient') || createResponse.status === 403) {
        throw new Error(
          'Google Drive & Sheets permissions need to be updated. Please click "Re-authorize Google Permissions" below to grant access.'
        );
      }
      throw new Error(rawMsg);
    }

    const createdData = await createResponse.json();
    const spreadsheetId = createdData.spreadsheetId;
    const spreadsheetUrl = createdData.spreadsheetUrl;

    // 2. Populate "Cash Flow Log"
    const logHeaders = [
      'Date',
      'Time',
      'Type (IN / OUT)',
      'Description / Item',
      `Amount (${targetConfig.currency})`,
      'Payment Method',
      'Notes / Details',
      'Receipt #',
    ];

    const sortedTransactions = [...transactions].sort(
      (a, b) => new Date(`${a.date}T${a.time || '00:00'}`).getTime() - new Date(`${b.date}T${b.time || '00:00'}`).getTime()
    );

    const logRows = sortedTransactions.map((tx) => [
      tx.date,
      tx.time,
      tx.type === 'in' ? 'IN (Sale/Revenue)' : 'OUT (Expense)',
      tx.notes || tx.category || (tx.type === 'in' ? 'Sale / Revenue' : 'Expense'),
      tx.amount,
      tx.paymentMethod.toUpperCase(),
      tx.notes || '',
      tx.receiptNumber || '',
    ]);

    const logValues = [logHeaders, ...logRows];

    await fetch(
      `https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}/values/'Cash Flow Log'!A1?valueInputOption=USER_ENTERED`,
      {
        method: 'PUT',
        headers: {
          Authorization: `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          range: "'Cash Flow Log'!A1",
          majorDimension: 'ROWS',
          values: logValues,
        }),
      }
    );

    // 3. Populate "Daily Profit & Targets"
    const datesMap: Record<string, { in: number; out: number }> = {};
    for (const tx of transactions) {
      if (!datesMap[tx.date]) {
        datesMap[tx.date] = { in: 0, out: 0 };
      }
      if (tx.type === 'in') {
        datesMap[tx.date].in += tx.amount;
      } else {
        datesMap[tx.date].out += tx.amount;
      }
    }

    const summaryHeaders = [
      'Date',
      `Total Cash In (${targetConfig.currency})`,
      `Total Cash Out (${targetConfig.currency})`,
      `Net Daily Profit (${targetConfig.currency})`,
      `Daily Target (${targetConfig.currency})`,
      'Target Met? 🔥',
    ];

    const sortedDates = Object.keys(datesMap).sort();
    const summaryRows = sortedDates.map((date) => {
      const data = datesMap[date];
      const profit = data.in - data.out;
      const met = profit >= targetConfig.dailyTarget ? 'YES ✅' : 'PENDING ⏳';
      return [date, data.in, data.out, profit, targetConfig.dailyTarget, met];
    });

    const summaryValues = [summaryHeaders, ...summaryRows];

    await fetch(
      `https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}/values/'Daily Profit & Targets'!A1?valueInputOption=USER_ENTERED`,
      {
        method: 'PUT',
        headers: {
          Authorization: `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          range: "'Daily Profit & Targets'!A1",
          majorDimension: 'ROWS',
          values: summaryValues,
        }),
      }
    );

    return {
      success: true,
      spreadsheetId,
      spreadsheetUrl,
      updatedRows: logRows.length,
      message: `Google Sheet "${title}" created and synced successfully!`,
    };
  } catch (error: any) {
    console.error('Error creating Google Sheet:', error);
    return {
      success: false,
      message: error?.message || 'Failed to create spreadsheet',
    };
  }
}

/**
 * Appends a new transaction directly into an existing Google Sheet
 */
export async function appendTransactionToSheet(
  accessToken: string,
  spreadsheetId: string,
  tx: Transaction
): Promise<boolean> {
  try {
    const row = [
      tx.date,
      tx.time,
      tx.type === 'in' ? 'IN (Sale/Revenue)' : 'OUT (Expense)',
      tx.notes || tx.category || (tx.type === 'in' ? 'Sale / Revenue' : 'Expense'),
      tx.amount,
      tx.paymentMethod.toUpperCase(),
      tx.notes || '',
      tx.receiptNumber || '',
    ];

    const response = await fetch(
      `https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}/values/'Cash Flow Log'!A:H:append?valueInputOption=USER_ENTERED`,
      {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          range: "'Cash Flow Log'!A:H",
          majorDimension: 'ROWS',
          values: [row],
        }),
      }
    );

    return response.ok;
  } catch (err) {
    console.error('Error appending transaction to sheet:', err);
    return false;
  }
}

/**
 * Resyncs all current data into an existing Google Sheet
 */
export async function resyncExistingSheet(
  accessToken: string,
  spreadsheetId: string,
  transactions: Transaction[],
  targetConfig: TargetConfig
): Promise<SyncResult> {
  try {
    // 1. Update Cash Flow Log
    const logHeaders = [
      'Date',
      'Time',
      'Type (IN / OUT)',
      'Description / Item',
      `Amount (${targetConfig.currency})`,
      'Payment Method',
      'Notes / Details',
      'Receipt #',
    ];

    const sortedTransactions = [...transactions].sort(
      (a, b) => new Date(`${a.date}T${a.time || '00:00'}`).getTime() - new Date(`${b.date}T${b.time || '00:00'}`).getTime()
    );

    const logRows = sortedTransactions.map((tx) => [
      tx.date,
      tx.time,
      tx.type === 'in' ? 'IN (Sale/Revenue)' : 'OUT (Expense)',
      tx.notes || tx.category || (tx.type === 'in' ? 'Sale / Revenue' : 'Expense'),
      tx.amount,
      tx.paymentMethod.toUpperCase(),
      tx.notes || '',
      tx.receiptNumber || '',
    ]);

    // Clear old rows first to prevent stale leftover rows
    await fetch(
      `https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}/values/'Cash Flow Log'!A1:H1000:clear`,
      {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
        },
      }
    );

    await fetch(
      `https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}/values/'Cash Flow Log'!A1?valueInputOption=USER_ENTERED`,
      {
        method: 'PUT',
        headers: {
          Authorization: `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          range: "'Cash Flow Log'!A1",
          majorDimension: 'ROWS',
          values: [logHeaders, ...logRows],
        }),
      }
    );

    // 2. Update Daily Profit & Targets
    const datesMap: Record<string, { in: number; out: number }> = {};
    for (const tx of transactions) {
      if (!datesMap[tx.date]) {
        datesMap[tx.date] = { in: 0, out: 0 };
      }
      if (tx.type === 'in') {
        datesMap[tx.date].in += tx.amount;
      } else {
        datesMap[tx.date].out += tx.amount;
      }
    }

    const summaryHeaders = [
      'Date',
      `Total Cash In (${targetConfig.currency})`,
      `Total Cash Out (${targetConfig.currency})`,
      `Net Daily Profit (${targetConfig.currency})`,
      `Daily Target (${targetConfig.currency})`,
      'Target Met? 🔥',
    ];

    const sortedDates = Object.keys(datesMap).sort();
    const summaryRows = sortedDates.map((date) => {
      const data = datesMap[date];
      const profit = data.in - data.out;
      const met = profit >= targetConfig.dailyTarget ? 'YES ✅' : 'PENDING ⏳';
      return [date, data.in, data.out, profit, targetConfig.dailyTarget, met];
    });

    await fetch(
      `https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}/values/'Daily Profit & Targets'!A1:F500:clear`,
      {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
        },
      }
    );

    await fetch(
      `https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}/values/'Daily Profit & Targets'!A1?valueInputOption=USER_ENTERED`,
      {
        method: 'PUT',
        headers: {
          Authorization: `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          range: "'Daily Profit & Targets'!A1",
          majorDimension: 'ROWS',
          values: [summaryHeaders, ...summaryRows],
        }),
      }
    );

    return {
      success: true,
      spreadsheetId,
      spreadsheetUrl: `https://docs.google.com/spreadsheets/d/${spreadsheetId}/edit`,
      updatedRows: logRows.length,
      message: 'Google Sheet successfully synced and up to date!',
    };
  } catch (error: any) {
    console.error('Error resyncing Google Sheet:', error);
    return {
      success: false,
      message: error?.message || 'Failed to update Google Sheet',
    };
  }
}
