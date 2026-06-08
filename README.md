# MuniciPay Audit

A real-time, blockchain-powered transparency portal for municipal disbursements.

## Problem
Municipal budgets in the Philippines are often paper-based and opaque, leading to public mistrust or inefficient fund tracking. Citizens rarely have a way to see how their taxes are being spent in real-time. This project solves the "black box" of government spending by providing a live, immutable audit trail of every centavo disbursed.

## How It Works
1. **Citizens** visit the Public Transparency Portal to view the **Live Audit Log**, showing exactly when, why, and to whom funds were sent.
2. **Authorized Officials** log in to the Official Dashboard using a secure administrative gate.
3. Officials record disbursements by entering an amount, recipient, and purpose.
4. The system performs a **Real XLM Transfer** from the official's wallet to the recipient, ensuring the audit log is a 1:1 reflection of actual financial movement.
5. The budget automatically resets every **January 1st**, maintaining a clear fiscal year record while preserving history.

## How It Uses Stellar
- **Soroban Smart Contracts**: Manages the municipal budget state, fiscal year reset logic, and the on-chain audit log.
- **Stellar Asset Contract (SAC)**: Facilitates real-money XLM transfers directly within the contract execution.
- **Public Ledger**: Provides an immutable, tamper-proof record that anyone can verify using a block explorer.
- **Freighter Wallet**: Ensures that only authorized officials with the correct private keys can sign and broadcast disbursements.

## Track
Track 5 Social Impact

## Tech Stack
- Framework: Next.js 16 (TypeScript + Tailwind CSS)
- Stellar SDK: @stellar/stellar-sdk ^15.1.0
- Network: testnet
- Contract Language: Rust (Soroban SDK)

## Setup & Run

```bash
# 1. Clone the repository
git clone [your-repo-link]
cd [project-folder]

# 2. Install dependencies
cd web
npm install
cd ..

# 3. Deploy the Smart Contract (Requires Rust & Stellar CLI)
# This script builds, deploys, and initializes the budget tracker.
.\scripts\deploy.ps1

# 4. Run the development server
.\dev.ps1
```

## Network Details
- Network: testnet
- RPC URL: https://soroban-testnet.stellar.org
- Contract ID: CCCYDD74H5DP75AYANSROJS2RYEAM7GJYIT277G2T4MSAYKRH5FG4SKJ
- Native Asset: XLM (via SAC)

## Team
- Mark Anthony Tugay — @Seiya00

## License
MIT
