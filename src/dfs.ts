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
import {
  createDfsProgram,
  getOrCreateATAInstruction,
  getTokenProgram,
  getAccountData,
  deriveFeeVaultPdaAddress,
  deriveFeeVaultAuthorityAddress,
  deriveTokenVaultAddress,
  wrapSOLInstruction,
  unwrapSOLInstruction,
} from "./helpers";
import { NATIVE_MINT } from "@solana/spl-token";

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
    const { feeVault, tokenMint, tokenProgram, owner, payer, userShare } =
      createFeeVaultParams;

    const params: InitializeFeeVaultParameters = {
      padding: [],
      users: userShare.map((share) => ({
        address: share.address,
        share: share.share,
      })),
    };

    const tokenVault = deriveTokenVaultAddress(feeVault);

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
    const { base, tokenMint, tokenProgram, owner, payer, userShare } =
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

    const tokenProgram = getTokenProgram(feeVaultState.tokenFlag);

    const preInstructions = [];

    const { ataPubkey: fundTokenVault, ix: preInstruction } =
      await getOrCreateATAInstruction(
        this.program.provider.connection,
        tokenMint,
        funder,
        funder,
        true,
        tokenProgram
      );

    if (preInstruction) {
      preInstructions.push(preInstruction);
    }

    // If token is WSOL, wrap SOL before funding
    if (tokenMint.equals(NATIVE_MINT)) {
      const wrapInstructions = wrapSOLInstruction(
        funder,
        fundTokenVault,
        BigInt(fundAmount.toString())
      );
      preInstructions.push(...wrapInstructions);
    }

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
      .preInstructions(preInstructions)
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

    // Check if user exists in the fee vault
    if (userShareIndex === -1) {
      throw new Error("InvalidUserAddress: User not found in fee vault");
    }

    const tokenProgram = getTokenProgram(feeVaultState.tokenFlag);

    const preInstructions = [];
    const postInstructions = [];

    const { ataPubkey: userTokenVault, ix: preInstruction } =
      await getOrCreateATAInstruction(
        this.program.provider.connection,
        tokenMint,
        user,
        payer,
        true,
        tokenProgram
      );

    if (preInstruction) {
      preInstructions.push(preInstruction);
    }

    if (tokenMint.equals(NATIVE_MINT)) {
      const unwrapInstruction = unwrapSOLInstruction(user, user, true);
      if (unwrapInstruction) {
        postInstructions.push(unwrapInstruction);
      }
    }

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
      .preInstructions(preInstructions)
      .postInstructions(postInstructions)
      .transaction();
  }
}
