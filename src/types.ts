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

export type ClaimUserFeeParams = {
  feeVault: PublicKey;
  user: PublicKey;
  payer: PublicKey;
};

export enum TokenType {
  SPL = 0,
  Token2022 = 1,
}
