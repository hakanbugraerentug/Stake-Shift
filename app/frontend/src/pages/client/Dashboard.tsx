import React from 'react';
import { ValidatorsTable } from '../../components/ValidatorsTable';
import { TokenPurchase } from '../../components/token-purchase';

export function ClientDashboard() {
  return (
    <div className="space-y-8">
      {/* Token Purchase Section */}
      <section className="space-y-4">
        <h2 className="text-2xl font-semibold dark:text-dark-text">Token Exchange</h2>
        <TokenPurchase />
      </section>

      {/* Validators Section */}
      <section className="space-y-4">
        <h2 className="text-2xl font-semibold dark:text-dark-text">Validators</h2>
        <ValidatorsTable isAdmin={false} />
      </section>
    </div>
  );
} 