import { StakeTransfer } from '../types/transaction';

export const mockTransfers: StakeTransfer[] = [
  {
    from: "CimoAGumRFTdNvcmh8KhpTnZM5WCPryYVLqRSKh6CDft",  // Validator 1
    to: "AfxNMBuApFSqNR39U2eqX1pJajmj2ai31dtTorMtQn3i",    // Validator 2
    amount: "100000000",
    timestamp: Date.now() - 3600000,
    signature: "mock1"
  },
  {
    from: "AfxNMBuApFSqNR39U2eqX1pJajmj2ai31dtTorMtQn3i",  // Validator 2
    to: "CimoAGumRFTdNvcmh8KhpTnZM5WCPryYVLqRSKh6CDft",    // Validator 1
    amount: "150000000",
    timestamp: Date.now() - 1800000,
    signature: "mock2"
  },
  {
    from: "ChorusmmK7i1AxXeiTtQgQZhQNiXYU84ULeaYF1EH15n",  // Chorus One
    to: "CimoAGumRFTdNvcmh8KhpTnZM5WCPryYVLqRSKh6CDft",    // Validator 1
    amount: "200000000",
    timestamp: Date.now() - 900000,
    signature: "mock3"
  }
]; 