export interface TestProfile {
  address: string;
  transactions: Transaction[];
  cycles: {
    direct: DirectCycle[];
    triangle: TriangleCycle[];
  };
  stats: {
    totalTransactions: number;
    totalValue: number;
    averageAmount: number;
    lastUpdated: number;
  };
}

interface Transaction {
  from: string;
  to: string;
  amount: number;
  timestamp: number;
  status: string;
  signature: string;
}

interface DirectCycle {
  addresses: [string, string];
  amounts: [number, number];
  timestamp: number;
}

interface TriangleCycle {
  addresses: [string, string, string];
  amounts: [number, number, number];
  timestamp: number;
}

export const testProfiles: Record<string, TestProfile> = {
  // Profile with both types of cycles
  complexProfile: {
    address: "Complex7rfK6eKM1DFNvpDLvwYnuKALEhBpQFnPGvKJx",
    transactions: [
      {
        from: "Validator1",
        to: "Validator2",
        amount: 10.00,
        timestamp: Date.now() - 86400000,
        status: 'confirmed',
        signature: '23456...'
      },
      {
        from: "Validator2",
        to: "Validator1",
        amount: 15.00,
        timestamp: Date.now() - 82800000,
        status: 'confirmed',
        signature: '34567...'
      },
      {
        from: "Validator1",
        to: "Validator3",
        amount: 5.00,
        timestamp: Date.now() - 79200000,
        status: 'confirmed',
        signature: '45678...'
      },
      {
        from: "Validator3",
        to: "Validator2",
        amount: 8.00,
        timestamp: Date.now() - 75600000,
        status: 'confirmed',
        signature: '56789...'
      }
    ],
    cycles: {
      direct: [{
        addresses: ["Validator1", "Validator2"],
        amounts: [10.00, 15.00],
        timestamp: Date.now() - 82800000
      }],
      triangle: [{
        addresses: ["Validator1", "Validator3", "Validator2"],
        amounts: [5.00, 8.00, 15.00],
        timestamp: Date.now() - 75600000
      }]
    },
    stats: {
      totalTransactions: 4,
      totalValue: 38.00,
      averageAmount: 9.50,
      lastUpdated: Date.now()
    }
  },
  
  // Clean profile without transactions
  cleanProfile: {
    address: "Clean8rfK6eKM1DFNvpDLvwYnuKALEhBpQFnPGvKJx",
    transactions: [],
    cycles: {
      direct: [],
      triangle: []
    }
  }
}; 