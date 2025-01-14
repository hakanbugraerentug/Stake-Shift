import { userStakes } from '../data/validators';
import type { UserData } from '../types/user';

export async function fetchUserData(publicKey: string): Promise<UserData> {
  return {
    publicKey,
    totalStaked: userStakes.reduce((sum, stake) => sum + parseFloat(stake.amount), 0),
    lastLogin: new Date(),
    stakes: userStakes.map(stake => ({
      validator: stake.validator,
      amount: parseFloat(stake.amount)
    }))
  };
}

export async function createUser(userData: UserData): Promise<void> {
  // No-op since we're not using a database
  return;
}

export async function updateUserData(publicKey: string, data: Partial<UserData>): Promise<void> {
  // No-op since we're not using a database
  return;
} 