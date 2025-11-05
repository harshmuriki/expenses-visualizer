'use client';

/**
 * Teller Connect Component
 *
 * Integrates Teller Connect for bank account linking.
 * Similar to PlaidLink but for Teller's enrollment flow.
 *
 * NOTE: This component provides a basic integration structure.
 * For full Teller Connect integration, you'll need to:
 * 1. Include the Teller Connect SDK script
 * 2. Initialize TellerConnect with your App ID
 * 3. Handle the onSuccess callback
 *
 * See: https://teller.io/docs/guides/connect
 */

import React, { useEffect, useState } from 'react';

interface TellerConnectProps {
  onSuccess: (enrollmentId: string, accessToken: string) => void;
  onExit?: () => void;
  onLoad?: () => void;
  children?: React.ReactNode;
}

declare global {
  interface Window {
    TellerConnect?: {
      setup: (config: {
        applicationId: string;
        onSuccess: (enrollment: { accessToken: string; enrollment: { id: string; institution: { name: string } } }) => void;
        onExit?: () => void;
      }) => {
        open: () => void;
        destroy: () => void;
      };
    };
  }
}

export default function TellerConnect({
  onSuccess,
  onExit,
  onLoad,
  children,
}: TellerConnectProps) {
  const [tellerConnect, setTellerConnect] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [appId, setAppId] = useState<string | null>(null);

  useEffect(() => {
    // Fetch Teller App ID from backend
    const fetchAppId = async () => {
      try {
        const response = await fetch('/api/teller/create-enrollment', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
        });

        if (!response.ok) {
          throw new Error('Failed to get Teller enrollment info');
        }

        const data = await response.json();

        // Extract App ID from enrollment URL (format: teller-connect://APP_ID)
        if (data.enrollment_url) {
          const appIdMatch = data.enrollment_url.match(/teller-connect:\/\/(.+)/);
          if (appIdMatch) {
            setAppId(appIdMatch[1]);
          }
        }
      } catch (err) {
        console.error('Error fetching Teller App ID:', err);
        setError(err instanceof Error ? err.message : 'Failed to initialize Teller');
      }
    };

    fetchAppId();
  }, []);

  useEffect(() => {
    if (!appId) return;

    // Load Teller Connect SDK
    const script = document.createElement('script');
    script.src = 'https://cdn.teller.io/connect/connect.js';
    script.async = true;
    script.onload = () => {
      if (window.TellerConnect) {
        const connector = window.TellerConnect.setup({
          applicationId: appId,
          onSuccess: async (enrollment) => {
            const accessToken = enrollment.accessToken;
            const enrollmentId = enrollment.enrollment.id;

            // Send to backend for validation and storage
            try {
              const response = await fetch('/api/teller/validate-enrollment', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                  accessToken,
                  institution: enrollment.enrollment.institution.name,
                }),
              });

              if (response.ok) {
                onSuccess(enrollmentId, accessToken);
              } else {
                console.error('Failed to validate enrollment');
              }
            } catch (err) {
              console.error('Error validating enrollment:', err);
            }
          },
          onExit: () => {
            onExit?.();
          },
        });

        setTellerConnect(connector);
        setLoading(false);
        onLoad?.();
      }
    };
    script.onerror = () => {
      setError('Failed to load Teller Connect SDK');
      setLoading(false);
    };

    document.body.appendChild(script);

    return () => {
      if (tellerConnect) {
        tellerConnect.destroy();
      }
      document.body.removeChild(script);
    };
  }, [appId, onSuccess, onExit, onLoad]);

  const handleClick = () => {
    if (tellerConnect) {
      tellerConnect.open();
    } else {
      console.error('Teller Connect not initialized');
    }
  };

  if (error) {
    return (
      <div className="text-red-600 text-sm">
        Error: {error}
      </div>
    );
  }

  if (loading) {
    return (
      <button
        disabled
        className="px-4 py-2 bg-gray-300 text-gray-600 rounded cursor-not-allowed"
      >
        Loading Teller...
      </button>
    );
  }

  // If children provided, wrap them in a clickable div
  if (children) {
    return <div onClick={handleClick}>{children}</div>;
  }

  // Default button
  return (
    <button
      onClick={handleClick}
      className="px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition font-semibold"
    >
      Connect Bank with Teller
    </button>
  );
}
