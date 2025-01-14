export interface UserData {
  publicKey: string;
  totalStaked: number;
  lastLogin: Date;
  stakes: {
    validator: string;
    amount: number;
  }[];
} 