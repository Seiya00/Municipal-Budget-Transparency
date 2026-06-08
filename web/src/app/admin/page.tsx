'use client';
import { useState, useCallback } from 'react';
import { useWallet } from '@/hooks/useWallet';
import ConnectWallet from '@/components/ConnectWallet';
import BudgetTracker from '@/components/BudgetTracker';
import { useRouter } from 'next/navigation';

export default function AdminPage() {
  const router = useRouter();
  const wallet = useWallet();
  const { publicKey } = wallet;

  return (
    <main className="min-h-screen w-full bg-gray-900 text-gray-100">
      <div className="mx-auto max-w-4xl px-4 py-12">
        <header className="mb-8 flex items-start justify-between gap-4 border-b border-gray-800 pb-6">
          <div>
            <h1 className="text-2xl font-bold text-white">Official Dashboard</h1>
            <p className="text-sm text-gray-400">
              Municipal Disbursement Authority
            </p>
          </div>
          <ConnectWallet {...wallet} />
        </header>

        <div className="space-y-6">
          <div className="rounded-lg bg-gray-800 p-4 border border-gray-700 shadow-xl">
            <h2 className="text-xs font-bold text-blue-400 uppercase tracking-widest mb-4">Internal Controls</h2>
            <BudgetTracker publicKey={publicKey} />
          </div>

          <div className="text-center pt-8">
            <button 
              onClick={() => router.push('/')}
              className="text-xs text-red-400 hover:text-red-300 font-bold uppercase tracking-widest transition-colors flex items-center justify-center mx-auto gap-2"
            >
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-4 h-4">
                <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 9V5.25A2.25 2.25 0 0 0 13.5 3h-6a2.25 2.25 0 0 0-2.25 2.25v13.5A2.25 2.25 0 0 0 7.5 21h6a2.25 2.25 0 0 0 2.25-2.25V15m3 0 3-3m0 0-3-3m3 3H9" />
              </svg>
              Logout
            </button>
          </div>
        </div>

        <footer className="mt-12 text-center text-[10px] text-gray-600 uppercase tracking-widest">
          Secure Administrative Session · Stellar Soroban
        </footer>
      </div>
    </main>
  );
}
