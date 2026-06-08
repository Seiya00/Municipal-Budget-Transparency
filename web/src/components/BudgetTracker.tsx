'use client';
import { useState, useEffect, useCallback } from 'react';
import {
  contractConfigured,
  readBudgetState,
  buildDisburseXDR,
  type BudgetState,
} from '@/lib/contract';
import { submitSignedXDR, pollTransaction } from '@/lib/payment';
import { NETWORK_PASSPHRASE } from '@/lib/stellar';

export default function BudgetTracker({ publicKey }: { publicKey: string | null }) {
  const configured = contractConfigured();
  const [state, setState] = useState<BudgetState | null>(null);
  const [loading, setLoading] = useState(configured);
  const [amount, setAmount] = useState('');
  const [description, setDescription] = useState('');
  const [recipient, setRecipient] = useState('');
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState('');
  const [error, setError] = useState('');
  const [isAdmin, setIsAdmin] = useState(false);
  const [adminPass, setAdminPass] = useState('');

  const refresh = useCallback(async () => {
    if (!configured) return;
    setLoading(true);
    setError('');
    try {
      setState(await readBudgetState());
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : 'Failed to read contract');
    } finally {
      setLoading(false);
    }
  }, [configured]);

  useEffect(() => {
    refresh();
  }, [refresh]);

  const disburse = async () => {
    if (!publicKey) return;
    setBusy(true);
    setMsg('');
    setError('');
    try {
      const xdr = await buildDisburseXDR(publicKey, Number(amount), description, recipient);
      const freighter = await import('@stellar/freighter-api');
      const signed = await freighter.signTransaction(xdr, {
        networkPassphrase: NETWORK_PASSPHRASE,
        address: publicKey,
      });
      if (signed.error) {
        throw new Error(
          typeof signed.error === 'string' ? signed.error : 'Signing was rejected',
        );
      }
      const hash = await submitSignedXDR(signed.signedTxXdr);
      await pollTransaction(hash);
      setMsg('Disbursement recorded & XLM transferred successfully!');
      setAmount('');
      setDescription('');
      setRecipient('');
      await refresh();
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : 'Disbursement failed. Check your XLM balance.');
    } finally {
      setBusy(false);
    }
  };

  if (!configured) {
    return (
      <div className="mt-6 rounded border border-dashed border-gray-300 bg-gray-50 p-6">
        <h2 className="text-lg font-semibold text-gray-900">Municipal Budget Tracker</h2>
        <p className="mt-2 text-sm text-gray-600">
          No budget contract deployed. Deploy the transparency contract to enable the civic audit log:
        </p>
        <pre className="mt-2 overflow-x-auto rounded bg-gray-900 p-3 text-xs text-gray-100">
          .\scripts\deploy.ps1
        </pre>
      </div>
    );
  }

  const stateYear = state?.current_year || new Date().getFullYear();
  const pct =
    state && state.total_budget > 0
      ? Math.min(100, Math.round((state.spent / state.total_budget) * 100))
      : 0;

  return (
    <div className="mt-6 rounded border border-gray-200 bg-white p-6 shadow-sm">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-gray-900">Civic Transparency Dashboard</h2>
          <p className="text-sm text-gray-500">FY {stateYear} real-time audit log</p>
        </div>
        <div className="text-right">
          <span className="inline-flex items-center rounded-full bg-blue-100 px-2.5 py-0.5 text-xs font-medium text-blue-800">
            Stellar Public Ledger
          </span>
        </div>
      </div>

      {loading && <p className="text-sm text-gray-400 animate-pulse text-center py-4">Synchronizing with blockchain audit log...</p>}

      {!loading && state && (
        <div className="space-y-8">
          {/* Progress Section */}
          <div className="bg-gray-50 rounded-lg p-4">
            <div className="mb-2 flex justify-between text-sm font-semibold text-gray-700">
              <span>Spent (FY{stateYear}): {state.spent.toLocaleString()} XLM</span>
              <span>Yearly Budget: {state.total_budget.toLocaleString()} XLM</span>
            </div>
            <div className="h-4 w-full overflow-hidden rounded-full bg-gray-200">
              <div
                className="h-full rounded-full bg-blue-600 transition-all duration-1000"
                style={{ width: `${pct}%` }}
              />
            </div>
            <p className="mt-2 text-right text-xs font-bold text-blue-600">{pct}% utilized</p>
          </div>

          {/* Recording Form */}
          <div className="border-t pt-6 text-gray-900">
            <h3 className="text-sm font-bold text-gray-900 mb-4 uppercase tracking-wider">Authorize REAL XLM Disbursement</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <input
                type="number"
                min="0"
                placeholder="Amount (XLM)"
                value={amount}
                onChange={(e) => setAmount(Math.max(0, Number(e.target.value)).toString())}
                className="rounded border border-gray-300 px-3 py-2 text-sm text-gray-900 focus:ring-2 focus:ring-blue-500 focus:outline-none"
              />
              <input
                type="text"
                placeholder="Recipient Address (G...)"
                value={recipient}
                onChange={(e) => setRecipient(e.target.value)}
                className="rounded border border-gray-300 px-3 py-2 text-sm text-gray-900 focus:ring-2 focus:ring-blue-500 focus:outline-none"
              />
              <input
                type="text"
                placeholder="Purpose / Description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="md:col-span-2 rounded border border-gray-300 px-3 py-2 text-sm text-gray-900 focus:ring-2 focus:ring-blue-500 focus:outline-none"
              />
            </div>
            <button
              onClick={disburse}
              disabled={busy || !publicKey || !amount || !description || !recipient || Number(amount) <= 0}
              className="mt-4 w-full rounded bg-blue-600 px-4 py-2 font-bold text-white transition-colors hover:bg-blue-700 disabled:opacity-50 shadow-md"
            >
              {busy ? 'Verifying Ledger & Transferring...' : 'Confirm Real-Money Transfer'}
            </button>
            {!publicKey && (
              <p className="mt-2 text-center text-xs text-red-500 font-bold">
                Identity Verification Required: Please connect wallet to authorize this disbursement.
              </p>
            )}
            <p className="mt-2 text-[10px] text-gray-400 italic text-center">
              Notice: This action will move actual XLM from your wallet to the recipient. 
              The transaction will fail if your balance is less than the requested amount.
            </p>
          </div>
        </div>
      )}

      {msg && (
        <div className="mt-4 rounded bg-emerald-50 p-3 text-sm text-emerald-800 border border-emerald-200">
          ✅ {msg}
        </div>
      )}
      {error && (
        <div className="mt-4 rounded bg-red-50 p-3 text-sm text-red-800 border border-red-200">
          ❌ {error}
        </div>
      )}
    </div>
  );
}
