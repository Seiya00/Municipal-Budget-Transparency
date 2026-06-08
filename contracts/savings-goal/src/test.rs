#![cfg(test)]
use super::*;
use soroban_sdk::{testutils::{Address as _, Ledger}, Address, Env, String};

fn setup(env: &Env) -> BudgetTrackerContractClient {
    let contract_id = env.register(BudgetTrackerContract, ());
    BudgetTrackerContractClient::new(env, &contract_id)
}

#[test]
fn init_then_disburse_tracks_total_and_history() {
    let env = Env::default();
    env.mock_all_auths(); 
    
    let client = setup(&env);
    let official = Address::generate(&env);
    let recipient = Address::generate(&env);
    
    // We must register a mock token contract because disburse calls it
    let token_id = env.register_stellar_asset_contract(Address::generate(&env));

    client.init(&1000000, &token_id);
    let state = client.get_state();
    assert_eq!(state.total_budget, 1000000);
    assert_eq!(state.spent, 0);

    let desc = String::from_str(&env, "Infrastructure Repair");
    client.disburse(&official, &250000, &desc, &recipient);

    let state = client.get_state();
    assert_eq!(state.spent, 250000);
    assert_eq!(state.history.len(), 1);
}

#[test]
fn yearly_reset_logic() {
    let env = Env::default();
    env.mock_all_auths();
    let client = setup(&env);
    let official = Address::generate(&env);
    let token_id = env.register_stellar_asset_contract(Address::generate(&env));

    // Initial year: 1970 (ts=0)
    client.init(&1000, &token_id);
    client.disburse(&official, &500, &String::from_str(&env, "test"), &Address::generate(&env));
    
    let state = client.get_state();
    assert_eq!(state.spent, 500);

    // Jump 2 years forward (approx 65,000,000 seconds)
    env.ledger().set_timestamp(65000000); 
    
    let state = client.get_state();
    assert_eq!(state.spent, 0); // Should have reset!
    assert_eq!(state.current_year, 1972);
}
