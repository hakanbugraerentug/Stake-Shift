export interface StakeTransfer {
  from: string;
  to: string;
  amount: string;
  timestamp: number;
  signature?: string;
}

export interface CycleInfo {
  type: 'direct' | 'triangle';
  nodes: string[];
  amounts: string[];
  timestamp: number;
}

export interface DashboardStats {
  totalTransactions: number;
  directCycles: number;
  triangleCycles: number;
  potentialSavings: number;
}

export interface TransactionHistory {
  signature: string;
  date: string;
  from: string;
  to: string;
  amount: number;
  status: string;
} 