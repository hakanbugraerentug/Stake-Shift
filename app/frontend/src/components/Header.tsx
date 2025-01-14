import Logo from "./solanabeach-logo";
import { WalletMultiButton } from "@solana/wallet-adapter-react-ui";
import { Moon, Sun } from "lucide-react";
import { useEffect, useState } from "react";
import { useToken } from '../contexts/TokenContext'

interface HeaderProps {
  isAdmin?: boolean;
}

export default function Header({ isAdmin = false }: HeaderProps) {
  const [isDark, setIsDark] = useState(false);
  const { balance } = useToken();

  useEffect(() => {
    // Check system preference on mount
    if (window.matchMedia('(prefers-color-scheme: dark)').matches) {
      setIsDark(true);
      document.documentElement.classList.add('dark');
    }
  }, []);

  const toggleDarkMode = () => {
    setIsDark(!isDark);
    document.documentElement.classList.toggle('dark');
  };

  return (
    <header className="fixed top-0 left-0 right-0 flex items-center justify-between px-8 h-16 bg-white dark:bg-dark-card border-b border-gray-200 dark:border-dark-border z-50">
      <div className="flex-1">
        <div className="dark:text-dark-text">
          <Logo />
        </div>
      </div>
      <div className="flex items-center gap-4">
      <div className="text-sm dark:text-dark-text">
          <span className="font-medium">{balance.amount.toFixed(2)}</span>
          <span className="ml-1 text-gray-500">{balance.symbol}</span>
        </div>
        <button
          onClick={toggleDarkMode}
          className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-dark-hover"
        >
          {isDark ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
        </button>
        <WalletMultiButton />
        
      </div>
    </header>
  );
}