# Changelog

All notable changes to the Dynamic Fee Sharing SDK will be documented in this file.

## [1.0.7] - 2026-06-24

### Added

- Added `getRecipientDfsVault` function to get all DFS fee vault addresses that a recipient is a part of.

## [1.0.6] - 2026-01-22

### Added

- Added `claimUserFee2` function to claim user fee with receiver address. (receiver does not need to sign)

## [1.0.5] - 2025-10-27

### Added

- Added `getFeeBreakdown` function to get the fee breakdown in the fee vault.

## [1.0.4] - 2025-10-18

### Changed

- Bumped DAMM v2 SDK version and updated IDL usage

## [1.0.3] - 2025-10-16

### Added

- `fundByClaimDammV2Fee` function to fund a fee vault by claiming fee from a DAMM v2 pool.
- `fundByClaimDammV2Reward` function to fund a fee vault by claiming reward from a DAMM v2 pool.
- `fundByClaimDbcCreatorTradingFee` function to fund a fee vault by claiming creator trading fee from a DBC pool.
- `fundByClaimDbcPartnerTradingFee` function to fund a fee vault by claiming partner trading fee from a DBC pool.
- `fundByWithdrawDbcCreatorSurplus` function to fund a fee vault by withdrawing creator surplus from a DBC pool.
- `fundByWithdrawDbcPartnerSurplus` function to fund a fee vault by withdrawing partner surplus from a DBC pool.
- `fundByWithdrawMigrationFee` function to fund a fee vault by withdrawing migration fee from a DBC pool.

## [1.0.1] - 2025-07-22

### Added

- `convertToLamportsBN` function to convert amount to lamports in BN type.

### Breaking Changes

- `createFeeVault` function now accepts number type for share amount instead of the previous BN type.
- `createFeeVaultPda` function now accepts number type for share amount instead of the previous BN type.
