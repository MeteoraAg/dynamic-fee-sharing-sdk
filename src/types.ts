import { IdlAccounts, IdlTypes, Program } from "@coral-xyz/anchor";
import { DynamicFeeSharing } from "./idl/idl";
import {
  AccountMeta,
  PublicKey,
  TransactionInstruction,
} from "@solana/web3.js";
import BN from "bn.js";
import { PoolState } from "@meteora-ag/cp-amm-sdk";
import { PoolConfig, VirtualPool } from "@meteora-ag/dynamic-bonding-curve-sdk";

export type FeeVault = IdlAccounts<DynamicFeeSharing>["feeVault"];

export type InitializeFeeVaultParameters =
  IdlTypes<DynamicFeeSharing>["initializeFeeVaultParameters"];
export type UserShare = IdlTypes<DynamicFeeSharing>["userShare"];

export type DynamicFeeSharingProgram = Program<DynamicFeeSharing>;

export type CreateFeeVaultParams = {
  feeVault: PublicKey;
  tokenMint: PublicKey;
  tokenProgram: PublicKey;
  owner: PublicKey;
  payer: PublicKey;
  userShare: UserShare[];
};

export type CreateFeeVaultPdaParams = {
  base: PublicKey;
  tokenMint: PublicKey;
  tokenProgram: PublicKey;
  owner: PublicKey;
  payer: PublicKey;
  userShare: UserShare[];
};

export type FundFeeVaultParams = {
  fundAmount: BN;
  funder: PublicKey;
  feeVault: PublicKey;
  feeVaultState?: FeeVault;
};

export type FundByClaimingFeeParams = {
  signer: PublicKey;
  feeVault: PublicKey;
  remainingAccounts: AccountMeta[];
  payload: Buffer;
  sourceProgram: PublicKey;
  preInstructions?: TransactionInstruction[];
  postInstructions?: TransactionInstruction[];
};

export type FundByClaimDammV2FeeParams = {
  signer: PublicKey;
  owner: PublicKey;
  feeVault: PublicKey;
  dammV2Position: PublicKey;
  dammV2PositionNftAccount: PublicKey;
  dammV2Pool: PublicKey;
  dammV2PoolState?: PoolState;
};

export type FundByClaimDammV2RewardParams = {
  signer: PublicKey;
  rewardIndex: number;
  feeVault: PublicKey;
  dammV2Position: PublicKey;
  dammV2PositionNftAccount: PublicKey;
  dammV2Pool: PublicKey;
  dammV2PoolState?: PoolState;
};

export type FundByClaimDbcCreatorTradingFeeParams = {
  signer: PublicKey;
  creator: PublicKey;
  feeVault: PublicKey;
  poolConfig: PublicKey;
  virtualPool: PublicKey;
  poolConfigState?: PoolConfig;
  virtualPoolState?: VirtualPool;
};

export type FundByClaimDbcPartnerTradingFeeParams = {
  signer: PublicKey;
  feeClaimer: PublicKey;
  feeVault: PublicKey;
  poolConfig: PublicKey;
  virtualPool: PublicKey;
  poolConfigState?: PoolConfig;
  virtualPoolState?: VirtualPool;
};

export type FundByWithdrawDbcCreatorSurplusParams = {
  signer: PublicKey;
  feeVault: PublicKey;
  poolConfig: PublicKey;
  virtualPool: PublicKey;
  poolConfigState?: PoolConfig;
  virtualPoolState?: VirtualPool;
};

export type FundByWithdrawDbcPartnerSurplusParams =
  FundByWithdrawDbcCreatorSurplusParams;

export type FundByWithdrawDbcMigrationFeeParams = {
  signer: PublicKey;
  isPartner: boolean;
  feeVault: PublicKey;
  poolConfig: PublicKey;
  virtualPool: PublicKey;
  poolConfigState?: PoolConfig;
  virtualPoolState?: VirtualPool;
};

export type ClaimUserFeeParams = {
  feeVault: PublicKey;
  user: PublicKey;
  payer: PublicKey;
};

export enum TokenType {
  SPL = 0,
  Token2022 = 1,
}
