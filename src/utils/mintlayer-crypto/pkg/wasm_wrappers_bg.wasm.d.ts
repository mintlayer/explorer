/* tslint:disable */
/* eslint-disable */
export const memory: WebAssembly.Memory;
export function encode_outpoint_source_id(a: number, b: number, c: number, d: number): void;
export function make_private_key(a: number): void;
export function make_default_account_privkey(a: number, b: number, c: number, d: number): void;
export function make_receiving_address(a: number, b: number, c: number, d: number): void;
export function make_change_address(a: number, b: number, c: number, d: number): void;
export function pubkey_to_pubkeyhash_address(a: number, b: number, c: number, d: number): void;
export function public_key_from_private_key(a: number, b: number, c: number): void;
export function sign_message_for_spending(a: number, b: number, c: number, d: number, e: number): void;
export function verify_signature_for_spending(a: number, b: number, c: number, d: number, e: number, f: number, g: number): void;
export function encode_output_transfer(a: number, b: number, c: number, d: number, e: number, f: number): void;
export function staking_pool_spend_maturity_block_count(a: number, b: number): number;
export function encode_lock_for_block_count(a: number, b: number): void;
export function encode_lock_for_seconds(a: number, b: number): void;
export function encode_lock_until_time(a: number, b: number): void;
export function encode_lock_until_height(a: number, b: number): void;
export function encode_output_lock_then_transfer(a: number, b: number, c: number, d: number, e: number, f: number, g: number, h: number): void;
export function encode_output_coin_burn(a: number, b: number, c: number): void;
export function encode_output_create_delegation(a: number, b: number, c: number, d: number, e: number, f: number): void;
export function encode_output_delegate_staking(a: number, b: number, c: number, d: number, e: number, f: number): void;
export function encode_stake_pool_data(
  a: number,
  b: number,
  c: number,
  d: number,
  e: number,
  f: number,
  g: number,
  h: number,
  i: number,
  j: number,
  k: number,
  l: number,
  m: number,
): void;
export function encode_output_create_stake_pool(a: number, b: number, c: number, d: number, e: number, f: number): void;
export function encode_output_issue_fungible_token(
  a: number,
  b: number,
  c: number,
  d: number,
  e: number,
  f: number,
  g: number,
  h: number,
  i: number,
  j: number,
  k: number,
  l: number,
  m: number,
): void;
export function encode_output_data_deposit(a: number, b: number, c: number): void;
export function encode_input_for_utxo(a: number, b: number, c: number, d: number): void;
export function encode_input_for_withdraw_from_delegation(a: number, b: number, c: number, d: number, e: number, f: number, g: number): void;
export function estimate_transaction_size(a: number, b: number, c: number, d: number, e: number, f: number, g: number): void;
export function encode_transaction(a: number, b: number, c: number, d: number, e: number, f: number): void;
export function encode_witness_no_signature(a: number): void;
export function encode_witness(
  a: number,
  b: number,
  c: number,
  d: number,
  e: number,
  f: number,
  g: number,
  h: number,
  i: number,
  j: number,
  k: number,
  l: number,
): void;
export function encode_signed_transaction(a: number, b: number, c: number, d: number, e: number): void;
export function effective_pool_balance(a: number, b: number, c: number, d: number, e: number, f: number): void;
export function rustsecp256k1_v0_9_2_context_create(a: number): number;
export function rustsecp256k1_v0_9_2_context_destroy(a: number): void;
export function rustsecp256k1_v0_9_2_default_illegal_callback_fn(a: number, b: number): void;
export function rustsecp256k1_v0_9_2_default_error_callback_fn(a: number, b: number): void;
export function __wbindgen_add_to_stack_pointer(a: number): number;
export function __wbindgen_malloc(a: number, b: number): number;
export function __wbindgen_free(a: number, b: number, c: number): void;
export function __wbindgen_realloc(a: number, b: number, c: number, d: number): number;
export function __wbindgen_exn_store(a: number): void;
