import React, { createContext, useContext, useState, useEffect } from 'react';
import { useWallet } from '@solana/wallet-adapter-react';
import { fetchUserData, createUser, updateUserData } from '../services/userService';

interface UserData {
  publicKey: string;
  username?: string;
  totalStaked: number;
  lastLogin: Date;
  stakes: {
    validator: string;
    amount: number;
  }[];
}

interface UserContextType {
  user: UserData | null;
  loading: boolean;
  login: () => Promise<void>;
  logout: () => void;
  updateUser: (data: Partial<UserData>) => Promise<void>;
}

const UserContext = createContext<UserContextType>({
  user: null,
  loading: true,
  login: async () => {},
  logout: () => {},
  updateUser: async () => {},
});

export function UserProvider({ children }: { children: React.ReactNode }) {
  const { publicKey, connected } = useWallet();
  const [user, setUser] = useState<UserData | null>(null);
  const [loading, setLoading] = useState(true);

  // Auto-login when wallet connects
  useEffect(() => {
    if (connected && publicKey) {
      login();
    } else {
      setUser(null);
    }
  }, [connected, publicKey]);

  const login = async () => {
    if (!publicKey) return;

    setLoading(true);
    try {
      // Check if user exists in database
      const userData = await fetchUserData(publicKey.toString());
      
      if (userData) {
        // Existing user
        setUser(userData);
      } else {
        // New user - create account
        const newUser: UserData = {
          publicKey: publicKey.toString(),
          totalStaked: 0,
          lastLogin: new Date(),
          stakes: []
        };
        await createUser(newUser);
        setUser(newUser);
      }
    } catch (error) {
      console.error('Login failed:', error);
    } finally {
      setLoading(false);
    }
  };

  const logout = () => {
    setUser(null);
  };

  const updateUser = async (data: Partial<UserData>) => {
    if (!user) return;
    
    try {
      // Update in database
      await updateUserData(user.publicKey, data);
      // Update local state
      setUser(prev => prev ? { ...prev, ...data } : null);
    } catch (error) {
      console.error('Update failed:', error);
    }
  };

  return (
    <UserContext.Provider value={{ user, loading, login, logout, updateUser }}>
      {children}
    </UserContext.Provider>
  );
}

export const useUser = () => useContext(UserContext); 