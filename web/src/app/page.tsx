'use client';
import { useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { useWallet } from '@/hooks/useWallet';
import ConnectWallet from '@/components/ConnectWallet';
import FundAccount from '@/components/FundAccount';
import AddTrustline from '@/components/AddTrustline';
import BalanceCard from '@/components/BalanceCard';
import SendPayment from '@/components/SendPayment';
import AuditLog from '@/components/AuditLog';

export default function Home() {
  const router = useRouter();
  const wallet = useWallet();
  const { publicKey, connecting } = wallet;
  const [showLogin, setShowLogin] = useState(false);
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');

  const handleLogin = () => {
    if (password === 'municipal2026') {
      router.push('/admin');
    } else {
      setError('Invalid official credentials.');
    }
  };

  return (
    <main className="min-h-screen w-full bg-gray-50 text-gray-900 font-[family-name:var(--font-geist-sans)]">
      <div className="mx-auto max-w-4xl px-4 py-12">
        <header className="mb-10 flex items-start justify-between gap-4 border-b pb-6">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 tracking-tight">Public Transparency Portal</h1>
            <p className="text-sm text-gray-500 font-medium">
              Real-time Municipal Audit Trail
            </p>
          </div>
          <div className="text-right">
             <button 
               onClick={() => setShowLogin(!showLogin)}
               className="rounded-full bg-blue-600 px-6 py-2 text-sm font-bold text-white hover:bg-blue-700 transition-all shadow-md active:scale-95"
             >
               Official Login
             </button>
          </div>
        </header>

        {showLogin && (
          <div className="mb-8 rounded-xl border-2 border-blue-600 bg-white p-8 shadow-2xl animate-in fade-in slide-in-from-top-4 duration-300">
            <h2 className="mb-4 text-center text-lg font-bold text-gray-900 uppercase tracking-widest">Official Authorization</h2>
            <div className="mx-auto max-w-xs space-y-4">
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  placeholder="Enter Administrative Password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleLogin()}
                  className="w-full rounded border-2 border-gray-200 px-4 py-3 text-sm focus:border-blue-600 focus:outline-none transition-colors pr-10"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-3.5 text-gray-400 hover:text-gray-600"
                >
                  {showPassword ? (
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M3.98 8.223A10.477 10.477 0 0 0 1.934 12C3.226 16.338 7.244 19.5 12 19.5c.993 0 1.953-.138 2.863-.395M6.228 6.228A10.451 10.451 0 0 1 12 4.5c4.756 0 8.773 3.162 10.065 7.498a10.522 10.522 0 0 1-4.293 5.774M6.228 6.228 3 3m3.228 3.228 3.65 3.65m7.894 7.894L21 21m-3.228-3.228-3.65-3.65m0 0a3 3 0 1 0-4.243-4.243m4.242 4.242L9.88 9.88" />
                    </svg>
                  ) : (
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M2.036 12.322a1.012 1.012 0 0 1 0-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178Z" />
                      <path strokeLinecap="round" strokeLinejoin="round" d="M15 12.a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z" />
                    </svg>
                  )}
                </button>
              </div>
              <button
                onClick={handleLogin}
                className="w-full rounded bg-blue-600 py-3 font-bold text-white shadow-lg hover:bg-blue-700 transition-colors"
              >
                Authorize & Access Dashboard
              </button>
              {error && <p className="text-center text-xs font-bold text-red-500 animate-bounce">{error}</p>}
            </div>
          </div>
        )}

        <div className="rounded-xl border border-blue-100 bg-blue-50/50 p-6 mb-8 shadow-sm">
          <h2 className="text-sm font-bold text-blue-900 uppercase tracking-wide mb-2">Citizen Accountability</h2>
          <p className="text-sm text-blue-800 leading-relaxed">
            Welcome to the municipal transparency dashboard. Below is a live feed of all government disbursements recorded on the <strong>Stellar Public Ledger</strong>.
          </p>
        </div>

        {/* Public view: Only the immutable audit log */}
        <AuditLog />

        <footer className="mt-16 text-center">
          <p className="text-[10px] text-gray-400 uppercase tracking-[0.2em] font-bold mb-2">Powered by Stellar Blockchain</p>
          <p className="text-xs text-gray-500 max-w-xs mx-auto leading-relaxed">
            A public, tamper-proof record of how your tax money is spent. 
            Verifiable by anyone, anywhere, at any time.
          </p>
        </footer>
      </div>
    </main>
  );
}
