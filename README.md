# Municipal Budget Transparency Tracker (Stellar/Soroban)

A blockchain-powered civic accountability tool designed for the **StellarX PH workshop**. This project transforms municipal budgeting from static paper reports into a real-time, tamper-proof, and publicly verifiable audit trail on the Stellar network.

## System Overview

The system consists of two distinct layers:
1.  **Public Transparency Portal (`/`)**: A wide-screen dashboard for citizens to view the live audit log of every government disbursement.
2.  **Official Dashboard (`/admin`)**: A secure administrative area for authorized officials to manage the budget and authorize real-money XLM transfers.

### Key Features
- **Real-Money Transfers**: Unlike simple trackers, this system performs actual XLM transfers using the Stellar Asset Contract (SAC).
- **Autonomous Yearly Reset**: The contract automatically resets the yearly "Spent" counter on January 1st based on ledger time, while preserving the full audit history.
- **Immutable Audit Log**: Every disbursement records the amount, recipient address, purpose (description), and a blockchain timestamp.
- **Administrative Security**: Official actions are gated by a password and require a real signature from the official's Freighter wallet.

```
.
├── web/                      # Next.js 16 + TypeScript + Tailwind frontend
├── contracts/savings-goal/   # Rust Soroban contract (Municipal Budget Logic)
├── scripts/                  # deploy.ps1 (Real-money initialization)
├── Cargo.toml                # Rust workspace
└── CLAUDE.md                 # stack notes + Stellar gotchas (read this!)
```

## Prerequisites

- **Node.js 20+** and **npm** — for the frontend.
- **Freighter** browser extension — switch it to **Test Net**.
- **Rust** and the **Stellar CLI** — for contract deployment.
- **wasm32v1-none** target installed via `rustup`.

## 1. Run the Frontend

```powershell
cd web
npm install
npm run dev
```

Open <http://localhost:3002> to view the **Public Transparency Portal**.

## 2. Deploy & Initialize the Contract

```powershell
# From the repo root
.\scripts\deploy.ps1
```

The deployment script will:
1. Build the Rust contract.
2. Deploy it to the Stellar Testnet.
3. Initialize it with a **1,000,000 XLM** budget.
4. Link it to the **Native XLM Token Contract**.
5. Automatically update `web/.env.local` with the new `NEXT_PUBLIC_CONTRACT_ID`.

## 3. Operating the System

### For Citizens
- Simply visit the home page to see the **Live Audit Log**.
- Every entry is verifiable on the Stellar ledger via the provided recipient addresses and timestamps.

### For Officials
1. Click **Official Login** in the header.
2. Enter the administrative password: `municipal2026`.
3. In the **Official Dashboard**:
    - Connect your **Freighter** wallet.
    - Ensure your wallet has enough XLM (use the **Fund Account** button if needed).
    - Fill out the **Authorize Disbursement** form.
    - Sign the transaction. The XLM will be transferred immediately, and the audit log will update.

## Contract Architecture (`contracts/savings-goal/src/lib.rs`)

| Function | Purpose |
|---|---|
| `init(total_budget, native_token)` | Sets the yearly budget and links the XLM asset. |
| `disburse(official, amount, desc, recipient)` | Performs a real XLM transfer and records the metadata. |
| `get_state() -> State` | Returns `spent`, `total_budget`, `history`, and `current_year`. |

## Troubleshooting

- **Disbursement Fails**: Ensure the connected Freighter wallet has more XLM than the disbursement amount + fees.
- **Login Issues**: The default administrative password is `municipal2026`.
- **Contract Not Syncing**: If the dashboard shows "No contract deployed", ensure you have run the `deploy.ps1` script and restarted the dev server.

---
Built for the StellarX PH workshop @ PUP QC. Focused on using public ledgers as a tool for financial inclusion and civic accountability.
