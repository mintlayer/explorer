// Core utility functions for transaction parsing

/**
 * Convert atoms string to decimal representation for coins
 * Coins use 11 decimal places (10^11 atoms = 1 unit)
 */
function atomsToDecimalCoin(atoms: string): string {
  const atomsBigInt = BigInt(atoms);
  const divisor = BigInt('100000000000'); // 10^11
  const wholePart = atomsBigInt / divisor;
  const fractionalPart = atomsBigInt % divisor;

  // if (fractionalPart === 0n) {
  //   return wholePart.toString();
  // }

  // Convert fractional part to string with leading zeros
  const fractionalStr = fractionalPart.toString().padStart(11, '0');
  // Remove trailing zeros
  const trimmedFractional = fractionalStr.replace(/0+$/, '');

  return `${wholePart}.${trimmedFractional}`;
}

/**
 * Convert atoms string to decimal representation for tokens
 * Tokens use 8 decimal places (10^8 atoms = 1 unit)
 */
function atomsToDecimalToken(atoms: string): null {
  // we dont' know amount of decimals without additional requests
  return null;
}

/**
 * Create amount object with atoms and decimal representation
 */
function createAmountObject(atoms: string, isToken: boolean = false) {
  return {
    atoms,
    decimal: isToken ? atomsToDecimalToken(atoms) : atomsToDecimalCoin(atoms)
  };
}

/**
 * Extract value information from different value types
 */
function parseValue(value: any): any {
  if (value.Coin) {
    return {
      type: 'Coin',
      amount: createAmountObject(value.Coin.atoms, false)
    };
  }

  if (value.TokenV1) {
    const [tokenId, tokenAmount] = value.TokenV1;
    return {
      type: 'TokenV1',
      token_id: tokenId,
      amount: createAmountObject(tokenAmount.atoms, true)
    };
  }

  return value;
}

/**
 * Convert hex array to string
 */
function hexArrayToString(hexArray: number[]): string {
  return String.fromCharCode(...hexArray);
}

/**
 * Convert hex array to hex string
 */
function hexArrayToHex(hexArray: number[]): string {
  return hexArray.map(byte => byte.toString(16).padStart(2, '0')).join('');
}

/**
 * Process UTXO input type
 */
function processUtxoInput(input: any): any {
  const utxoData = input.Utxo;
  const sourceId = utxoData.id.Transaction;
  const index = utxoData.index;

  return {
    input: {
      index,
      input_type: 'UTXO',
      source_id: sourceId,
      source_type: 'Transaction'
    },
    utxo: null // This would need to be populated from external data
  };
}

/**
 * Process AccountCommand input type
 */
function processAccountCommandInput(input: any): any {
  const [nonce, command] = input.AccountCommand;
  const commandType = Object.keys(command)[0];
  const commandData = command[commandType];

  const result: any = {
    input: {
      input_type: 'AccountCommand',
      nonce: nonce,
      command: commandType
    },
    utxo: null
  };

  if (commandType === 'MintTokens') {
    const [tokenId, amount] = commandData;
    result.input.token_id = tokenId;
    result.input.amount = createAmountObject(amount.atoms, true);
    // Authority would need to be extracted from context
  } else if (commandType === 'UnmintTokens') {
    result.input.token_id = commandData;
    // Amount and authority would need to be extracted from context
  } else if (commandType === 'FillOrder') {
    const [orderId, fillAmount, destination] = commandData;
    result.input.order_id = orderId;
    result.input.fill_atoms = fillAmount.atoms;
    result.input.destination = destination;
  } else if (commandType === 'ConcludeOrder') {
    result.input.order_id = commandData;
    // Destination would need to be extracted from context
  } else if (commandType === 'FreezeToken') {
    const [tokenId, isUnfreezable] = commandData;
    result.input.token_id = tokenId;
    result.input.is_unfreezable = isUnfreezable === 'Yes';
    // Authority would need to be extracted from context
  } else if (commandType === 'UnfreezeToken') {
    result.input.token_id = commandData;
    // Authority would need to be extracted from context
  } else if (commandType === 'LockTokenSupply') {
    result.input.token_id = commandData;
    // Authority would need to be extracted from context
  } else if (commandType === 'ChangeTokenAuthority') {
    const [tokenId, newAuthority] = commandData;
    result.input.token_id = tokenId;
    result.input.new_authority = newAuthority;
    // Authority would need to be extracted from context
  } else if (commandType === 'ChangeTokenMetadataUri') {
    const [tokenId, newMetadataUri] = commandData;
    result.input.token_id = tokenId;
    result.input.new_metadata_uri = hexArrayToString(newMetadataUri);
    // Authority would need to be extracted from context
  }

  return result;
}

/**
 * Process Account input type (for delegation)
 */
function processAccountInput(input: any): any {
  const accountData = input.Account;
  const nonce = accountData.nonce;
  const account = accountData.account;

  if (account.DelegationBalance) {
    const [delegationId, amount] = account.DelegationBalance;
    return {
      input: {
        input_type: 'Account',
        account_type: 'DelegationBalance',
        nonce,
        delegation_id: delegationId,
        amount: createAmountObject(amount.atoms, false)
      }
    };
  }

  return {
    input: {
      input_type: 'Account',
      nonce
    }
  };
}

/**
 * Process all inputs from transaction
 */
function processInputs(inputs: any[]): any[] {
  return inputs.map(input => {
    if (input.Utxo) {
      return processUtxoInput(input);
    } else if (input.AccountCommand) {
      return processAccountCommandInput(input);
    } else if (input.Account) {
      return processAccountInput(input);
    }
    return input;
  });
}

/**
 * Process Transfer output type
 */
function processTransferOutput(output: any): any {
  const [value, destination] = output.Transfer;
  return {
    destination,
    type: 'Transfer',
    value: parseValue(value)
  };
}

/**
 * Process LockThenTransfer output type
 */
function processLockThenTransferOutput(output: any): any {
  const [value, destination, lock] = output.LockThenTransfer;
  return {
    type: 'LockThenTransfer',
    destination,
    value: parseValue(value),
    lock: {
      type: lock.type,
      content: lock.content.toString()
    }
  };
}

/**
 * Process CreateOrder output type
 */
function processCreateOrderOutput(output: any): any {
  const orderData = output.CreateOrder;
  const askValue = parseValue(orderData.ask);
  const giveValue = parseValue(orderData.give);

  return {
    type: 'CreateOrder',
    conclude_destination: orderData.conclude_key,
    ask_currency: { type: askValue.type },
    ask_balance: askValue.amount,
    give_currency: giveValue.token_id ? { type: 'Token', token_id: giveValue.token_id } : { type: giveValue.type },
    give_balance: giveValue.amount,
    initially_asked: askValue.amount,
    initially_given: giveValue.amount
  };
}

/**
 * Process IssueFungibleToken output type
 */
function processIssueFungibleTokenOutput(output: any): any {
  const tokenData = output.IssueFungibleToken.V1;

  const result: any = {
    type: 'IssueFungibleToken',
    token_ticker: {
      hex: hexArrayToHex(tokenData.token_ticker),
      string: hexArrayToString(tokenData.token_ticker)
    },
    number_of_decimals: tokenData.number_of_decimals,
    metadata_uri: {
      hex: hexArrayToHex(tokenData.metadata_uri),
      string: hexArrayToString(tokenData.metadata_uri)
    },
    authority: tokenData.authority,
    is_freezable: tokenData.is_freezable === 'Yes'
  };

  if (tokenData.total_supply === 'Unlimited') {
    result.total_supply = { type: 'Unlimited' };
  } else if (tokenData.total_supply.Fixed) {
    result.total_supply = {
      type: 'Fixed',
      amount: createAmountObject(tokenData.total_supply.Fixed.atoms, true)
    };
  }

  return result;
}

/**
 * Process Htlc output type
 */
function processHtlcOutput(output: any): any {
  const [value, htlcData] = output.Htlc;
  return {
    type: 'Htlc',
    value: parseValue(value),
    htlc: {
      secret_hash: {
        hex: htlcData.secret_hash,
        string: null
      },
      spend_key: htlcData.spend_key,
      refund_timelock: {
        type: htlcData.refund_timelock.type,
        content: htlcData.refund_timelock.content
      },
      refund_key: htlcData.refund_key
    }
  };
}

/**
 * Process CreateDelegationId output type
 */
function processCreateDelegationIdOutput(output: any): any {
  const [destination, poolId] = output.CreateDelegationId;
  return {
    type: 'CreateDelegationId',
    destination,
    pool_id: poolId
  };
}

/**
 * Process DelegateStaking output type
 */
function processDelegateStakingOutput(output: any): any {
  const [amount, delegationId] = output.DelegateStaking;
  return {
    type: 'DelegateStaking',
    delegation_id: delegationId,
    amount: createAmountObject(amount.atoms, false)
  };
}

/**
 * Process DataDeposit output type
 */
function processDataDepositOutput(output: any): any {
  const dataArray = output.DataDeposit;
  return {
    type: 'DataDeposit',
    data: hexArrayToString(dataArray)
  };
}

/**
 * Process BurnToken output type
 */
function processBurnTokenOutput(output: any): any {
  const burnData = output.Burn;
  return {
    type: 'BurnToken',
    value: parseValue(burnData)
  };
}

/**
 * Process all outputs from transaction
 */
function processOutputs(outputs: any[]): any[] {
  return outputs.map(output => {
    if (output.Transfer) {
      return processTransferOutput(output);
    } else if (output.LockThenTransfer) {
      return processLockThenTransferOutput(output);
    } else if (output.CreateOrder) {
      return processCreateOrderOutput(output);
    } else if (output.IssueFungibleToken) {
      return processIssueFungibleTokenOutput(output);
    } else if (output.Htlc) {
      return processHtlcOutput(output);
    } else if (output.CreateDelegationId) {
      return processCreateDelegationIdOutput(output);
    } else if (output.DelegateStaking) {
      return processDelegateStakingOutput(output);
    } else if (output.DataDeposit) {
      return processDataDepositOutput(output);
    } else if (output.Burn) {
      return processBurnTokenOutput(output);
    }
    return output;
  });
}

export function parseDecodedTx(decoded: any) {
  // Extract transaction data
  const transaction = decoded.transaction?.V1 || decoded.tx?.V1;
  if (!transaction) {
    return decoded; // Return original if not in expected format
  }

  // Process inputs and outputs
  const processedInputs = processInputs(transaction.inputs || []);
  const processedOutputs = processOutputs(transaction.outputs || []);

  // Build result object
  const result: any = {
    inputs: processedInputs,
    outputs: processedOutputs
  };

  // Some transactions include fee and id (like createHtlc2)
  // This would need to be calculated based on transaction type and context
  // For now, we'll return the basic structure

  return result;
}
