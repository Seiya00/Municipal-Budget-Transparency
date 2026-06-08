'use client';
import { useState, useEffect, useCallback } from 'react';
import {
  contractConfigured,
  readBudgetState,
  type BudgetState,
} from '@/lib/contract';

export default function AuditLog() {
  const configured = contractConfigured();
  const [state, setState] = useState<BudgetState | null>(null);
  const [loading, setLoading] = useState(configured);
  const [error, setError] = useState('');

  const refresh = useCallback(async () => {
    if (!configured) return;
    setLoading(true);
    setError('');
    try {
      setState(await readBudgetState());
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : 'Failed to read audit log');
    } finally {
      setLoading(false);
    }
  }, [configured]);

  useEffect(() => {
    refresh();
  }, [refresh]);

  if (!configured) {
    return (
      <div className="mt-6 rounded border border-dashed border-gray-300 bg-gray-50 p-6 text-center">
        <p className="text-sm text-gray-500 italic">Civic transparency system not yet initialized.</p>
      </div>
    );
  }

  return (
    <div className="mt-6 rounded border border-gray-200 bg-white p-6 shadow-sm">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h3 className="text-lg font-bold text-gray-900 uppercase tracking-wider">Live Audit Log</h3>
          {state && <p className="text-xs text-gray-500 font-bold tracking-tight">Fiscal Year {state.current_year}</p>}
        </div>
        <span className="inline-flex items-center rounded-full bg-emerald-100 px-2.5 py-0.5 text-xs font-medium text-emerald-800">
          Stellar Blockchain Verified
        </span>
      </div>

      {loading && <p className="text-sm text-gray-400 animate-pulse text-center py-4">Fetching audit trail from ledger...</p>}

      {!loading && state && (
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="border-b bg-gray-50 text-gray-500 font-medium">
                <th className="py-2 px-3">Date</th>
                <th className="py-2 px-3">Purpose</th>
                <th className="py-2 px-3">Recipient Address</th>
                <th className="py-2 px-3 text-right">Amount</th>
                </tr>
                </thead>
                <tbody className="divide-y">
                {state.history.length === 0 && (
                <tr>
                  <td colSpan={4} className="py-4 text-center text-gray-400 italic">No disbursements recorded yet.</td>
                </tr>
                )}
                {state.history.map((tx, i) => (
                <tr key={i} className="hover:bg-blue-50 transition-colors">
                  <td className="py-3 px-3 text-gray-500 whitespace-nowrap">
                    {new Date(tx.timestamp * 1000).toLocaleDateString()}
                  </td>
                  <td className="py-3 px-3">
                    <p className="font-semibold text-gray-900">{tx.description}</p>
                  </td>
                  <td className="py-3 px-3">
                    <p className="text-xs text-gray-400 font-mono truncate max-w-[150px] md:max-w-xs" title={tx.recipient}>
                      {tx.recipient}
                    </p>
                  </td>
                  <td className="py-3 px-3 text-right font-mono font-bold text-blue-700 whitespace-nowrap">
                    {tx.amount.toLocaleString()} XLM
                  </td>
                </tr>
                ))}
            </tbody>
          </table>
          <p className="mt-4 text-center text-[10px] text-gray-400 uppercase tracking-tighter">
            Every transaction above is immutable and publicly verifiable on the Stellar network.
          </p>
        </div>
      )}

      {error && <p className="mt-3 text-sm text-red-500 text-center">{error}</p>}
    </div>
  );
}
