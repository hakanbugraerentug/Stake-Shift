export interface TokenBalance {
  amount: number;
  symbol: string;
  decimals: number;
}

export interface TokenPrice {
  solPrice: number;  // Price in SOL
  usdPrice: number;  // Price in USD (optional)
} 