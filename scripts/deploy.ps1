# Deploy the budget contract to Stellar testnet, then write the contract
# ID into web\.env.local so the frontend can call it.
param([string]$Identity = "workshop")

$ErrorActionPreference = "Stop"
$Network = "testnet"
$Root = (Resolve-Path (Join-Path $PSScriptRoot "..")).Path
$Wasm = "target\wasm32v1-none\release\savings_goal.wasm"
$EnvFile = Join-Path $Root "web\.env.local"

Set-Location $Root

# 1. Ensure a funded testnet identity exists
$keys = stellar keys ls
if ($keys -notcontains $Identity) {
  Write-Host "Creating + funding testnet identity '$Identity'..."
  stellar keys generate $Identity --network $Network --fund
}

# 2. Build the contract to wasm
Write-Host "Building contract..."
stellar contract build

# 3. Deploy to testnet (returns the contract ID, starting with C...)
Write-Host "Deploying to $Network..."
$ContractId = (stellar contract deploy --wasm $Wasm --source-account $Identity --network $Network).Trim()
Write-Host "Deployed contract ID: $ContractId"

# 4. Initialise the municipal budget (total_budget = 1,000,000).
# The native XLM token contract ID on Testnet is CDLZBA4O654Y7NIX3H6W3V7U74T76KEMXJ6H5KUXM7F27Y55I63B72BA
Write-Host "Initialising municipal budget (total_budget 1000000)..."
try {
  $NativeToken = "CDLZBA4O654Y7NIX3H6W3V7U74T76KEMXJ6H5KUXM7F27Y55I63B72BA"
  # Use positional arguments if named ones are being misinterpreted by the shell/CLI
  stellar contract invoke --id $ContractId --source-account $Identity --network $Network -- init --total_budget 1000000 --native_token "$NativeToken"
} catch {
  Write-Host "(init skipped or failed - contract may already be initialised)"
}

# 5. Write NEXT_PUBLIC_CONTRACT_ID into web\.env.local
if (Test-Path $EnvFile) {
  (Get-Content $EnvFile) | Where-Object { $_ -notmatch '^NEXT_PUBLIC_CONTRACT_ID=' } | Set-Content $EnvFile
}
Add-Content $EnvFile "NEXT_PUBLIC_CONTRACT_ID=$ContractId"
Write-Host ""
Write-Host "Wrote NEXT_PUBLIC_CONTRACT_ID=$ContractId to web\.env.local"
Write-Host "Restart 'npm run dev' to pick up the new contract ID."
