# USDC Contract - React Hooks (Client-Side)

> Contract Address: 0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913
> Chain ID: 8453
> Generated for LLM consumption - Client-side React usage

This file documents the React hooks for interacting with the USDC contract in client-side applications.
All hooks use wagmi and have the contract address baked in.

Total: 24 read functions, 31 write functions, 17 events

---

# Read Hooks

Read functions query blockchain state without making changes. They are free to call and don't require gas.
These hooks use wagmi's useReadContract.

## useUsdcCANCEL_AUTHORIZATION_TYPEHASH

Solidity: CANCEL_AUTHORIZATION_TYPEHASH() returns (bytes32)

Returns: Hex (bytes32)

Usage:

```typescript
const { data, isLoading, error } = useUsdcCANCEL_AUTHORIZATION_TYPEHASH();
```

## useUsdcDOMAIN_SEPARATOR

Solidity: DOMAIN_SEPARATOR() returns (bytes32)

Returns: Hex (bytes32)

Usage:

```typescript
const { data, isLoading, error } = useUsdcDOMAIN_SEPARATOR();
```

## useUsdcPERMIT_TYPEHASH

Solidity: PERMIT_TYPEHASH() returns (bytes32)

Returns: Hex (bytes32)

Usage:

```typescript
const { data, isLoading, error } = useUsdcPERMIT_TYPEHASH();
```

## useUsdcRECEIVE_WITH_AUTHORIZATION_TYPEHASH

Solidity: RECEIVE_WITH_AUTHORIZATION_TYPEHASH() returns (bytes32)

Returns: Hex (bytes32)

Usage:

```typescript
const { data, isLoading, error } = useUsdcRECEIVE_WITH_AUTHORIZATION_TYPEHASH();
```

## useUsdcTRANSFER_WITH_AUTHORIZATION_TYPEHASH

Solidity: TRANSFER_WITH_AUTHORIZATION_TYPEHASH() returns (bytes32)

Returns: Hex (bytes32)

Usage:

```typescript
const { data, isLoading, error } =
  useUsdcTRANSFER_WITH_AUTHORIZATION_TYPEHASH();
```

## useUsdcAllowance

Solidity: allowance(address owner, address spender) returns (uint256)

Parameters:

- owner: Address (address)
- spender: Address (address)

Returns: bigint (uint256)

Usage:

```typescript
const { data, isLoading, error } = useUsdcAllowance(owner, spender);
```

## useUsdcAuthorizationState

Solidity: authorizationState(address authorizer, bytes32 nonce) returns (bool)

Parameters:

- authorizer: Address (address)
- nonce: Hex (bytes32)

Returns: boolean (bool)

Usage:

```typescript
const { data, isLoading, error } = useUsdcAuthorizationState(authorizer, nonce);
```

## useUsdcBalanceOf

Solidity: balanceOf(address account) returns (uint256)

Parameters:

- account: Address (address)

Returns: bigint (uint256)

Usage:

```typescript
const { data, isLoading, error } = useUsdcBalanceOf(account);
```

## useUsdcBlacklister

Solidity: blacklister() returns (address)

Returns: Address (address)

Usage:

```typescript
const { data, isLoading, error } = useUsdcBlacklister();
```

## useUsdcCurrency

Solidity: currency() returns (string)

Returns: string (string)

Usage:

```typescript
const { data, isLoading, error } = useUsdcCurrency();
```

## useUsdcDecimals

Solidity: decimals() returns (uint8)

Returns: number (uint8)

Usage:

```typescript
const { data, isLoading, error } = useUsdcDecimals();
```

## useUsdcIsBlacklisted

Solidity: isBlacklisted(address \_account) returns (bool)

Parameters:

- \_account: Address (address)

Returns: boolean (bool)

Usage:

```typescript
const { data, isLoading, error } = useUsdcIsBlacklisted(_account);
```

## useUsdcIsMinter

Solidity: isMinter(address account) returns (bool)

Parameters:

- account: Address (address)

Returns: boolean (bool)

Usage:

```typescript
const { data, isLoading, error } = useUsdcIsMinter(account);
```

## useUsdcMasterMinter

Solidity: masterMinter() returns (address)

Returns: Address (address)

Usage:

```typescript
const { data, isLoading, error } = useUsdcMasterMinter();
```

## useUsdcMinterAllowance

Solidity: minterAllowance(address minter) returns (uint256)

Parameters:

- minter: Address (address)

Returns: bigint (uint256)

Usage:

```typescript
const { data, isLoading, error } = useUsdcMinterAllowance(minter);
```

## useUsdcName

Solidity: name() returns (string)

Returns: string (string)

Usage:

```typescript
const { data, isLoading, error } = useUsdcName();
```

## useUsdcNonces

Solidity: nonces(address owner) returns (uint256)

Parameters:

- owner: Address (address)

Returns: bigint (uint256)

Usage:

```typescript
const { data, isLoading, error } = useUsdcNonces(owner);
```

## useUsdcOwner

Solidity: owner() returns (address)

Returns: Address (address)

Usage:

```typescript
const { data, isLoading, error } = useUsdcOwner();
```

## useUsdcPaused

Solidity: paused() returns (bool)

Returns: boolean (bool)

Usage:

```typescript
const { data, isLoading, error } = useUsdcPaused();
```

## useUsdcPauser

Solidity: pauser() returns (address)

Returns: Address (address)

Usage:

```typescript
const { data, isLoading, error } = useUsdcPauser();
```

## useUsdcRescuer

Solidity: rescuer() returns (address)

Returns: Address (address)

Usage:

```typescript
const { data, isLoading, error } = useUsdcRescuer();
```

## useUsdcSymbol

Solidity: symbol() returns (string)

Returns: string (string)

Usage:

```typescript
const { data, isLoading, error } = useUsdcSymbol();
```

## useUsdcTotalSupply

Solidity: totalSupply() returns (uint256)

Returns: bigint (uint256)

Usage:

```typescript
const { data, isLoading, error } = useUsdcTotalSupply();
```

## useUsdcVersion

Solidity: version() returns (string)

Returns: string (string)

Usage:

```typescript
const { data, isLoading, error } = useUsdcVersion();
```

---

# Write Hooks

Write functions modify blockchain state and require gas. They return transaction hashes.
These hooks use wagmi's useWriteContract.

## useUsdcApprove

Solidity: approve(address spender, uint256 value)

Parameters:

- spender: Address (address)
- value: bigint (uint256)

Usage:

```typescript
const { write, writeAsync, isPending } = useUsdcApprove();

// Sync: prompts wallet, doesn't wait
write({ spender, value });

// Async: waits for confirmation
const hash = await writeAsync({ spender, value });
```

## useUsdcBlacklist

Solidity: blacklist(address \_account)

Parameters:

- \_account: Address (address)

Usage:

```typescript
const { write, writeAsync, isPending } = useUsdcBlacklist();

// Sync: prompts wallet, doesn't wait
write({ _account });

// Async: waits for confirmation
const hash = await writeAsync({ _account });
```

## useUsdcBurn

Solidity: burn(uint256 \_amount)

Parameters:

- \_amount: bigint (uint256)

Usage:

```typescript
const { write, writeAsync, isPending } = useUsdcBurn();

// Sync: prompts wallet, doesn't wait
write({ _amount });

// Async: waits for confirmation
const hash = await writeAsync({ _amount });
```

## useUsdcCancelAuthorizationS

Solidity: cancelAuthorization(address authorizer, bytes32 nonce, uint8 v, bytes32 r, bytes32 s)

Parameters:

- authorizer: Address (address)
- nonce: Hex (bytes32)
- v: number (uint8)
- r: Hex (bytes32)
- s: Hex (bytes32)

Usage:

```typescript
const { write, writeAsync, isPending } = useUsdcCancelAuthorizationS();

// Sync: prompts wallet, doesn't wait
write({ authorizer, nonce, v, r, s });

// Async: waits for confirmation
const hash = await writeAsync({ authorizer, nonce, v, r, s });
```

## useUsdcCancelAuthorizationSignature

Solidity: cancelAuthorization(address authorizer, bytes32 nonce, bytes signature)

Parameters:

- authorizer: Address (address)
- nonce: Hex (bytes32)
- signature: Hex (bytes)

Usage:

```typescript
const { write, writeAsync, isPending } = useUsdcCancelAuthorizationSignature();

// Sync: prompts wallet, doesn't wait
write({ authorizer, nonce, signature });

// Async: waits for confirmation
const hash = await writeAsync({ authorizer, nonce, signature });
```

## useUsdcConfigureMinter

Solidity: configureMinter(address minter, uint256 minterAllowedAmount)

Parameters:

- minter: Address (address)
- minterAllowedAmount: bigint (uint256)

Usage:

```typescript
const { write, writeAsync, isPending } = useUsdcConfigureMinter();

// Sync: prompts wallet, doesn't wait
write({ minter, minterAllowedAmount });

// Async: waits for confirmation
const hash = await writeAsync({ minter, minterAllowedAmount });
```

## useUsdcDecreaseAllowance

Solidity: decreaseAllowance(address spender, uint256 decrement)

Parameters:

- spender: Address (address)
- decrement: bigint (uint256)

Usage:

```typescript
const { write, writeAsync, isPending } = useUsdcDecreaseAllowance();

// Sync: prompts wallet, doesn't wait
write({ spender, decrement });

// Async: waits for confirmation
const hash = await writeAsync({ spender, decrement });
```

## useUsdcIncreaseAllowance

Solidity: increaseAllowance(address spender, uint256 increment)

Parameters:

- spender: Address (address)
- increment: bigint (uint256)

Usage:

```typescript
const { write, writeAsync, isPending } = useUsdcIncreaseAllowance();

// Sync: prompts wallet, doesn't wait
write({ spender, increment });

// Async: waits for confirmation
const hash = await writeAsync({ spender, increment });
```

## useUsdcInitialize

Solidity: initialize(string tokenName, string tokenSymbol, string tokenCurrency, uint8 tokenDecimals, address newMasterMinter, address newPauser, address newBlacklister, address newOwner)

Parameters:

- tokenName: string (string)
- tokenSymbol: string (string)
- tokenCurrency: string (string)
- tokenDecimals: number (uint8)
- newMasterMinter: Address (address)
- newPauser: Address (address)
- newBlacklister: Address (address)
- newOwner: Address (address)

Usage:

```typescript
const { write, writeAsync, isPending } = useUsdcInitialize();

// Sync: prompts wallet, doesn't wait
write({
  tokenName,
  tokenSymbol,
  tokenCurrency,
  tokenDecimals,
  newMasterMinter,
  newPauser,
  newBlacklister,
  newOwner,
});

// Async: waits for confirmation
const hash = await writeAsync({
  tokenName,
  tokenSymbol,
  tokenCurrency,
  tokenDecimals,
  newMasterMinter,
  newPauser,
  newBlacklister,
  newOwner,
});
```

## useUsdcInitializeV2

Solidity: initializeV2(string newName)

Parameters:

- newName: string (string)

Usage:

```typescript
const { write, writeAsync, isPending } = useUsdcInitializeV2();

// Sync: prompts wallet, doesn't wait
write({ newName });

// Async: waits for confirmation
const hash = await writeAsync({ newName });
```

## useUsdcInitializeV2_1

Solidity: initializeV2_1(address lostAndFound)

Parameters:

- lostAndFound: Address (address)

Usage:

```typescript
const { write, writeAsync, isPending } = useUsdcInitializeV2_1();

// Sync: prompts wallet, doesn't wait
write({ lostAndFound });

// Async: waits for confirmation
const hash = await writeAsync({ lostAndFound });
```

## useUsdcInitializeV2_2

Solidity: initializeV2_2(address[] accountsToBlacklist, string newSymbol)

Parameters:

- accountsToBlacklist: readonly Address[] (address[])
- newSymbol: string (string)

Usage:

```typescript
const { write, writeAsync, isPending } = useUsdcInitializeV2_2();

// Sync: prompts wallet, doesn't wait
write({ accountsToBlacklist, newSymbol });

// Async: waits for confirmation
const hash = await writeAsync({ accountsToBlacklist, newSymbol });
```

## useUsdcMint

Solidity: mint(address \_to, uint256 \_amount)

Parameters:

- \_to: Address (address)
- \_amount: bigint (uint256)

Usage:

```typescript
const { write, writeAsync, isPending } = useUsdcMint();

// Sync: prompts wallet, doesn't wait
write({ _to, _amount });

// Async: waits for confirmation
const hash = await writeAsync({ _to, _amount });
```

## useUsdcPause

Solidity: pause()

Usage:

```typescript
const { write, writeAsync, isPending } = useUsdcPause();

// Sync: prompts wallet, doesn't wait
write();

// Async: waits for confirmation
const hash = await writeAsync();
```

## useUsdcPermitSignature

Solidity: permit(address owner, address spender, uint256 value, uint256 deadline, bytes signature)

Parameters:

- owner: Address (address)
- spender: Address (address)
- value: bigint (uint256)
- deadline: bigint (uint256)
- signature: Hex (bytes)

Usage:

```typescript
const { write, writeAsync, isPending } = useUsdcPermitSignature();

// Sync: prompts wallet, doesn't wait
write({ owner, spender, value, deadline, signature });

// Async: waits for confirmation
const hash = await writeAsync({ owner, spender, value, deadline, signature });
```

## useUsdcPermitS

Solidity: permit(address owner, address spender, uint256 value, uint256 deadline, uint8 v, bytes32 r, bytes32 s)

Parameters:

- owner: Address (address)
- spender: Address (address)
- value: bigint (uint256)
- deadline: bigint (uint256)
- v: number (uint8)
- r: Hex (bytes32)
- s: Hex (bytes32)

Usage:

```typescript
const { write, writeAsync, isPending } = useUsdcPermitS();

// Sync: prompts wallet, doesn't wait
write({ owner, spender, value, deadline, v, r, s });

// Async: waits for confirmation
const hash = await writeAsync({ owner, spender, value, deadline, v, r, s });
```

## useUsdcReceiveWithAuthorizationSignature

Solidity: receiveWithAuthorization(address from, address to, uint256 value, uint256 validAfter, uint256 validBefore, bytes32 nonce, bytes signature)

Parameters:

- from: Address (address)
- to: Address (address)
- value: bigint (uint256)
- validAfter: bigint (uint256)
- validBefore: bigint (uint256)
- nonce: Hex (bytes32)
- signature: Hex (bytes)

Usage:

```typescript
const { write, writeAsync, isPending } =
  useUsdcReceiveWithAuthorizationSignature();

// Sync: prompts wallet, doesn't wait
write({ from, to, value, validAfter, validBefore, nonce, signature });

// Async: waits for confirmation
const hash = await writeAsync({
  from,
  to,
  value,
  validAfter,
  validBefore,
  nonce,
  signature,
});
```

## useUsdcReceiveWithAuthorizationS

Solidity: receiveWithAuthorization(address from, address to, uint256 value, uint256 validAfter, uint256 validBefore, bytes32 nonce, uint8 v, bytes32 r, bytes32 s)

Parameters:

- from: Address (address)
- to: Address (address)
- value: bigint (uint256)
- validAfter: bigint (uint256)
- validBefore: bigint (uint256)
- nonce: Hex (bytes32)
- v: number (uint8)
- r: Hex (bytes32)
- s: Hex (bytes32)

Usage:

```typescript
const { write, writeAsync, isPending } = useUsdcReceiveWithAuthorizationS();

// Sync: prompts wallet, doesn't wait
write({ from, to, value, validAfter, validBefore, nonce, v, r, s });

// Async: waits for confirmation
const hash = await writeAsync({
  from,
  to,
  value,
  validAfter,
  validBefore,
  nonce,
  v,
  r,
  s,
});
```

## useUsdcRemoveMinter

Solidity: removeMinter(address minter)

Parameters:

- minter: Address (address)

Usage:

```typescript
const { write, writeAsync, isPending } = useUsdcRemoveMinter();

// Sync: prompts wallet, doesn't wait
write({ minter });

// Async: waits for confirmation
const hash = await writeAsync({ minter });
```

## useUsdcRescueERC20

Solidity: rescueERC20(address tokenContract, address to, uint256 amount)

Parameters:

- tokenContract: Address (address)
- to: Address (address)
- amount: bigint (uint256)

Usage:

```typescript
const { write, writeAsync, isPending } = useUsdcRescueERC20();

// Sync: prompts wallet, doesn't wait
write({ tokenContract, to, amount });

// Async: waits for confirmation
const hash = await writeAsync({ tokenContract, to, amount });
```

## useUsdcTransfer

Solidity: transfer(address to, uint256 value)

Parameters:

- to: Address (address)
- value: bigint (uint256)

Usage:

```typescript
const { write, writeAsync, isPending } = useUsdcTransfer();

// Sync: prompts wallet, doesn't wait
write({ to, value });

// Async: waits for confirmation
const hash = await writeAsync({ to, value });
```

## useUsdcTransferFrom

Solidity: transferFrom(address from, address to, uint256 value)

Parameters:

- from: Address (address)
- to: Address (address)
- value: bigint (uint256)

Usage:

```typescript
const { write, writeAsync, isPending } = useUsdcTransferFrom();

// Sync: prompts wallet, doesn't wait
write({ from, to, value });

// Async: waits for confirmation
const hash = await writeAsync({ from, to, value });
```

## useUsdcTransferOwnership

Solidity: transferOwnership(address newOwner)

Parameters:

- newOwner: Address (address)

Usage:

```typescript
const { write, writeAsync, isPending } = useUsdcTransferOwnership();

// Sync: prompts wallet, doesn't wait
write({ newOwner });

// Async: waits for confirmation
const hash = await writeAsync({ newOwner });
```

## useUsdcTransferWithAuthorizationSignature

Solidity: transferWithAuthorization(address from, address to, uint256 value, uint256 validAfter, uint256 validBefore, bytes32 nonce, bytes signature)

Parameters:

- from: Address (address)
- to: Address (address)
- value: bigint (uint256)
- validAfter: bigint (uint256)
- validBefore: bigint (uint256)
- nonce: Hex (bytes32)
- signature: Hex (bytes)

Usage:

```typescript
const { write, writeAsync, isPending } =
  useUsdcTransferWithAuthorizationSignature();

// Sync: prompts wallet, doesn't wait
write({ from, to, value, validAfter, validBefore, nonce, signature });

// Async: waits for confirmation
const hash = await writeAsync({
  from,
  to,
  value,
  validAfter,
  validBefore,
  nonce,
  signature,
});
```

## useUsdcTransferWithAuthorizationS

Solidity: transferWithAuthorization(address from, address to, uint256 value, uint256 validAfter, uint256 validBefore, bytes32 nonce, uint8 v, bytes32 r, bytes32 s)

Parameters:

- from: Address (address)
- to: Address (address)
- value: bigint (uint256)
- validAfter: bigint (uint256)
- validBefore: bigint (uint256)
- nonce: Hex (bytes32)
- v: number (uint8)
- r: Hex (bytes32)
- s: Hex (bytes32)

Usage:

```typescript
const { write, writeAsync, isPending } = useUsdcTransferWithAuthorizationS();

// Sync: prompts wallet, doesn't wait
write({ from, to, value, validAfter, validBefore, nonce, v, r, s });

// Async: waits for confirmation
const hash = await writeAsync({
  from,
  to,
  value,
  validAfter,
  validBefore,
  nonce,
  v,
  r,
  s,
});
```

## useUsdcUnBlacklist

Solidity: unBlacklist(address \_account)

Parameters:

- \_account: Address (address)

Usage:

```typescript
const { write, writeAsync, isPending } = useUsdcUnBlacklist();

// Sync: prompts wallet, doesn't wait
write({ _account });

// Async: waits for confirmation
const hash = await writeAsync({ _account });
```

## useUsdcUnpause

Solidity: unpause()

Usage:

```typescript
const { write, writeAsync, isPending } = useUsdcUnpause();

// Sync: prompts wallet, doesn't wait
write();

// Async: waits for confirmation
const hash = await writeAsync();
```

## useUsdcUpdateBlacklister

Solidity: updateBlacklister(address \_newBlacklister)

Parameters:

- \_newBlacklister: Address (address)

Usage:

```typescript
const { write, writeAsync, isPending } = useUsdcUpdateBlacklister();

// Sync: prompts wallet, doesn't wait
write({ _newBlacklister });

// Async: waits for confirmation
const hash = await writeAsync({ _newBlacklister });
```

## useUsdcUpdateMasterMinter

Solidity: updateMasterMinter(address \_newMasterMinter)

Parameters:

- \_newMasterMinter: Address (address)

Usage:

```typescript
const { write, writeAsync, isPending } = useUsdcUpdateMasterMinter();

// Sync: prompts wallet, doesn't wait
write({ _newMasterMinter });

// Async: waits for confirmation
const hash = await writeAsync({ _newMasterMinter });
```

## useUsdcUpdatePauser

Solidity: updatePauser(address \_newPauser)

Parameters:

- \_newPauser: Address (address)

Usage:

```typescript
const { write, writeAsync, isPending } = useUsdcUpdatePauser();

// Sync: prompts wallet, doesn't wait
write({ _newPauser });

// Async: waits for confirmation
const hash = await writeAsync({ _newPauser });
```

## useUsdcUpdateRescuer

Solidity: updateRescuer(address newRescuer)

Parameters:

- newRescuer: Address (address)

Usage:

```typescript
const { write, writeAsync, isPending } = useUsdcUpdateRescuer();

// Sync: prompts wallet, doesn't wait
write({ newRescuer });

// Async: waits for confirmation
const hash = await writeAsync({ newRescuer });
```

---

# Events

Events emitted by the contract. Use wagmi's useWatchContractEvent to listen.

## Approval

Solidity: event Approval(address indexed owner, address indexed spender, uint256 value)

Parameters:

- owner: Address (address) (indexed)
- spender: Address (address) (indexed)
- value: bigint (uint256)

## AuthorizationCanceled

Solidity: event AuthorizationCanceled(address indexed authorizer, bytes32 indexed nonce)

Parameters:

- authorizer: Address (address) (indexed)
- nonce: Hex (bytes32) (indexed)

## AuthorizationUsed

Solidity: event AuthorizationUsed(address indexed authorizer, bytes32 indexed nonce)

Parameters:

- authorizer: Address (address) (indexed)
- nonce: Hex (bytes32) (indexed)

## Blacklisted

Solidity: event Blacklisted(address indexed \_account)

Parameters:

- \_account: Address (address) (indexed)

## BlacklisterChanged

Solidity: event BlacklisterChanged(address indexed newBlacklister)

Parameters:

- newBlacklister: Address (address) (indexed)

## Burn

Solidity: event Burn(address indexed burner, uint256 amount)

Parameters:

- burner: Address (address) (indexed)
- amount: bigint (uint256)

## MasterMinterChanged

Solidity: event MasterMinterChanged(address indexed newMasterMinter)

Parameters:

- newMasterMinter: Address (address) (indexed)

## Mint

Solidity: event Mint(address indexed minter, address indexed to, uint256 amount)

Parameters:

- minter: Address (address) (indexed)
- to: Address (address) (indexed)
- amount: bigint (uint256)

## MinterConfigured

Solidity: event MinterConfigured(address indexed minter, uint256 minterAllowedAmount)

Parameters:

- minter: Address (address) (indexed)
- minterAllowedAmount: bigint (uint256)

## MinterRemoved

Solidity: event MinterRemoved(address indexed oldMinter)

Parameters:

- oldMinter: Address (address) (indexed)

## OwnershipTransferred

Solidity: event OwnershipTransferred(address previousOwner, address newOwner)

Parameters:

- previousOwner: Address (address)
- newOwner: Address (address)

## Pause

Solidity: event Pause()

## PauserChanged

Solidity: event PauserChanged(address indexed newAddress)

Parameters:

- newAddress: Address (address) (indexed)

## RescuerChanged

Solidity: event RescuerChanged(address indexed newRescuer)

Parameters:

- newRescuer: Address (address) (indexed)

## Transfer

Solidity: event Transfer(address indexed from, address indexed to, uint256 value)

Parameters:

- from: Address (address) (indexed)
- to: Address (address) (indexed)
- value: bigint (uint256)

## UnBlacklisted

Solidity: event UnBlacklisted(address indexed \_account)

Parameters:

- \_account: Address (address) (indexed)

## Unpause

Solidity: event Unpause()
