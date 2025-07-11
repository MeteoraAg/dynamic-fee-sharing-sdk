# Dynamic Fee Sharing SDK: Function Documentation

## Table of Contents

- [Core Functions](#core-functions)

  - [createFeeVault](#createFeeVault)
  - [createFeeVaultPda](#createFeeVaultPda)
  - [fundFeeVault](#fundFeeVault)
  - [claimUserFee](#claimUserFee)

- [State Functions](#state-functions)

  - [getFeeVault](#getFeeVault)

- [Helper Functions](#helper-functions)

  - [deriveFeeVaultPdaAddress](#deriveFeeVaultPdaAddress)

---

## Core Functions

### createFeeVault

Creates a fee vault.

#### Function

```typescript
async createFeeVault(createFeeVaultParam: CreateFeeVaultParam): Promise<Transaction>
```

#### Parameters

```typescript
interface CreateFeeVaultParam {
  feeVault: PublicKey; // The fee vault address
  tokenMint: PublicKey; // The token mint address
  tokenProgram: PublicKey; // The token program address
  owner: PublicKey; // The owner of the fee vault
  payer: PublicKey; // The wallet that will pay for the transaction
  userShare: UserShare[]; // The user share of the fee vault
}

interface UserShare {
  address: PublicKey; // The user address
  share: BN; // The user share
}
```

#### Returns

A transaction that can be signed and sent to the network.

#### Example

```typescript
const feeVault = Keypair.generate();
const transaction = await client.createFeeVault({
  feeVault: feeVault.publicKey,
  tokenMint: new PublicKey("tokenMint1234567890abcdefghijklmnopqrstuvwxyz"),
  tokenProgram: TOKEN_PROGRAM_ID,
  owner: owner.publicKey,
  payer: payer.publicKey,
  userShare: [
    {
      address: new PublicKey("user1234567890abcdefghijklmnopqrstuvwxyz"),
      share: new BN(1000000),
    },
    {
      address: new PublicKey("user1234567890abcdefghijklmnopqrstuvwxyz"),
      share: new BN(1000000),
    },
  ],
});
```

#### Notes

- The `payer` and `feeVault` is required to sign the transaction.
- `UserShare` is an array of objects with `address` and `share`.
  - Minimum: At least 2 users must be included
  - Maximum: No more than 5 users can be included

---

### createFeeVaultPda

Creates a fee vault PDA.

#### Function

```typescript
async createFeeVaultPda(createFeeVaultPdaParam: CreateFeeVaultPdaParam): Promise<Transaction>
```

#### Parameters

```typescript
interface CreateFeeVaultParam {
  base: PublicKey; // The base address
  tokenMint: PublicKey; // The token mint address
  owner: PublicKey; // The owner of the fee vault
  payer: PublicKey; // The wallet that will pay for the transaction
  userShare: UserShare[]; // The user share of the fee vault
}

interface UserShare {
  address: PublicKey; // The user address
  share: BN; // The user share
}
```

#### Returns

A transaction that can be signed and sent to the network.

#### Example

```typescript
const base = Keypair.generate();
const transaction = await client.createFeeVaultPda({
  base: base.publicKey,
  tokenMint: new PublicKey("tokenMint1234567890abcdefghijklmnopqrstuvwxyz"),
  owner: owner.publicKey,
  payer: payer.publicKey,
  userShare: [
    {
      address: new PublicKey("user1234567890abcdefghijklmnopqrstuvwxyz"),
      share: new BN(1000000),
    },
    {
      address: new PublicKey("user1234567890abcdefghijklmnopqrstuvwxyz"),
      share: new BN(1000000),
    },
  ],
});
```

#### Notes

- The `payer` and `base` is required to sign the transaction.
- `UserShare` is an array of objects with `address` and `share`.
  - Minimum: At least 2 users must be included
  - Maximum: No more than 5 users can be included

---

### fundFeeVault

Funds the fee vault.

#### Function

```typescript
async fundFeeVault(fundFeeVaultParam: FundFeeVaultParam): Promise<Transaction>
```

#### Parameters

```typescript
interface FundFeeVaultParam {
  fundAmount: BN; // The amount to fund
  feeVault: PublicKey; // The fee vault address
  funder: PublicKey; // The funder address
}
```

#### Returns

A transaction that can be signed and sent to the network.

#### Example

```typescript
const transaction = await client.fundFeeVault({
  fundAmount: new BN(1000000),
  feeVault: new PublicKey("user1234567890abcdefghijklmnopqrstuvwxyz"),
  funder: funder.publicKey,
});
```

#### Notes

- The `funder` is required to sign the transaction.

---

### claimUserFee

Claims the fee for the user.

#### Function

```typescript
async claimUserFee(claimUserFeeParam: ClaimUserFeeParam): Promise<Transaction>
```

#### Parameters

```typescript
interface ClaimUserFeeParam {
  feeVault: PublicKey; // The fee vault address
  user: PublicKey; // The user address
  payer: PublicKey; // The wallet that will pay for the transaction
}
```

#### Returns

A transaction that can be signed and sent to the network.

#### Example

```typescript
const transaction = await client.claimUserFee({
  feeVault: new PublicKey("user1234567890abcdefghijklmnopqrstuvwxyz"),
  user: user.publicKey,
  payer: payer.publicKey,
});
```

#### Notes

- The `payer` and `user` is required to sign the transaction.

---

## State Functions

### getFeeVault

Get the fee vault state.

#### Function

```typescript
async getFeeVault(feeVault: PublicKey): Promise<FeeVault>
```

#### Parameters

```typescript
feeVault: PublicKey;
```

#### Returns

A transaction that can be signed and sent to the network.

#### Example

```typescript
const feeVault = await client.getFeeVault(
  new PublicKey("vault1234567890abcdefghijklmnopqrstuvwxyz")
});
```

#### Notes

- This function returns the fee vault state.

---

## Helper Functions

### deriveFeeVaultPdaAddress

Derive the fee vault PDA address.

#### Function

```typescript
deriveFeeVaultPdaAddress(base: PublicKey, tokenMint: PublicKey): PublicKey
```

#### Parameters

```typescript
base: PublicKey;
tokenMint: PublicKey;
```

#### Returns

A PDA address.

#### Example

```typescript
const feeVaultPda = deriveFeeVaultPdaAddress(
  new PublicKey("base1234567890abcdefghijklmnopqrstuvwxyz"),
  new PublicKey("tokenMint1234567890abcdefghijklmnopqrstuvwxyz")
);
```

#### Notes

- This function returns the PDA address of the fee vault.
