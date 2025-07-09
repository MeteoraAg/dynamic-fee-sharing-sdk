# Meteora Dynamic Bonding Curve SDK

A Typescript SDK for interacting with the Dynamic Fee Sharing Program on Meteora.

## Overview

This SDK provides a set of tools and methods to interact with the Meteora Dynamic Fee Sharing Program. It enables developers to dynamically fee share.

## Installation

```bash
npm install @meteora-ag/dynamic-fee-sharing-sdk
# or
pnpm install @meteora-ag/dynamic-fee-sharing-sdk
# or
yarn add @meteora-ag/dynamic-fee-sharing-sdk
```

## Initialization

```typescript
import { Connection } from "@solana/web3.js";
import { DynamicFeeSharingClient } from "@meteora-ag/dynamic-fee-sharing-sdk";

const connection = new Connection("https://api.mainnet-beta.solana.com");
const client = new DynamicFeeSharingClient(connection, "confirmed");
```

## Usage

Refer to the [docs](./docs.md) for how to use the functions.

## Flow

The generic flow of how Dynamic Fee Sharing works is as follows:

1. Create a fee vault or a fee vault PDA.
   - This process will also need to establish the `UserShare` for each user.
2. Fund the fee vault.
3. Users can claim the fee from the fee vault.

## Test

```bash
bun install
bun test
```

## Program Address

- Mainnet-beta: `dfsdo2UqvwfN8DuUVrMRNfQe11VaiNoKcMqLHVvDPzh`
- Devnet: `dfsdo2UqvwfN8DuUVrMRNfQe11VaiNoKcMqLHVvDPzh`
