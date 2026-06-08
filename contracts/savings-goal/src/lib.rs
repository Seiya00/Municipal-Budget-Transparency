#![no_std]
use soroban_sdk::{contract, contracterror, contractimpl, contracttype, token, Address, Env, String, Vec};

/// Record of a single municipal disbursement.
#[contracttype]
#[derive(Clone, Debug)]
pub struct Disbursement {
    pub amount: i128,
    pub description: String,
    pub recipient: Address,
    pub timestamp: u64,
}

/// Snapshot of the budget status and recent history.
#[contracttype]
#[derive(Clone, Debug)]
pub struct State {
    pub spent: i128,
    pub total_budget: i128,
    pub history: Vec<Disbursement>,
    pub current_year: u32,
}

/// Keys for the contract's instance storage.
#[contracttype]
pub enum DataKey {
    Spent,
    TotalBudget,
    History,
    LastResetYear,
    NativeToken,
}

#[contracterror]
#[derive(Copy, Clone, Debug, Eq, PartialEq, PartialOrd, Ord)]
#[repr(u32)]
pub enum Error {
    AlreadyInitialized = 1,
    NotInitialized = 2,
    InvalidAmount = 3,
}

#[contract]
pub struct BudgetTrackerContract;

#[contractimpl]
impl BudgetTrackerContract {
    /// Initialize the municipal budget and link the native asset (XLM).
    pub fn init(env: Env, total_budget: i128, native_token: Address) -> Result<(), Error> {
        if env.storage().instance().has(&DataKey::TotalBudget) {
            return Err(Error::AlreadyInitialized);
        }
        if total_budget <= 0 {
            return Err(Error::InvalidAmount);
        }
        
        let current_year = Self::get_year_from_ts(env.ledger().timestamp());
        
        env.storage().instance().set(&DataKey::TotalBudget, &total_budget);
        env.storage().instance().set(&DataKey::Spent, &0i128);
        env.storage().instance().set(&DataKey::History, &Vec::<Disbursement>::new(&env));
        env.storage().instance().set(&DataKey::LastResetYear, &current_year);
        env.storage().instance().set(&DataKey::NativeToken, &native_token);
        
        env.storage().instance().extend_ttl(1000, 5000);
        Ok(())
    }

    /// Record a disbursement and perform a REAL XLM transfer.
    pub fn disburse(
        env: Env,
        official: Address,
        amount: i128,
        description: String,
        recipient: Address,
    ) -> Result<i128, Error> {
        if !env.storage().instance().has(&DataKey::TotalBudget) {
            return Err(Error::NotInitialized);
        }
        if amount <= 0 {
            return Err(Error::InvalidAmount);
        }

        // 1. Verify official's identity/authorization
        official.require_auth();

        // 2. Check for Yearly Reset (Jan 1)
        Self::check_and_perform_reset(&env);

        // 3. Perform REAL XLM Transfer
        // This will FAIL if the official doesn't have enough XLM in Freighter.
        let token_addr: Address = env.storage().instance().get(&DataKey::NativeToken).unwrap();
        let client = token::Client::new(&env, &token_addr);
        client.transfer(&official, &recipient, &amount);

        // 4. Update On-Chain Audit Log
        let spent: i128 = env.storage().instance().get(&DataKey::Spent).unwrap_or(0);
        let new_spent = spent + amount;
        env.storage().instance().set(&DataKey::Spent, &new_spent);

        let mut history: Vec<Disbursement> = env
            .storage()
            .instance()
            .get(&DataKey::History)
            .unwrap_or(Vec::new(&env));
        
        history.push_front(Disbursement {
            amount,
            description,
            recipient,
            timestamp: env.ledger().timestamp(),
        });

        if history.len() > 10 {
            history.pop_back();
        }

        env.storage().instance().set(&DataKey::History, &history);
        env.storage().instance().extend_ttl(1000, 5000);

        Ok(new_spent)
    }

    /// Read the current budget state.
    pub fn get_state(env: Env) -> State {
        // We check reset on read too, so the dashboard shows the reset immediately on Jan 1
        Self::check_and_perform_reset(&env);
        
        State {
            spent: env.storage().instance().get(&DataKey::Spent).unwrap_or(0),
            total_budget: env.storage().instance().get(&DataKey::TotalBudget).unwrap_or(0),
            history: env.storage().instance().get(&DataKey::History).unwrap_or(Vec::new(&env)),
            current_year: Self::get_year_from_ts(env.ledger().timestamp()),
        }
    }

    /// Helper: Resets budget if the year has changed.
    fn check_and_perform_reset(env: &Env) {
        let last_year: u32 = env.storage().instance().get(&DataKey::LastResetYear).unwrap_or(0);
        let current_year = Self::get_year_from_ts(env.ledger().timestamp());

        if current_year > last_year {
            env.storage().instance().set(&DataKey::Spent, &0i128);
            env.storage().instance().set(&DataKey::LastResetYear, &current_year);
            // We keep the history but reset the "Spent" counter for the new year.
        }
    }

    /// Helper: Approximation of year from unix timestamp (seconds).
    fn get_year_from_ts(ts: u64) -> u32 {
        // ts / (seconds in a year) + 1970
        // 31,536,000 seconds per 365 days. 
        // This is a workshop approximation, good enough for Jan 1 reset logic.
        ((ts / 31536000) + 1970) as u32
    }
}

mod test;
