'use client';

/**
 * Bank Connection Component
 * Handles connecting to banks via Plaid and syncing transactions
 */

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

interface BankConnectionProps {
  useremail: string;
  onConnectionSuccess: () => void;
}

type ProviderType = 'local' | 'plaid';

interface ConnectedAccount {
  itemId: string;
  institution?: string;
  provider: ProviderType;
}

export default function BankConnection({
  useremail,
  onConnectionSuccess,
}: BankConnectionProps) {
  const router = useRouter();
  const [provider, setProvider] = useState<ProviderType>('local');
  const [isConnecting, setIsConnecting] = useState(false);
  const [isSyncing, setIsSyncing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [connectedAccounts, setConnectedAccounts] = useState<ConnectedAccount[]>([]);

  // Fetch provider status and connected accounts on mount
  useEffect(() => {
    fetchProviderStatus();
    fetchConnectedAccounts();
  }, []);

  const fetchProviderStatus = async () => {
    try {
      const response = await fetch('/api/bank/provider-status');
      if (response.ok) {
        const data = await response.json();
        setProvider(data.active);
      }
    } catch (err) {
      console.error('Failed to fetch provider status:', err);
    }
  };

  const fetchConnectedAccounts = async () => {
    try {
      const response = await fetch('/api/plaid/list-accounts');
      if (response.ok) {
        const data = await response.json();
        if (data.accounts && Array.isArray(data.accounts)) {
          setConnectedAccounts(
            data.accounts.map((acc: any) => ({
              itemId: acc.itemId,
              institution: acc.institution,
              provider: 'plaid' as ProviderType,
            }))
          );
        }
      }
    } catch (err) {
      console.error('Failed to fetch connected accounts:', err);
    }
  };

  // Plaid Link Integration
  const connectPlaid = async () => {
    setError(null);
    setIsConnecting(true);

    try {
      // Create link token
      const tokenResponse = await fetch('/api/plaid/create-link-token', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
      });

      if (!tokenResponse.ok) {
        throw new Error('Failed to create Plaid link token');
      }

      const { link_token } = await tokenResponse.json();

      // Load Plaid Link
      const Plaid = (window as any).Plaid;
      if (!Plaid) {
        throw new Error('Plaid SDK not loaded');
      }

      const handler = Plaid.create({
        token: link_token,
        onSuccess: async (public_token: string, metadata: any) => {
          try {
            // Exchange token
            const exchangeResponse = await fetch('/api/plaid/exchange-public-token', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                public_token,
                institution: metadata?.institution?.name,
              }),
            });

            const exchangeData = await exchangeResponse.json();
            if (!exchangeResponse.ok || !exchangeData.success) {
              throw new Error(exchangeData.error || 'Failed to exchange token');
            }

            // Refresh connected accounts list
            await fetchConnectedAccounts();

            setSuccessMessage('Bank account connected successfully!');
            onConnectionSuccess();
          } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to connect account');
          } finally {
            handler.destroy();
          }
        },
        onExit: () => {
          handler.destroy();
        },
      });

      handler.open();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to initialize Plaid');
    } finally {
      setIsConnecting(false);
    }
  };

  // Sync transactions for a connected account
  const syncTransactions = async (account: ConnectedAccount) => {
    setError(null);
    setIsSyncing(true);

    try {
      const response = await fetch('/api/plaid/sync-transactions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          itemId: account.itemId,
        }),
      });

      const data = await response.json();
      if (!response.ok || !data.success) {
        throw new Error(data.error || 'Failed to sync transactions');
      }

      setSuccessMessage(
        `Synced ${data.synced || 0} transactions for ${data.month || 'current month'}`
      );

      // Redirect to chart page
      const month = data.month || new Date().toISOString().slice(0, 7);
      router.push(`/chart?month=${encodeURIComponent(month)}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to sync transactions');
    } finally {
      setIsSyncing(false);
    }
  };

  // Load Plaid SDK
  useEffect(() => {
    if (provider === 'plaid' && typeof window !== 'undefined') {
      // Check if Plaid is already loaded
      if ((window as any).Plaid) {
        return;
      }

      const script = document.createElement('script');
      script.src = 'https://cdn.plaid.com/link/v2/stable/link-initialize.js';
      script.async = true;
      script.onload = () => {
        console.log('Plaid SDK loaded successfully');
      };
      script.onerror = () => {
        console.error('Failed to load Plaid SDK');
        setError('Failed to load Plaid SDK. Please refresh the page.');
      };
      
      document.body.appendChild(script);
      
      return () => {
        // Only remove if it's still in the DOM
        if (script.parentNode) {
          document.body.removeChild(script);
        }
      };
    }
  }, [provider]);

  if (provider === 'local') {
    return null; // Local provider uses file upload, not this component
  }

  return (
    <div className="w-full space-y-4 rounded-xl border border-border-primary/50 bg-background-primary/50 p-5 backdrop-blur-sm">
      <h3 className="text-lg font-semibold text-text-primary">
        Connect with Plaid
      </h3>
      <p className="text-sm text-text-secondary">
        Link your bank account securely to automatically import transactions.
      </p>

      {/* Connect Button */}
      <button
        onClick={connectPlaid}
        disabled={isConnecting}
        className={`w-full rounded-lg px-4 py-2.5 font-semibold transition-all transform ${
          isConnecting
            ? 'bg-background-tertiary text-text-tertiary cursor-not-allowed'
            : 'bg-gradient-to-r from-accent-500 to-secondary-500 hover:from-accent-600 hover:to-secondary-600 text-white shadow-lg hover:scale-105'
        }`}
      >
        {isConnecting ? 'Connecting...' : 'Connect Bank Account'}
      </button>

      {/* Connected Accounts */}
      {connectedAccounts.length > 0 && (
        <div className="space-y-2">
          <h4 className="text-sm font-semibold text-text-primary">Connected Accounts</h4>
          {connectedAccounts.map((account, index) => (
            <div
              key={index}
              className="flex items-center justify-between p-3 rounded-lg bg-background-secondary border border-border-secondary"
            >
              <div>
                <p className="text-sm font-medium text-text-primary">
                  {account.institution || 'Bank Account'}
                </p>
                <p className="text-xs text-text-tertiary">Plaid</p>
              </div>
              <button
                onClick={() => syncTransactions(account)}
                disabled={isSyncing}
                className="px-3 py-1.5 text-sm rounded-lg bg-primary-500 text-white hover:bg-primary-600 disabled:bg-gray-400 disabled:cursor-not-allowed transition"
              >
                {isSyncing ? 'Syncing...' : 'Sync Now'}
              </button>
            </div>
          ))}
        </div>
      )}

      {/* Error Message */}
      {error && (
        <div className="p-3 rounded-lg bg-red-500/10 border border-red-500/50">
          <p className="text-sm text-red-400">{error}</p>
        </div>
      )}

      {/* Success Message */}
      {successMessage && (
        <div className="p-3 rounded-lg bg-green-500/10 border border-green-500/50">
          <p className="text-sm text-green-400">{successMessage}</p>
        </div>
      )}
    </div>
  );
}
