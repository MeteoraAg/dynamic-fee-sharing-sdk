# Changelog

All notable changes to the Dynamic Fee Sharing SDK will be documented in this file.

## [1.0.1] - 2025-07-22

### Added

- `convertToLamportsBN` function to convert amount to lamports in BN type.

### Breaking Changes

- `createFeeVault` function now accepts number type for share amount instead of the previous BN type.
- `createFeeVaultPda` function now accepts number type for share amount instead of the previous BN type.
