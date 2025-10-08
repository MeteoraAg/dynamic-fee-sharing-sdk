# Dynamic Fee Sharing SDK: Function Documentation

## Table of Contents

- [Core Functions](#core-functions)

  - [createFeeVault](#createFeeVault)
  - [createFeeVaultPda](#createFeeVaultPda)
  - [fundFeeVault](#fundFeeVault)
  - [fundByDammV2ClaimFee](#fundByDammV2ClaimFee)
  - [fundByDbcClaimCreatorTradingFee](#fundByDbcClaimCreatorTradingFee)
  - [fundByDbcClaimPartnerTradingFee](#fundByDbcClaimPartnerTradingFee)
  - [fundByDbcClaimCreatorSurplus](#fundByDbcClaimCreatorSurplus)
  - [fundByDbcClaimPartnerSurplus](#fundByDbcClaimPartnerSurplus)
  - [claimUserFee](#claimUserFee)

- [State Functions](#state-functions)

  - [getFeeVault](#getFeeVault)

- [Helper Functions](#helper-functions)

  - [deriveFeeVaultPdaAddress](#deriveFeeVaultPdaAddress)
  - [convertToLamportsBN](#convertToLamportsBN)

---

## Core Functions

### createFeeVault

Creates a fee vault.

**Function**

```typescript
async createFeeVault(createFeeVaultParam: CreateFeeVaultParam): Promise<Transaction>
```

**Parameters**

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
  share: number; // The user share
}
```

**Returns**

A transaction that can be signed and sent to the network.

**Example**

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
      share: 1000000,
    },
    {
      address: new PublicKey("user1234567890abcdefghijklmnopqrstuvwxyz"),
      share: 1000000,
    },
  ],
});
```

**Notes**

- The `payer` and `feeVault` is required to sign the transaction.
- `UserShare` is an array of objects with `address` and `share`.
  - Minimum: At least 2 users must be included
  - Maximum: No more than 5 users can be included

---

### createFeeVaultPda

Creates a fee vault PDA.

**Function**

```typescript
async createFeeVaultPda(createFeeVaultPdaParam: CreateFeeVaultPdaParam): Promise<Transaction>
```

**Parameters**

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
  share: number; // The user share
}
```

**Returns**

A transaction that can be signed and sent to the network.

**Example**

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
      share: 1000000,
    },
    {
      address: new PublicKey("user1234567890abcdefghijklmnopqrstuvwxyz"),
      share: 1000000,
    },
  ],
});
```

**Notes**

- The `payer` and `base` is required to sign the transaction.
- `UserShare` is an array of objects with `address` and `share`.
  - Minimum: At least 2 users must be included
  - Maximum: No more than 5 users can be included

---

### fundFeeVault

Funds the fee vault.

**Function**

```typescript
async fundFeeVault(fundFeeVaultParam: FundFeeVaultParam): Promise<Transaction>
```

**Parameters**

```typescript
interface FundFeeVaultParam {
  fundAmount: BN; // The amount to fund
  feeVault: PublicKey; // The fee vault address
  funder: PublicKey; // The funder address
}
```

**Returns**

A transaction that can be signed and sent to the network.

**Example**

```typescript
const transaction = await client.fundFeeVault({
  fundAmount: new BN(1000000),
  feeVault: new PublicKey("user1234567890abcdefghijklmnopqrstuvwxyz"),
  funder: funder.publicKey,
});
```

**Notes**

- The `funder` is required to sign the transaction.

---

### fundByDammV2ClaimFee

Funds the fee vault by claiming fee from a DAMM v2 pool.

**Function**

```typescript
async fundByDammV2ClaimFee(fundByDammV2ClaimFeeParam: FundByDammV2ClaimFeeParam): Promise<Transaction>
```

**Parameters**

```typescript
interface FundByDammV2ClaimFeeParam {
  owner: PublicKey; // The owner of the fee vault
  feeVault: PublicKey; // The fee vault address
  tokenVault: PublicKey; // The token vault address
  dammV2Pool: PublicKey; // The DAMM v2 pool address
  position: PublicKey; // The position address
  positionNftAccount: PublicKey; // The position NFT account address
}
```

**Returns**

A transaction that can be signed and sent to the network.

**Example**

```typescript
const feeVault = new PublicKey("user1234567890abcdefghijklmnopqrstuvwxyz");
const tokenVault = deriveTokenVaultAddress(feeVault);

const positionNftAccount = new PublicKey(
  "positionNftAccount1234567890abcdefghijklmnopqrstuvwxyz"
);

// If you have not set the owner of the position NFT account to the fee vault, you can use the following function to set it.
const setTokenAccountOwnerTx = setTokenAccountOwnerTx(
  positionNftAccount,
  owner.publicKey,
  feeVault,
  TOKEN_2022_PROGRAM_ID
);

const transaction = await client.fundByDammV2ClaimFee({
  owner: owner.publicKey,
  feeVault,
  tokenVault,
  dammV2Pool: new PublicKey("dammv2Pool1234567890abcdefghijklmnopqrstuvwxyz"),
  position: new PublicKey("position1234567890abcdefghijklmnopqrstuvwxyz"),
  positionNftAccount,
});
```

**Notes**

- The `owner` is required to sign the transaction.
- If you have not set the owner of the position NFT account to the fee vault, you can use the following function to set it.
  - `setTokenAccountOwnerTx`

---

### fundByDbcClaimCreatorTradingFee

Funds the fee vault by claiming creator trading fee from a DBC pool.

**Function**

```typescript
async fundByDbcClaimCreatorTradingFee(fundByDbcClaimCreatorTradingFeeParam: FundByDbcClaimCreatorTradingFeeParam): Promise<Transaction>
```

**Parameters**

```typescript
interface FundByDbcClaimCreatorTradingFeeParam {
  creator: PublicKey; // The creator of the fee vault
  feeVault: PublicKey; // The fee vault address
  tokenVault: PublicKey; // The token vault address
  dbcConfig: PublicKey; // The DBC config address
  dbcPool: PublicKey; // The DBC pool address
}
```

**Returns**

A transaction that can be signed and sent to the network.

**Example**

```typescript
const feeVault = new PublicKey("user1234567890abcdefghijklmnopqrstuvwxyz");
const tokenVault = deriveTokenVaultAddress(feeVault);

const transaction = await client.fundByDbcClaimCreatorTradingFee({
  creator: creator.publicKey,
  feeVault,
  tokenVault,
  dbcConfig: new PublicKey("dbcConfig1234567890abcdefghijklmnopqrstuvwxyz"),
  dbcPool: new PublicKey("dbcPool1234567890abcdefghijklmnopqrstuvwxyz"),
});
```

**Notes**

- The transaction fee payer is required to sign the transaction.
- You will need to ensure that the DBC pool creator is the fee vault address. If it is not, you can use the `transferPoolCreator` endpoint in the DBC SDK to transfer the creator to the fee vault address. This would require the existing `creator` to sign the transaction.

---

### fundByDbcClaimPartnerTradingFee

Funds the fee vault by claiming partner trading fee from a DBC pool.

**Function**

```typescript
async fundByDbcClaimPartnerTradingFee(fundByDbcClaimPartnerTradingFeeParam: FundByDbcClaimPartnerTradingFeeParam): Promise<Transaction>
```

**Parameters**

```typescript
interface FundByDbcClaimPartnerTradingFeeParam {
  feeClaimer: PublicKey; // The fee claimer of the fee vault
  feeVault: PublicKey; // The fee vault address
  tokenVault: PublicKey; // The token vault address
  dbcConfig: PublicKey; // The DBC config address
  dbcPool: PublicKey; // The DBC pool address
}
```

**Returns**

A transaction that can be signed and sent to the network.

**Example**

```typescript
const feeVault = new PublicKey("user1234567890abcdefghijklmnopqrstuvwxyz");
const tokenVault = deriveTokenVaultAddress(feeVault);

const transaction = await client.fundByDbcClaimPartnerTradingFee({
  feeClaimer: feeClaimer.publicKey,
  feeVault,
  tokenVault,
  dbcConfig: new PublicKey("dbcConfig1234567890abcdefghijklmnopqrstuvwxyz"),
  dbcPool: new PublicKey("dbcPool1234567890abcdefghijklmnopqrstuvwxyz"),
});
```

**Notes**

- The transaction fee payer is required to sign the transaction.
- You would need to ensure that the DBC pool config's fee claimer is the fee vault address.

---

### fundByDbcClaimCreatorSurplus

Funds the fee vault by claiming creator surplus from a DBC pool.

**Function**

```typescript
async fundByDbcClaimCreatorSurplus(fundByDbcClaimCreatorSurplusParam: FundByDbcClaimCreatorSurplusParam): Promise<Transaction>
```

**Parameters**

```typescript
interface FundByDbcClaimCreatorSurplusParam {
  feeVault: PublicKey; // The fee vault address
  tokenVault: PublicKey; // The token vault address
  dbcConfig: PublicKey; // The DBC config address
  dbcPool: PublicKey; // The DBC pool address
}
```

**Returns**

A transaction that can be signed and sent to the network.

**Example**

```typescript
const feeVault = new PublicKey("user1234567890abcdefghijklmnopqrstuvwxyz");
const tokenVault = deriveTokenVaultAddress(feeVault);

const transaction = await client.fundByDbcClaimCreatorSurplus({
  feeVault,
  tokenVault,
  dbcConfig: new PublicKey("dbcConfig1234567890abcdefghijklmnopqrstuvwxyz"),
  dbcPool: new PublicKey("dbcPool1234567890abcdefghijklmnopqrstuvwxyz"),
});
```

**Notes**

- The transaction fee payer is required to sign the transaction.
- You will need to ensure that the DBC pool creator is the fee vault address. If it is not, you can use the `transferPoolCreator` endpoint in the DBC SDK to transfer the creator to the fee vault address.

---

### fundByDbcClaimPartnerSurplus

Funds the fee vault by claiming partner surplus from a DBC pool.

**Function**

```typescript
async fundByDbcClaimPartnerSurplus(fundByDbcClaimPartnerSurplusParam: FundByDbcClaimPartnerSurplusParam): Promise<Transaction>
```

**Parameters**

```typescript
interface FundByDbcClaimPartnerSurplusParam {
  feeVault: PublicKey; // The fee vault address
  tokenVault: PublicKey; // The token vault address
  dbcConfig: PublicKey; // The DBC config address
  dbcPool: PublicKey; // The DBC pool address
}
```

**Returns**

A transaction that can be signed and sent to the network.

**Example**

```typescript
const feeVault = new PublicKey("user1234567890abcdefghijklmnopqrstuvwxyz");
const tokenVault = deriveTokenVaultAddress(feeVault);

const transaction = await client.fundByDbcClaimPartnerSurplus({
  feeVault,
  tokenVault,
  dbcConfig: new PublicKey("dbcConfig1234567890abcdefghijklmnopqrstuvwxyz"),
  dbcPool: new PublicKey("dbcPool1234567890abcdefghijklmnopqrstuvwxyz"),
});
```

**Notes**

- The transaction fee payer is required to sign the transaction.
- You would need to ensure that the DBC pool config's fee claimer is the fee vault address.

---

### claimUserFee

Claims the fee for the user.

**Function**

```typescript
async claimUserFee(claimUserFeeParam: ClaimUserFeeParam): Promise<Transaction>
```

**Parameters**

```typescript
interface ClaimUserFeeParam {
  feeVault: PublicKey; // The fee vault address
  user: PublicKey; // The user address
  payer: PublicKey; // The wallet that will pay for the transaction
}
```

**Returns**

A transaction that can be signed and sent to the network.

**Example**

```typescript
const transaction = await client.claimUserFee({
  feeVault: new PublicKey("user1234567890abcdefghijklmnopqrstuvwxyz"),
  user: user.publicKey,
  payer: payer.publicKey,
});
```

**Notes**

- The `payer` and `user` is required to sign the transaction.

---

## State Functions

### getFeeVault

Get the fee vault state.

**Function**

```typescript
async getFeeVault(feeVault: PublicKey): Promise<FeeVault>
```

**Parameters**

```typescript
feeVault: PublicKey;
```

**Returns**

A transaction that can be signed and sent to the network.

**Example**

```typescript
const feeVault = await client.getFeeVault(
  new PublicKey("vault1234567890abcdefghijklmnopqrstuvwxyz")
});
```

**Notes**

- This function returns the fee vault state.

---

## Helper Functions

### deriveFeeVaultPdaAddress

Derive the fee vault PDA address.

**Function**

```typescript
deriveFeeVaultPdaAddress(base: PublicKey, tokenMint: PublicKey): PublicKey
```

**Parameters**

```typescript
base: PublicKey;
tokenMint: PublicKey;
```

**Returns**

A PDA address.

**Example**

```typescript
const feeVaultPda = deriveFeeVaultPdaAddress(
  new PublicKey("base1234567890abcdefghijklmnopqrstuvwxyz"),
  new PublicKey("tokenMint1234567890abcdefghijklmnopqrstuvwxyz")
);
```

**Notes**

- This function returns the PDA address of the fee vault.

---

### convertToLamportsBN

Convert to lamports in BN type.

**Function**

```typescript
convertToLamportsBN(amount: number | string, tokenDecimal: number): BN
```

**Parameters**

```typescript
amount: number | string;
tokenDecimal: number;
```

**Returns**

A token amount in BN type.

**Example**

```typescript
const fundAmount = convertToLamportsBN(1, 9);
```

**Notes**

- This function returns the lamports in BN type.
