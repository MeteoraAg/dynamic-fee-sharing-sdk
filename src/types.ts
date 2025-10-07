import { IdlAccounts, IdlTypes, Program } from "@coral-xyz/anchor";
import { DynamicFeeSharing } from "./idl/idl";
import { PublicKey } from "@solana/web3.js";
import BN from "bn.js";

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
  feeVault: PublicKey;
  funder: PublicKey;
};

export type FundByDammV2ClaimFeeParams = {
  owner: PublicKey;
  feeVault: PublicKey;
  tokenVault: PublicKey;
  dammV2Pool: PublicKey;
  position: PublicKey;
  positionNftAccount: PublicKey;
};

export type FundByDbcClaimCreatorTradingFeeParams = {
  creator: PublicKey;
  feeVault: PublicKey;
  tokenVault: PublicKey;
  dbcConfig: PublicKey;
  dbcPool: PublicKey;
};

export type FundByDbcClaimPartnerTradingFeeParams = {
  feeClaimer: PublicKey;
  feeVault: PublicKey;
  tokenVault: PublicKey;
  dbcConfig: PublicKey;
  dbcPool: PublicKey;
};

export type FundByDbcClaimCreatorSurplusParams = {
  feeVault: PublicKey;
  tokenVault: PublicKey;
  dbcConfig: PublicKey;
  dbcPool: PublicKey;
};

export type FundByDbcClaimPartnerSurplusParams =
  FundByDbcClaimCreatorSurplusParams;

export type ClaimUserFeeParams = {
  feeVault: PublicKey;
  user: PublicKey;
  payer: PublicKey;
};

export enum TokenType {
  SPL = 0,
  Token2022 = 1,
}
