# USDC Contract - Class-Based Client (Server-Side)

> Contract Address: 0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913
> Chain ID: 8453
> Generated for LLM consumption - Server-side/class-based usage

This file documents the UsdcContract class for server-side or complex interactions.
The class uses viem and has the contract address baked in.

Total: 24 read methods, 31 write methods

## Setup

```typescript
import { createPublicClient, createWalletClient, http } from "viem";
import { UsdcContract } from "./UsdcContract";

const publicClient = createPublicClient({
  chain: yourChain,
  transport: http(),
});

const walletClient = createWalletClient({
  chain: yourChain,
  transport: http(),
  account: yourAccount,
});

const contract = new UsdcContract(publicClient, walletClient);
```

---

# Read Methods

Read methods query blockchain state without making changes. They are free and return Promises.

## CANCEL_AUTHORIZATION_TYPEHASH

Solidity: CANCEL_AUTHORIZATION_TYPEHASH() returns (bytes32)

Returns: Promise<Hex> (bytes32)

Usage:

```typescript
const result = await contract.CANCEL_AUTHORIZATION_TYPEHASH();
```

## DOMAIN_SEPARATOR

Solidity: DOMAIN_SEPARATOR() returns (bytes32)

Returns: Promise<Hex> (bytes32)

Usage:

```typescript
const result = await contract.DOMAIN_SEPARATOR();
```

## PERMIT_TYPEHASH

Solidity: PERMIT_TYPEHASH() returns (bytes32)

Returns: Promise<Hex> (bytes32)

Usage:

```typescript
const result = await contract.PERMIT_TYPEHASH();
```

## RECEIVE_WITH_AUTHORIZATION_TYPEHASH

Solidity: RECEIVE_WITH_AUTHORIZATION_TYPEHASH() returns (bytes32)

Returns: Promise<Hex> (bytes32)

Usage:

```typescript
const result = await contract.RECEIVE_WITH_AUTHORIZATION_TYPEHASH();
```

## TRANSFER_WITH_AUTHORIZATION_TYPEHASH

Solidity: TRANSFER_WITH_AUTHORIZATION_TYPEHASH() returns (bytes32)

Returns: Promise<Hex> (bytes32)

Usage:

```typescript
const result = await contract.TRANSFER_WITH_AUTHORIZATION_TYPEHASH();
```

## allowance

Solidity: allowance(address owner, address spender) returns (uint256)

Parameters:

- owner: Address (address)
- spender: Address (address)

Returns: Promise<bigint> (uint256)

Usage:

```typescript
const result = await contract.allowance(owner, spender);
```

## authorizationState

Solidity: authorizationState(address authorizer, bytes32 nonce) returns (bool)

Parameters:

- authorizer: Address (address)
- nonce: Hex (bytes32)

Returns: Promise<boolean> (bool)

Usage:

```typescript
const result = await contract.authorizationState(authorizer, nonce);
```

## balanceOf

Solidity: balanceOf(address account) returns (uint256)

Parameters:

- account: Address (address)

Returns: Promise<bigint> (uint256)

Usage:

```typescript
const result = await contract.balanceOf(account);
```

## blacklister

Solidity: blacklister() returns (address)

Returns: Promise<Address> (address)

Usage:

```typescript
const result = await contract.blacklister();
```

## currency

Solidity: currency() returns (string)

Returns: Promise<string> (string)

Usage:

```typescript
const result = await contract.currency();
```

## decimals

Solidity: decimals() returns (uint8)

Returns: Promise<number> (uint8)

Usage:

```typescript
const result = await contract.decimals();
```

## isBlacklisted

Solidity: isBlacklisted(address \_account) returns (bool)

Parameters:

- \_account: Address (address)

Returns: Promise<boolean> (bool)

Usage:

```typescript
const result = await contract.isBlacklisted(_account);
```

## isMinter

Solidity: isMinter(address account) returns (bool)

Parameters:

- account: Address (address)

Returns: Promise<boolean> (bool)

Usage:

```typescript
const result = await contract.isMinter(account);
```

## masterMinter

Solidity: masterMinter() returns (address)

Returns: Promise<Address> (address)

Usage:

```typescript
const result = await contract.masterMinter();
```

## minterAllowance

Solidity: minterAllowance(address minter) returns (uint256)

Parameters:

- minter: Address (address)

Returns: Promise<bigint> (uint256)

Usage:

```typescript
const result = await contract.minterAllowance(minter);
```

## name

Solidity: name() returns (string)

Returns: Promise<string> (string)

Usage:

```typescript
const result = await contract.name();
```

## nonces

Solidity: nonces(address owner) returns (uint256)

Parameters:

- owner: Address (address)

Returns: Promise<bigint> (uint256)

Usage:

```typescript
const result = await contract.nonces(owner);
```

## owner

Solidity: owner() returns (address)

Returns: Promise<Address> (address)

Usage:

```typescript
const result = await contract.owner();
```

## paused

Solidity: paused() returns (bool)

Returns: Promise<boolean> (bool)

Usage:

```typescript
const result = await contract.paused();
```

## pauser

Solidity: pauser() returns (address)

Returns: Promise<Address> (address)

Usage:

```typescript
const result = await contract.pauser();
```

## rescuer

Solidity: rescuer() returns (address)

Returns: Promise<Address> (address)

Usage:

```typescript
const result = await contract.rescuer();
```

## symbol

Solidity: symbol() returns (string)

Returns: Promise<string> (string)

Usage:

```typescript
const result = await contract.symbol();
```

## totalSupply

Solidity: totalSupply() returns (uint256)

Returns: Promise<bigint> (uint256)

Usage:

```typescript
const result = await contract.totalSupply();
```

## version

Solidity: version() returns (string)

Returns: Promise<string> (string)

Usage:

```typescript
const result = await contract.version();
```

---

# Write Methods

Write methods modify blockchain state and require gas. They return transaction hashes.
Each method has two variants: standard (with simulation) and WithoutSimulation (faster, less safe).

## approve

Solidity: approve(address spender, uint256 value)

Parameters:

- spender: Address (address)
- value: bigint (uint256)

Returns: Promise<Hex> (transaction hash)

Usage:

```typescript
// With simulation (safer, slower)
const hash = await contract.approve(spender, value);

// Without simulation (faster, less safe)
const hash = await contract.approveWithoutSimulation(spender, value);
```

## blacklist

Solidity: blacklist(address \_account)

Parameters:

- \_account: Address (address)

Returns: Promise<Hex> (transaction hash)

Usage:

```typescript
// With simulation (safer, slower)
const hash = await contract.blacklist(_account);

// Without simulation (faster, less safe)
const hash = await contract.blacklistWithoutSimulation(_account);
```

## burn

Solidity: burn(uint256 \_amount)

Parameters:

- \_amount: bigint (uint256)

Returns: Promise<Hex> (transaction hash)

Usage:

```typescript
// With simulation (safer, slower)
const hash = await contract.burn(_amount);

// Without simulation (faster, less safe)
const hash = await contract.burnWithoutSimulation(_amount);
```

## cancelAuthorizations

Solidity: cancelAuthorization(address authorizer, bytes32 nonce, uint8 v, bytes32 r, bytes32 s)

Parameters:

- authorizer: Address (address)
- nonce: Hex (bytes32)
- v: number (uint8)
- r: Hex (bytes32)
- s: Hex (bytes32)

Returns: Promise<Hex> (transaction hash)

Usage:

```typescript
// With simulation (safer, slower)
const hash = await contract.cancelAuthorizations(authorizer, nonce, v, r, s);

// Without simulation (faster, less safe)
const hash = await contract.cancelAuthorizationsWithoutSimulation(
  authorizer,
  nonce,
  v,
  r,
  s,
);
```

## cancelAuthorizationsignature

Solidity: cancelAuthorization(address authorizer, bytes32 nonce, bytes signature)

Parameters:

- authorizer: Address (address)
- nonce: Hex (bytes32)
- signature: Hex (bytes)

Returns: Promise<Hex> (transaction hash)

Usage:

```typescript
// With simulation (safer, slower)
const hash = await contract.cancelAuthorizationsignature(
  authorizer,
  nonce,
  signature,
);

// Without simulation (faster, less safe)
const hash = await contract.cancelAuthorizationsignatureWithoutSimulation(
  authorizer,
  nonce,
  signature,
);
```

## configureMinter

Solidity: configureMinter(address minter, uint256 minterAllowedAmount)

Parameters:

- minter: Address (address)
- minterAllowedAmount: bigint (uint256)

Returns: Promise<Hex> (transaction hash)

Usage:

```typescript
// With simulation (safer, slower)
const hash = await contract.configureMinter(minter, minterAllowedAmount);

// Without simulation (faster, less safe)
const hash = await contract.configureMinterWithoutSimulation(
  minter,
  minterAllowedAmount,
);
```

## decreaseAllowance

Solidity: decreaseAllowance(address spender, uint256 decrement)

Parameters:

- spender: Address (address)
- decrement: bigint (uint256)

Returns: Promise<Hex> (transaction hash)

Usage:

```typescript
// With simulation (safer, slower)
const hash = await contract.decreaseAllowance(spender, decrement);

// Without simulation (faster, less safe)
const hash = await contract.decreaseAllowanceWithoutSimulation(
  spender,
  decrement,
);
```

## increaseAllowance

Solidity: increaseAllowance(address spender, uint256 increment)

Parameters:

- spender: Address (address)
- increment: bigint (uint256)

Returns: Promise<Hex> (transaction hash)

Usage:

```typescript
// With simulation (safer, slower)
const hash = await contract.increaseAllowance(spender, increment);

// Without simulation (faster, less safe)
const hash = await contract.increaseAllowanceWithoutSimulation(
  spender,
  increment,
);
```

## initialize

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

Returns: Promise<Hex> (transaction hash)

Usage:

```typescript
// With simulation (safer, slower)
const hash = await contract.initialize(
  tokenName,
  tokenSymbol,
  tokenCurrency,
  tokenDecimals,
  newMasterMinter,
  newPauser,
  newBlacklister,
  newOwner,
);

// Without simulation (faster, less safe)
const hash = await contract.initializeWithoutSimulation(
  tokenName,
  tokenSymbol,
  tokenCurrency,
  tokenDecimals,
  newMasterMinter,
  newPauser,
  newBlacklister,
  newOwner,
);
```

## initializeV2

Solidity: initializeV2(string newName)

Parameters:

- newName: string (string)

Returns: Promise<Hex> (transaction hash)

Usage:

```typescript
// With simulation (safer, slower)
const hash = await contract.initializeV2(newName);

// Without simulation (faster, less safe)
const hash = await contract.initializeV2WithoutSimulation(newName);
```

## initializeV2_1

Solidity: initializeV2_1(address lostAndFound)

Parameters:

- lostAndFound: Address (address)

Returns: Promise<Hex> (transaction hash)

Usage:

```typescript
// With simulation (safer, slower)
const hash = await contract.initializeV2_1(lostAndFound);

// Without simulation (faster, less safe)
const hash = await contract.initializeV2_1WithoutSimulation(lostAndFound);
```

## initializeV2_2

Solidity: initializeV2_2(address[] accountsToBlacklist, string newSymbol)

Parameters:

- accountsToBlacklist: readonly Address[] (address[])
- newSymbol: string (string)

Returns: Promise<Hex> (transaction hash)

Usage:

```typescript
// With simulation (safer, slower)
const hash = await contract.initializeV2_2(accountsToBlacklist, newSymbol);

// Without simulation (faster, less safe)
const hash = await contract.initializeV2_2WithoutSimulation(
  accountsToBlacklist,
  newSymbol,
);
```

## mint

Solidity: mint(address \_to, uint256 \_amount)

Parameters:

- \_to: Address (address)
- \_amount: bigint (uint256)

Returns: Promise<Hex> (transaction hash)

Usage:

```typescript
// With simulation (safer, slower)
const hash = await contract.mint(_to, _amount);

// Without simulation (faster, less safe)
const hash = await contract.mintWithoutSimulation(_to, _amount);
```

## pause

Solidity: pause()

Returns: Promise<Hex> (transaction hash)

Usage:

```typescript
// With simulation (safer, slower)
const hash = await contract.pause();

// Without simulation (faster, less safe)
const hash = await contract.pauseWithoutSimulation();
```

## permitsignature

Solidity: permit(address owner, address spender, uint256 value, uint256 deadline, bytes signature)

Parameters:

- owner: Address (address)
- spender: Address (address)
- value: bigint (uint256)
- deadline: bigint (uint256)
- signature: Hex (bytes)

Returns: Promise<Hex> (transaction hash)

Usage:

```typescript
// With simulation (safer, slower)
const hash = await contract.permitsignature(
  owner,
  spender,
  value,
  deadline,
  signature,
);

// Without simulation (faster, less safe)
const hash = await contract.permitsignatureWithoutSimulation(
  owner,
  spender,
  value,
  deadline,
  signature,
);
```

## permits

Solidity: permit(address owner, address spender, uint256 value, uint256 deadline, uint8 v, bytes32 r, bytes32 s)

Parameters:

- owner: Address (address)
- spender: Address (address)
- value: bigint (uint256)
- deadline: bigint (uint256)
- v: number (uint8)
- r: Hex (bytes32)
- s: Hex (bytes32)

Returns: Promise<Hex> (transaction hash)

Usage:

```typescript
// With simulation (safer, slower)
const hash = await contract.permits(owner, spender, value, deadline, v, r, s);

// Without simulation (faster, less safe)
const hash = await contract.permitsWithoutSimulation(
  owner,
  spender,
  value,
  deadline,
  v,
  r,
  s,
);
```

## receiveWithAuthorizationsignature

Solidity: receiveWithAuthorization(address from, address to, uint256 value, uint256 validAfter, uint256 validBefore, bytes32 nonce, bytes signature)

Parameters:

- from: Address (address)
- to: Address (address)
- value: bigint (uint256)
- validAfter: bigint (uint256)
- validBefore: bigint (uint256)
- nonce: Hex (bytes32)
- signature: Hex (bytes)

Returns: Promise<Hex> (transaction hash)

Usage:

```typescript
// With simulation (safer, slower)
const hash = await contract.receiveWithAuthorizationsignature(
  from,
  to,
  value,
  validAfter,
  validBefore,
  nonce,
  signature,
);

// Without simulation (faster, less safe)
const hash = await contract.receiveWithAuthorizationsignatureWithoutSimulation(
  from,
  to,
  value,
  validAfter,
  validBefore,
  nonce,
  signature,
);
```

## receiveWithAuthorizations

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

Returns: Promise<Hex> (transaction hash)

Usage:

```typescript
// With simulation (safer, slower)
const hash = await contract.receiveWithAuthorizations(
  from,
  to,
  value,
  validAfter,
  validBefore,
  nonce,
  v,
  r,
  s,
);

// Without simulation (faster, less safe)
const hash = await contract.receiveWithAuthorizationsWithoutSimulation(
  from,
  to,
  value,
  validAfter,
  validBefore,
  nonce,
  v,
  r,
  s,
);
```

## removeMinter

Solidity: removeMinter(address minter)

Parameters:

- minter: Address (address)

Returns: Promise<Hex> (transaction hash)

Usage:

```typescript
// With simulation (safer, slower)
const hash = await contract.removeMinter(minter);

// Without simulation (faster, less safe)
const hash = await contract.removeMinterWithoutSimulation(minter);
```

## rescueERC20

Solidity: rescueERC20(address tokenContract, address to, uint256 amount)

Parameters:

- tokenContract: Address (address)
- to: Address (address)
- amount: bigint (uint256)

Returns: Promise<Hex> (transaction hash)

Usage:

```typescript
// With simulation (safer, slower)
const hash = await contract.rescueERC20(tokenContract, to, amount);

// Without simulation (faster, less safe)
const hash = await contract.rescueERC20WithoutSimulation(
  tokenContract,
  to,
  amount,
);
```

## transfer

Solidity: transfer(address to, uint256 value)

Parameters:

- to: Address (address)
- value: bigint (uint256)

Returns: Promise<Hex> (transaction hash)

Usage:

```typescript
// With simulation (safer, slower)
const hash = await contract.transfer(to, value);

// Without simulation (faster, less safe)
const hash = await contract.transferWithoutSimulation(to, value);
```

## transferFrom

Solidity: transferFrom(address from, address to, uint256 value)

Parameters:

- from: Address (address)
- to: Address (address)
- value: bigint (uint256)

Returns: Promise<Hex> (transaction hash)

Usage:

```typescript
// With simulation (safer, slower)
const hash = await contract.transferFrom(from, to, value);

// Without simulation (faster, less safe)
const hash = await contract.transferFromWithoutSimulation(from, to, value);
```

## transferOwnership

Solidity: transferOwnership(address newOwner)

Parameters:

- newOwner: Address (address)

Returns: Promise<Hex> (transaction hash)

Usage:

```typescript
// With simulation (safer, slower)
const hash = await contract.transferOwnership(newOwner);

// Without simulation (faster, less safe)
const hash = await contract.transferOwnershipWithoutSimulation(newOwner);
```

## transferWithAuthorizationsignature

Solidity: transferWithAuthorization(address from, address to, uint256 value, uint256 validAfter, uint256 validBefore, bytes32 nonce, bytes signature)

Parameters:

- from: Address (address)
- to: Address (address)
- value: bigint (uint256)
- validAfter: bigint (uint256)
- validBefore: bigint (uint256)
- nonce: Hex (bytes32)
- signature: Hex (bytes)

Returns: Promise<Hex> (transaction hash)

Usage:

```typescript
// With simulation (safer, slower)
const hash = await contract.transferWithAuthorizationsignature(
  from,
  to,
  value,
  validAfter,
  validBefore,
  nonce,
  signature,
);

// Without simulation (faster, less safe)
const hash = await contract.transferWithAuthorizationsignatureWithoutSimulation(
  from,
  to,
  value,
  validAfter,
  validBefore,
  nonce,
  signature,
);
```

## transferWithAuthorizations

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

Returns: Promise<Hex> (transaction hash)

Usage:

```typescript
// With simulation (safer, slower)
const hash = await contract.transferWithAuthorizations(
  from,
  to,
  value,
  validAfter,
  validBefore,
  nonce,
  v,
  r,
  s,
);

// Without simulation (faster, less safe)
const hash = await contract.transferWithAuthorizationsWithoutSimulation(
  from,
  to,
  value,
  validAfter,
  validBefore,
  nonce,
  v,
  r,
  s,
);
```

## unBlacklist

Solidity: unBlacklist(address \_account)

Parameters:

- \_account: Address (address)

Returns: Promise<Hex> (transaction hash)

Usage:

```typescript
// With simulation (safer, slower)
const hash = await contract.unBlacklist(_account);

// Without simulation (faster, less safe)
const hash = await contract.unBlacklistWithoutSimulation(_account);
```

## unpause

Solidity: unpause()

Returns: Promise<Hex> (transaction hash)

Usage:

```typescript
// With simulation (safer, slower)
const hash = await contract.unpause();

// Without simulation (faster, less safe)
const hash = await contract.unpauseWithoutSimulation();
```

## updateBlacklister

Solidity: updateBlacklister(address \_newBlacklister)

Parameters:

- \_newBlacklister: Address (address)

Returns: Promise<Hex> (transaction hash)

Usage:

```typescript
// With simulation (safer, slower)
const hash = await contract.updateBlacklister(_newBlacklister);

// Without simulation (faster, less safe)
const hash = await contract.updateBlacklisterWithoutSimulation(_newBlacklister);
```

## updateMasterMinter

Solidity: updateMasterMinter(address \_newMasterMinter)

Parameters:

- \_newMasterMinter: Address (address)

Returns: Promise<Hex> (transaction hash)

Usage:

```typescript
// With simulation (safer, slower)
const hash = await contract.updateMasterMinter(_newMasterMinter);

// Without simulation (faster, less safe)
const hash =
  await contract.updateMasterMinterWithoutSimulation(_newMasterMinter);
```

## updatePauser

Solidity: updatePauser(address \_newPauser)

Parameters:

- \_newPauser: Address (address)

Returns: Promise<Hex> (transaction hash)

Usage:

```typescript
// With simulation (safer, slower)
const hash = await contract.updatePauser(_newPauser);

// Without simulation (faster, less safe)
const hash = await contract.updatePauserWithoutSimulation(_newPauser);
```

## updateRescuer

Solidity: updateRescuer(address newRescuer)

Parameters:

- newRescuer: Address (address)

Returns: Promise<Hex> (transaction hash)

Usage:

```typescript
// With simulation (safer, slower)
const hash = await contract.updateRescuer(newRescuer);

// Without simulation (faster, less safe)
const hash = await contract.updateRescuerWithoutSimulation(newRescuer);
```
