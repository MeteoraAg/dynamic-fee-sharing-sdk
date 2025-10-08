# Changelog

All notable changes to the Dynamic Fee Sharing SDK will be documented in this file.

## [1.0.1] - 2025-07-22

### Added

- `fundByDammV2ClaimFee` function to fund a fee vault by claiming fee from a DAMM v2 pool.
- `fundByDbcClaimCreatorTradingFee` function to fund a fee vault by claiming creator trading fee from a DBC pool.
- `fundByDbcClaimPartnerTradingFee` function to fund a fee vault by claiming partner trading fee from a DBC pool.
- `fundByDbcClaimCreatorSurplus` function to fund a fee vault by claiming creator surplus from a DBC pool.
- `fundByDbcClaimPartnerSurplus` function to fund a fee vault by claiming partner surplus from a DBC pool.
- `setTokenAccountOwnerTx` function to set the owner of a token account for DAMM v2 position NFT.

## [1.0.1] - 2025-07-22

### Added

- `convertToLamportsBN` function to convert amount to lamports in BN type.

### Breaking Changes

- `createFeeVault` function now accepts number type for share amount instead of the previous BN type.
- `createFeeVaultPda` function now accepts number type for share amount instead of the previous BN type.
