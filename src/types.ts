export type TransactionType = 'in' | 'out';

export type PaymentMethod = 'cash' | 'card' | 'online' | 'other';

export interface Transaction {
  id: string;
  date: string; // YYYY-MM-DD
  time: string; // HH:mm
  type: TransactionType;
  category: string;
  amount: number;
  paymentMethod: PaymentMethod;
  notes?: string;
  receiptNumber?: string;
  createdAt: number;
}

export interface TargetConfig {
  cafeName: string;
  currency: string;
  dailyTarget: number;
  monthlyTarget: number;
  avgItemPrice: number; // For item breakdown like "sell X more coffees"
}

export interface CashDrawerRecord {
  date: string; // YYYY-MM-DD
  openingCash: number;
  closingCashCalculated: number;
  closingCashActual?: number;
  notes?: string;
}

export interface DailyStats {
  date: string;
  totalIn: number;
  totalOut: number;
  netProfit: number;
  cashIn: number;
  cardIn: number;
  onlineIn: number;
  transactionCount: number;
  targetMet: boolean;
}

export interface MonthlySummary {
  month: string; // YYYY-MM
  totalIn: number;
  totalOut: number;
  netProfit: number;
  marginPercent: number;
  daysActive: number;
  daysTargetHit: number;
  topExpenseCategory: { category: string; amount: number } | null;
}
