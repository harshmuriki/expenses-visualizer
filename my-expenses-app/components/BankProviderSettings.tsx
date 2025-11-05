'use client';

/**
 * Bank Provider Settings Component
 *
 * Allows users to view and understand which bank connection provider is active
 * and provides information about switching between providers.
 */

import React, { useState, useEffect } from 'react';

interface BankProviderSettingsProps {
  isOpen: boolean;
  onClose: () => void;
}

type ProviderType = 'local' | 'plaid' | 'teller';

interface ProviderInfo {
  name: string;
  description: string;
  features: string[];
  limitations: string[];
  cost: string;
  available: boolean;
}

const providerDetails: Record<ProviderType, ProviderInfo> = {
  local: {
    name: 'Local Upload (CSV/PDF)',
    description: 'Upload transaction files manually from your computer',
    features: [
      'Complete privacy - data never leaves your control',
      'Works with any bank',
      'No API keys or configuration needed',
      'Support for CSV and PDF formats',
    ],
    limitations: [
      'Manual import process',
      'No real-time sync',
      'Requires downloading statements from your bank',
    ],
    cost: 'Free',
    available: true,
  },
  plaid: {
    name: 'Plaid',
    description: 'Industry-leading bank connection service with 12,000+ institutions',
    features: [
      'Connects to 12,000+ banks',
      'Real-time transaction sync',
      'Automatic categorization',
      'Secure OAuth authentication',
    ],
    limitations: [
      'Requires Plaid account and API keys',
      'Usage-based pricing after free development tier',
    ],
    cost: 'Paid (free for development)',
    available: false,
  },
  teller: {
    name: 'Teller',
    description: 'Developer-friendly bank API with 100 free connections',
    features: [
      '100 free live connections forever',
      'Connects to major US banks',
      'Simple, reliable API',
      'Transparent pricing',
    ],
    limitations: [
      'Requires Teller account and App ID',
      'Primarily focused on US banks',
      'Smaller bank coverage than Plaid',
    ],
    cost: 'Free (100 connections) + usage-based',
    available: false,
  },
};

export default function BankProviderSettings({
  isOpen,
  onClose,
}: BankProviderSettingsProps) {
  const [activeProvider, setActiveProvider] = useState<ProviderType>('local');
  const [availableProviders, setAvailableProviders] = useState<ProviderType[]>([
    'local',
  ]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (isOpen) {
      fetchProviderStatus();
    }
  }, [isOpen]);

  const fetchProviderStatus = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/bank/provider-status');
      if (response.ok) {
        const data = await response.json();
        setActiveProvider(data.active);
        setAvailableProviders(data.available);

        // Update provider availability
        providerDetails.plaid.available = data.available.includes('plaid');
        providerDetails.teller.available = data.available.includes('teller');
      }
    } catch (error) {
      console.error('Failed to fetch provider status:', error);
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 bg-white border-b px-6 py-4 flex justify-between items-center">
          <h2 className="text-2xl font-bold text-gray-800">
            Bank Connection Settings
          </h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 text-2xl font-bold"
            aria-label="Close"
          >
            ×
          </button>
        </div>

        {/* Content */}
        <div className="p-6">
          {loading ? (
            <div className="text-center py-8">
              <div className="inline-block animate-spin rounded-full h-8 w-8 border-4 border-gray-300 border-t-blue-600"></div>
              <p className="mt-2 text-gray-600">Loading provider information...</p>
            </div>
          ) : (
            <>
              {/* Current Provider */}
              <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                <p className="text-sm text-gray-600 mb-1">Active Provider</p>
                <p className="text-xl font-semibold text-blue-900">
                  {providerDetails[activeProvider].name}
                </p>
              </div>

              {/* Provider Cards */}
              <div className="space-y-6">
                {(Object.keys(providerDetails) as ProviderType[]).map(
                  (providerKey) => {
                    const provider = providerDetails[providerKey];
                    const isActive = providerKey === activeProvider;
                    const isAvailable =
                      providerKey === 'local' ||
                      availableProviders.includes(providerKey);

                    return (
                      <div
                        key={providerKey}
                        className={`border rounded-lg p-5 ${
                          isActive
                            ? 'border-blue-500 bg-blue-50'
                            : isAvailable
                              ? 'border-gray-300 bg-white'
                              : 'border-gray-200 bg-gray-50 opacity-75'
                        }`}
                      >
                        <div className="flex justify-between items-start mb-3">
                          <div>
                            <h3 className="text-lg font-bold text-gray-800 flex items-center gap-2">
                              {provider.name}
                              {isActive && (
                                <span className="text-xs bg-blue-600 text-white px-2 py-1 rounded">
                                  Active
                                </span>
                              )}
                              {!isAvailable && (
                                <span className="text-xs bg-gray-400 text-white px-2 py-1 rounded">
                                  Not Configured
                                </span>
                              )}
                            </h3>
                            <p className="text-sm text-gray-600 mt-1">
                              {provider.description}
                            </p>
                          </div>
                          <div className="text-right">
                            <p className="text-sm font-semibold text-gray-700">
                              {provider.cost}
                            </p>
                          </div>
                        </div>

                        <div className="grid md:grid-cols-2 gap-4 mt-4">
                          {/* Features */}
                          <div>
                            <h4 className="text-sm font-semibold text-gray-700 mb-2">
                              ✅ Features
                            </h4>
                            <ul className="text-sm text-gray-600 space-y-1">
                              {provider.features.map((feature, idx) => (
                                <li key={idx}>• {feature}</li>
                              ))}
                            </ul>
                          </div>

                          {/* Limitations */}
                          <div>
                            <h4 className="text-sm font-semibold text-gray-700 mb-2">
                              ⚠️ Limitations
                            </h4>
                            <ul className="text-sm text-gray-600 space-y-1">
                              {provider.limitations.map((limitation, idx) => (
                                <li key={idx}>• {limitation}</li>
                              ))}
                            </ul>
                          </div>
                        </div>

                        {!isAvailable && providerKey !== 'local' && (
                          <div className="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded">
                            <p className="text-sm text-yellow-800">
                              <strong>Setup Required:</strong> To enable{' '}
                              {provider.name}, add the following to your{' '}
                              <code className="bg-yellow-100 px-1 rounded">
                                .env
                              </code>{' '}
                              file:
                            </p>
                            <pre className="mt-2 text-xs bg-yellow-100 p-2 rounded overflow-x-auto">
                              {providerKey === 'plaid' && (
                                <>
                                  BANK_PROVIDER=plaid{'\n'}
                                  PLAID_CLIENT_ID=your-client-id{'\n'}
                                  PLAID_SECRET=your-secret
                                </>
                              )}
                              {providerKey === 'teller' && (
                                <>
                                  BANK_PROVIDER=teller{'\n'}
                                  TELLER_APP_ID=your-app-id
                                </>
                              )}
                            </pre>
                          </div>
                        )}
                      </div>
                    );
                  }
                )}
              </div>

              {/* Info Box */}
              <div className="mt-6 p-4 bg-gray-100 border border-gray-300 rounded-lg">
                <h4 className="font-semibold text-gray-800 mb-2">
                  💡 How to Switch Providers
                </h4>
                <ol className="text-sm text-gray-700 space-y-1 list-decimal list-inside">
                  <li>
                    Update the <code className="bg-gray-200 px-1 rounded">BANK_PROVIDER</code>{' '}
                    variable in your <code className="bg-gray-200 px-1 rounded">.env</code> file
                  </li>
                  <li>Add the required API keys/credentials for your chosen provider</li>
                  <li>Restart your development server</li>
                  <li>The app will automatically use the new provider</li>
                </ol>
              </div>
            </>
          )}
        </div>

        {/* Footer */}
        <div className="sticky bottom-0 bg-gray-50 border-t px-6 py-4 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
