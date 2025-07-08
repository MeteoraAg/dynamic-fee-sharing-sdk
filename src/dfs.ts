import {
  Commitment,
  Connection,
  PublicKey,
  Transaction,
} from "@solana/web3.js";
import {
  DynamicFeeSharingProgram,
  FeeVault,
  InitializeFeeVaultParameters,
  CreateFeeVaultParams,
  FundFeeVaultParams,
  ClaimUserFeeParams,
  CreateFeeVaultPdaParams,
} from "./types";
import { createDfsProgram } from "./helpers/createProgram";
import { getOrCreateATAInstruction, getTokenProgram } from "./helpers/token";
import { getAccountData } from "./helpers/common";
import {
  deriveFeeVaultPdaAddress,
  deriveFeeVaultAuthorityAddress,
  deriveTokenVaultAddress,
} from "./helpers/accounts";
import { getAssociatedTokenAddressSync } from "@solana/spl-token";

export class DynamicFeeSharingClient {
  program: DynamicFeeSharingProgram;
  private feeVaultAuthority: PublicKey;
  private commitment: Commitment;
  private connection: Connection;

  constructor(connection: Connection, commitment: Commitment) {
    this.program = createDfsProgram(connection, commitment);
    this.feeVaultAuthority = deriveFeeVaultAuthorityAddress();
    this.connection = connection;
    this.commitment = commitment;
  }

  /**
   * Get the fee vault state
   * @param feeVault - The fee vault address
   * @returns The fee vault state
   */
  async getFeeVault(feeVault: PublicKey): Promise<FeeVault> {
    return getAccountData(feeVault, "feeVault", this.program);
  }

  /**
   * Create a fee vault
   * @param createFeeVaultParams - The parameters for creating a fee vault
   * @returns The transaction to create a fee vault
   */
  async createFeeVault(
    createFeeVaultParams: CreateFeeVaultParams
  ): Promise<Transaction> {
    const { feeVault, tokenMint, owner, payer, userShare } =
      createFeeVaultParams;

    const params: InitializeFeeVaultParameters = {
      padding: [],
      users: userShare.map((share) => ({
        address: share.address,
        share: share.share,
      })),
    };

    const tokenVault = deriveTokenVaultAddress(feeVault);

    const tokenProgram = await getTokenProgram(tokenMint, this.connection);

    return this.program.methods
      .initializeFeeVault(params)
      .accountsPartial({
        feeVault,
        feeVaultAuthority: this.feeVaultAuthority,
        tokenVault,
        tokenMint,
        owner,
        payer,
        tokenProgram,
      })
      .transaction();
  }

  /**
   * Create a fee vault PDA
   * @param createFeeVaultPdaParams - The parameters for creating a fee vault PDA
   * @returns The transaction to create a fee vault PDA
   */
  async createFeeVaultPda(
    createFeeVaultPdaParams: CreateFeeVaultPdaParams
  ): Promise<Transaction> {
    const { base, tokenMint, owner, payer, userShare } =
      createFeeVaultPdaParams;

    const params: InitializeFeeVaultParameters = {
      padding: [],
      users: userShare.map((share) => ({
        address: share.address,
        share: share.share,
      })),
    };

    const feeVault = deriveFeeVaultPdaAddress(base, tokenMint);
    const tokenVault = deriveTokenVaultAddress(feeVault);

    const tokenProgram = await getTokenProgram(tokenMint, this.connection);

    return this.program.methods
      .initializeFeeVaultPda(params)
      .accountsPartial({
        feeVault,
        base,
        feeVaultAuthority: this.feeVaultAuthority,
        tokenVault,
        tokenMint,
        owner,
        payer,
        tokenProgram,
      })
      .transaction();
  }

  /**
   * Fund a fee vault
   * @param fundFeeVaultParams - The parameters for funding a fee vault
   * @returns The transaction to fund a fee vault
   */
  async fundFeeVault(
    fundFeeVaultParams: FundFeeVaultParams
  ): Promise<Transaction> {
    const { fundAmount, feeVault, funder } = fundFeeVaultParams;

    const feeVaultState = await this.getFeeVault(feeVault);
    const tokenVault = feeVaultState.tokenVault;
    const tokenMint = feeVaultState.tokenMint;

    const fundTokenVault = getAssociatedTokenAddressSync(tokenMint, funder);

    const tokenProgram = await getTokenProgram(tokenMint, this.connection);

    return this.program.methods
      .fundFee(fundAmount)
      .accountsPartial({
        feeVault,
        tokenVault,
        tokenMint,
        fundTokenVault,
        funder,
        tokenProgram,
      })
      .transaction();
  }

  /**
   * Claim user fee
   * @param claimUserFeeParams - The parameters for claiming user fee
   * @returns The transaction to claim user fee
   */
  async claimUserFee(
    claimUserFeeParams: ClaimUserFeeParams
  ): Promise<Transaction> {
    const { feeVault, user, payer } = claimUserFeeParams;

    const feeVaultState = await this.getFeeVault(feeVault);
    const tokenVault = feeVaultState.tokenVault;
    const tokenMint = feeVaultState.tokenMint;

    const userShareIndex = feeVaultState.users.findIndex((share) =>
      share.address.equals(user)
    );

    const tokenProgram = await getTokenProgram(tokenMint, this.connection);

    const { ataPubkey: userTokenVault, ix: preInstruction } =
      await getOrCreateATAInstruction(
        this.program.provider.connection,
        tokenMint,
        user,
        payer,
        true,
        tokenProgram
      );

    return this.program.methods
      .claimFee(userShareIndex)
      .accountsPartial({
        feeVault,
        tokenVault,
        tokenMint,
        userTokenVault,
        user,
        tokenProgram,
      })
      .preInstructions([preInstruction])
      .transaction();
  }
}
