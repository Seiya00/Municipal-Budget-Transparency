import {
  Contract,
  TransactionBuilder,
  BASE_FEE,
  Account,
  rpc,
  nativeToScVal,
  scValToNative,
} from '@stellar/stellar-sdk';
import { server, NETWORK_PASSPHRASE, CONTRACT_ID } from './stellar';

// A real, funded testnet account used ONLY as the source for read-only
// simulations. Nothing is signed or submitted for reads.
const READ_SOURCE = 'GBBD47IF6LWK7P7MDEVSCWR7DPUWV3NY3DTQEVFL4NAT4AQH3ZLLFLA5';

export interface Disbursement {
  amount: number;
  description: string;
  recipient: string;
  timestamp: number;
}

export interface BudgetState {
  spent: number;
  total_budget: number;
  history: Disbursement[];
  current_year: number;
}

export function contractConfigured(): boolean {
  return Boolean(CONTRACT_ID);
}

/** Read get_state() via simulation — no wallet or signature required. */
export async function readBudgetState(): Promise<BudgetState> {
  const contract = new Contract(CONTRACT_ID);
  const source = new Account(READ_SOURCE, '0');

  const tx = new TransactionBuilder(source, {
    fee: BASE_FEE,
    networkPassphrase: NETWORK_PASSPHRASE,
  })
    .addOperation(contract.call('get_state'))
    .setTimeout(30)
    .build();

  const sim = await server.simulateTransaction(tx);
  if (!rpc.Api.isSimulationSuccess(sim) || !sim.result) {
    throw new Error('Could not read contract state. Is it deployed and initialised?');
  }

  const rawState = scValToNative(sim.result.retval) as {
    spent: bigint;
    total_budget: bigint;
    history: any[];
    current_year: number;
  };

  const history: Disbursement[] = rawState.history.map((item: any) => ({
    amount: Number(item.amount),
    description: item.description.toString(),
    recipient: item.recipient.toString(),
    timestamp: Number(item.timestamp),
  }));

  return {
    spent: Number(rawState.spent),
    total_budget: Number(rawState.total_budget),
    history,
    current_year: rawState.current_year,
  };
}

/**
 * Build + simulate + assemble an unsigned `disburse(official, amount, description, recipient)` invocation,
 * returning the prepared XDR ready for Freighter to sign.
 */
export async function buildDisburseXDR(
  official: string,
  amount: number,
  description: string,
  recipient: string,
): Promise<string> {
  const contract = new Contract(CONTRACT_ID);
  const account = await server.getAccount(official);

  const tx = new TransactionBuilder(account, {
    fee: BASE_FEE,
    networkPassphrase: NETWORK_PASSPHRASE,
  })
    .addOperation(
      contract.call(
        'disburse',
        nativeToScVal(official, { type: 'address' }),
        nativeToScVal(BigInt(Math.trunc(amount)), { type: 'i128' }),
        nativeToScVal(description, { type: 'string' }),
        nativeToScVal(recipient, { type: 'address' }),
      ),
    )
    .setTimeout(30)
    .build();

  const sim = await server.simulateTransaction(tx);
  if (!rpc.Api.isSimulationSuccess(sim)) {
    throw new Error('Simulation failed — the disburse call would not succeed.');
  }

  return rpc.assembleTransaction(tx, sim).build().toXDR();
}
