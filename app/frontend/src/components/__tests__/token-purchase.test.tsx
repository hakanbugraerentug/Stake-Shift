import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { TokenPurchase } from '../token-purchase';
import { useToken } from '../../contexts/TokenContext';
import { vi, describe, it, expect, beforeEach } from 'vitest';
import React from 'react';

// Mock the useToken hook
vi.mock('../../contexts/TokenContext', () => ({
  useToken: vi.fn()
}));

describe('TokenPurchase', () => {
  const mockBuyTokens = vi.fn();
  
  beforeEach(() => {
    // Setup default mock values
    (useToken as any).mockReturnValue({
      balance: { amount: 10, symbol: 'SHIFT', decimals: 9 },
      price: { solPrice: 1, usdPrice: 20 },
      buyTokens: mockBuyTokens
    });
  });

  it('displays current token balance', () => {
    render(<TokenPurchase />);
    expect(screen.getByText('Current Balance: 10.00 SHIFT')).toBeInTheDocument();
  });

  it('allows entering amount and purchasing tokens', async () => {
    mockBuyTokens.mockResolvedValueOnce(true);
    render(<TokenPurchase />);

    // Find input and button
    const input = screen.getByPlaceholderText('Amount in SOL');
    const buyButton = screen.getByText('Buy Tokens');

    // Enter amount
    fireEvent.change(input, { target: { value: '5' } });
    expect(input).toHaveValue(5);

    // Click buy button
    fireEvent.click(buyButton);

    // Check if buyTokens was called with correct amount
    expect(mockBuyTokens).toHaveBeenCalledWith(5);

    // Wait for success message
    await waitFor(() => {
      expect(screen.getByText('Successfully purchased SHIFT tokens!')).toBeInTheDocument();
    });
  });

  it('handles purchase failure', async () => {
    mockBuyTokens.mockResolvedValueOnce(false);
    render(<TokenPurchase />);

    const input = screen.getByPlaceholderText('Amount in SOL');
    const buyButton = screen.getByText('Buy Tokens');

    fireEvent.change(input, { target: { value: '5' } });
    fireEvent.click(buyButton);

    await waitFor(() => {
      expect(screen.getByText('Failed to purchase tokens. Please try again.')).toBeInTheDocument();
    });
  });

  it('disables input and button while loading', async () => {
    mockBuyTokens.mockImplementation(() => new Promise(resolve => setTimeout(() => resolve(true), 100)));
    render(<TokenPurchase />);

    const input = screen.getByPlaceholderText('Amount in SOL');
    const buyButton = screen.getByText('Buy Tokens');

    fireEvent.change(input, { target: { value: '5' } });
    fireEvent.click(buyButton);

    expect(input).toBeDisabled();
    expect(buyButton).toBeDisabled();
    expect(screen.getByText('Purchasing...')).toBeInTheDocument();
  });
}); 