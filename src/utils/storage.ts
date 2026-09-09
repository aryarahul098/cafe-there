import { Transaction, TargetConfig, CashDrawerRecord } from '../types';

export const IN_CATEGORIES = [
  'Specialty Coffee & Espresso',
  'Chai & Cold Beverages',
  'Bakery, Cookies & Croissants',
  'Sandwiches & Toasties',
  'Pastas & Savory Bites',
  'Retail Coffee Beans & Merch',
  'Catering & Bulk Pre-orders',
  'Other Income',
];

export const OUT_CATEGORIES = [
  'Specialty Coffee Beans & Roasts',
  'Milk, Amul Dairy & Oat Milk',
  'Bakery & Kitchen Ingredients',
  'Syrups, Cocoa & Sauces',
  'Takeaway Cups, Lids & Packaging',
  'Daily Staff Wages & Tips',
  'Electricity, Gas & Utilities',
  'Espresso Machine Service & Filters',
  'Cafe Rent & Maintenance',
  'Miscellaneous Petty Cash & Ice',
];

export const DEFAULT_TARGET_CONFIG: TargetConfig = {
  cafeName: "CAFE THERE",
  currency: "₹",
  dailyTarget: 3500, // ₹3,500 daily net profit target
  monthlyTarget: 100000, // ₹1,00,000 monthly profit target
  avgItemPrice: 180, // average coffee/item price ₹180
};

const STORAGE_KEYS = {
  TRANSACTIONS: 'cafe_tracker_transactions_v2',
  TARGET_CONFIG: 'cafe_tracker_targets_v2',
  LINKED_SHEET_ID: 'cafe_tracker_sheet_id',
  LINKED_SHEET_URL: 'cafe_tracker_sheet_url',
  CASH_DRAWER: 'cafe_tracker_cash_drawer_v2',
};

// Realistic initial sample data for CAFE THERE in Indian Rupees (₹)
export const INITIAL_SAMPLE_TRANSACTIONS: Transaction[] = [
  // Today's entries (2026-09-09)
  {
    id: 'tx-0909-1',
    date: '2026-09-09',
    time: '08:00',
    type: 'in',
    category: 'Specialty Coffee & Espresso',
    amount: 3250.0,
    paymentMethod: 'online',
    notes: 'Morning rush (Cappuccinos, flat whites, iced Americanos via UPI/GPay)',
    createdAt: Date.now() - 3600000 * 4,
  },
  {
    id: 'tx-0909-2',
    date: '2026-09-09',
    time: '08:45',
    type: 'in',
    category: 'Bakery, Cookies & Croissants',
    amount: 1450.0,
    paymentMethod: 'cash',
    notes: 'Butter croissants, chocolate muffins & cookies',
    createdAt: Date.now() - 3600000 * 3,
  },
  {
    id: 'tx-0909-3',
    date: '2026-09-09',
    time: '09:15',
    type: 'out',
    category: 'Milk, Amul Dairy & Oat Milk',
    amount: 1200.0,
    paymentMethod: 'cash',
    notes: 'Morning milk delivery (20L Amul Taaza + Oat milk cartons)',
    createdAt: Date.now() - 3600000 * 2,
  },
  {
    id: 'tx-0909-4',
    date: '2026-09-09',
    time: '12:30',
    type: 'in',
    category: 'Sandwiches & Toasties',
    amount: 2800.0,
    paymentMethod: 'online',
    notes: 'Lunch orders (Paneer tikka toasties, pesto sourdough panini)',
    createdAt: Date.now() - 3600000 * 1,
  },
  {
    id: 'tx-0909-5',
    date: '2026-09-09',
    time: '13:15',
    type: 'out',
    category: 'Takeaway Cups, Lids & Packaging',
    amount: 950.0,
    paymentMethod: 'online',
    notes: 'Restocked compostable 250ml cups & craft carry bags via UPI',
    createdAt: Date.now() - 1800000,
  },

  // Yesterday (2026-09-08)
  {
    id: 'tx-0908-1',
    date: '2026-09-08',
    time: '08:30',
    type: 'in',
    category: 'Specialty Coffee & Espresso',
    amount: 4100.0,
    paymentMethod: 'card',
    notes: 'Morning office commuter crowd',
    createdAt: Date.now() - 86400000 * 1,
  },
  {
    id: 'tx-0908-2',
    date: '2026-09-08',
    time: '10:00',
    type: 'in',
    category: 'Chai & Cold Beverages',
    amount: 1850.0,
    paymentMethod: 'online',
    notes: 'Masala chai pots & cold brew tonic (UPI PhonePe)',
    createdAt: Date.now() - 86400000 * 1,
  },
  {
    id: 'tx-0908-3',
    date: '2026-09-08',
    time: '13:30',
    type: 'out',
    category: 'Specialty Coffee Beans & Roasts',
    amount: 1800.0,
    paymentMethod: 'online',
    notes: 'Fresh roasted Chikmagalur single-origin whole beans (2kg)',
    createdAt: Date.now() - 86400000 * 1,
  },
  {
    id: 'tx-0908-4',
    date: '2026-09-08',
    time: '17:00',
    type: 'in',
    category: 'Bakery, Cookies & Croissants',
    amount: 1600.0,
    paymentMethod: 'cash',
    notes: 'Evening coffee & tea snacks',
    createdAt: Date.now() - 86400000 * 1,
  },

  // 2026-09-07
  {
    id: 'tx-0907-1',
    date: '2026-09-07',
    time: '09:00',
    type: 'in',
    category: 'Specialty Coffee & Espresso',
    amount: 5200.0,
    paymentMethod: 'online',
    notes: 'Sunday busy rush',
    createdAt: Date.now() - 86400000 * 2,
  },
  {
    id: 'tx-0907-2',
    date: '2026-09-07',
    time: '11:15',
    type: 'in',
    category: 'Pastas & Savory Bites',
    amount: 2900.0,
    paymentMethod: 'card',
    notes: 'Brunch pastas & garlic sourdough plates',
    createdAt: Date.now() - 86400000 * 2,
  },
  {
    id: 'tx-0907-3',
    date: '2026-09-07',
    time: '15:00',
    type: 'out',
    category: 'Daily Staff Wages & Tips',
    amount: 1500.0,
    paymentMethod: 'cash',
    notes: 'Weekend assistant barista daily payout',
    createdAt: Date.now() - 86400000 * 2,
  },

  // 2026-09-06
  {
    id: 'tx-0906-1',
    date: '2026-09-06',
    time: '09:30',
    type: 'in',
    category: 'Specialty Coffee & Espresso',
    amount: 4800.0,
    paymentMethod: 'online',
    notes: 'Saturday brunch crowd',
    createdAt: Date.now() - 86400000 * 3,
  },
  {
    id: 'tx-0906-2',
    date: '2026-09-06',
    time: '12:00',
    type: 'in',
    category: 'Retail Coffee Beans & Merch',
    amount: 1650.0,
    paymentMethod: 'card',
    notes: 'Retail bag of Estate Dark Roast + ceramic mug',
    createdAt: Date.now() - 86400000 * 3,
  },
  {
    id: 'tx-0906-3',
    date: '2026-09-06',
    time: '18:00',
    type: 'out',
    category: 'Electricity, Gas & Utilities',
    amount: 1100.0,
    paymentMethod: 'online',
    notes: 'Weekly utility reserve / commercial gas cylinder refill',
    createdAt: Date.now() - 86400000 * 3,
  },
];

export function getStoredTransactions(): Transaction[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.TRANSACTIONS);
    if (!raw) {
      localStorage.setItem(STORAGE_KEYS.TRANSACTIONS, JSON.stringify(INITIAL_SAMPLE_TRANSACTIONS));
      return INITIAL_SAMPLE_TRANSACTIONS;
    }
    return JSON.parse(raw);
  } catch (err) {
    console.error('Failed to load transactions:', err);
    return INITIAL_SAMPLE_TRANSACTIONS;
  }
}

export function saveTransactions(transactions: Transaction[]) {
  try {
    localStorage.setItem(STORAGE_KEYS.TRANSACTIONS, JSON.stringify(transactions));
  } catch (err) {
    console.error('Failed to save transactions:', err);
  }
}

export function getStoredTargets(): TargetConfig {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.TARGET_CONFIG);
    if (!raw) {
      localStorage.setItem(STORAGE_KEYS.TARGET_CONFIG, JSON.stringify(DEFAULT_TARGET_CONFIG));
      return DEFAULT_TARGET_CONFIG;
    }
    return { ...DEFAULT_TARGET_CONFIG, ...JSON.parse(raw) };
  } catch (err) {
    return DEFAULT_TARGET_CONFIG;
  }
}

export function saveTargets(targets: TargetConfig) {
  try {
    localStorage.setItem(STORAGE_KEYS.TARGET_CONFIG, JSON.stringify(targets));
  } catch (err) {
    console.error('Failed to save targets:', err);
  }
}

export function getLinkedSheetInfo(): { id: string | null; url: string | null } {
  return {
    id: localStorage.getItem(STORAGE_KEYS.LINKED_SHEET_ID),
    url: localStorage.getItem(STORAGE_KEYS.LINKED_SHEET_URL),
  };
}

export function saveLinkedSheetInfo(id: string | null, url: string | null) {
  if (id && url) {
    localStorage.setItem(STORAGE_KEYS.LINKED_SHEET_ID, id);
    localStorage.setItem(STORAGE_KEYS.LINKED_SHEET_URL, url);
  } else {
    localStorage.removeItem(STORAGE_KEYS.LINKED_SHEET_ID);
    localStorage.removeItem(STORAGE_KEYS.LINKED_SHEET_URL);
  }
}

export function getStoredCashDrawer(date: string): CashDrawerRecord {
  try {
    const raw = localStorage.getItem(`${STORAGE_KEYS.CASH_DRAWER}_${date}`);
    if (raw) return JSON.parse(raw);
  } catch {}
  return {
    date,
    openingCash: 2000, // standard morning cash float (₹2,000)
    closingCashCalculated: 2000,
  };
}

export function saveCashDrawer(record: CashDrawerRecord) {
  try {
    localStorage.setItem(`${STORAGE_KEYS.CASH_DRAWER}_${record.date}`, JSON.stringify(record));
  } catch {}
}
