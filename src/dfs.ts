import {
  Commitment,
  Connection,
  PublicKey,
  Transaction,
  TransactionInstruction,
} from "@solana/web3.js";
import {
  DynamicFeeSharingProgram,
  FeeVault,
  InitializeFeeVaultParameters,
  CreateFeeVaultParams,
  FundFeeVaultParams,
  ClaimUserFeeParams,
  CreateFeeVaultPdaParams,
  FundByDammV2ClaimFeeParams,
  FundByDbcClaimCreatorTradingFeeParams,
  FundByDbcClaimPartnerTradingFeeParams,
  FundByDbcClaimCreatorSurplusParams,
  FundByDbcClaimPartnerSurplusParams,
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
  deriveDammV2EventAuthorityAddress,
} from "./helpers";
import { getAssociatedTokenAddressSync, NATIVE_MINT } from "@solana/spl-token";
import { CpAmm, derivePoolAuthority } from "@meteora-ag/cp-amm-sdk";
import { DAMM_V2_PROGRAM_ID, DBC_PROGRAM_ID } from "./constants";
import {
  deriveDbcEventAuthority,
  deriveDbcPoolAuthority,
  DynamicBondingCurveClient,
} from "@meteora-ag/dynamic-bonding-curve-sdk";

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
  async createFeeVault(params: CreateFeeVaultParams): Promise<Transaction> {
    const { feeVault, tokenMint, tokenProgram, owner, payer, userShare } =
      params;

    const initializeFeeVaultParams: InitializeFeeVaultParameters = {
      padding: [],
      users: userShare.map((share) => ({
        address: share.address,
        share: share.share,
      })),
    };

    const tokenVault = deriveTokenVaultAddress(feeVault);

    return this.program.methods
      .initializeFeeVault(initializeFeeVaultParams)
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
    params: CreateFeeVaultPdaParams
  ): Promise<Transaction> {
    const { base, tokenMint, tokenProgram, owner, payer, userShare } = params;

    const initializeFeeVaultParams: InitializeFeeVaultParameters = {
      padding: [],
      users: userShare.map((share) => ({
        address: share.address,
        share: share.share,
      })),
    };

    const feeVault = deriveFeeVaultPdaAddress(base, tokenMint);
    const tokenVault = deriveTokenVaultAddress(feeVault);

    return this.program.methods
      .initializeFeeVaultPda(initializeFeeVaultParams)
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
  async fundFeeVault(params: FundFeeVaultParams): Promise<Transaction> {
    const { fundAmount, feeVault, funder } = params;

    const feeVaultState = await this.getFeeVault(feeVault);
    const tokenVault = feeVaultState.tokenVault;
    const tokenMint = feeVaultState.tokenMint;

    const tokenProgram = getTokenProgram(feeVaultState.tokenFlag);

    const preInstructions = [];

    const { ataPubkey: fundTokenVault, ix: preInstruction } =
      await getOrCreateATAInstruction(
        this.connection,
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
   * Fund a fee vault by claiming a fee from a damm v2 pool
   * @param params - The parameters for funding a fee vault by claiming a fee from a damm v2 pool
   * @returns The transaction to fund a fee vault by claiming a fee from a damm v2 pool
   */
  async fundByDammV2ClaimFee(
    params: FundByDammV2ClaimFeeParams
  ): Promise<Transaction> {
    const {
      owner,
      feeVault,
      tokenVault,
      dammV2Pool,
      position,
      positionNftAccount,
    } = params;

    const cpAmmClient = new CpAmm(this.connection);

    const dammV2PoolState = await cpAmmClient.fetchPoolState(dammV2Pool);
    if (!dammV2PoolState) {
      throw new Error("InvalidDammV2Pool: DammV2 pool not found");
    }

    const preInstructions: TransactionInstruction[] = [];
    const { ataPubkey: tokenAAccount, ix: createTokenAAccountIx } =
      await getOrCreateATAInstruction(
        this.connection,
        dammV2PoolState.tokenAMint,
        owner,
        owner,
        true,
        getTokenProgram(dammV2PoolState.tokenAFlag)
      );
    createTokenAAccountIx && preInstructions.push(createTokenAAccountIx);

    return this.program.methods
      .fundingByClaimDammv2Fee()
      .accountsPartial({
        feeVault,
        pool: dammV2Pool,
        position,
        positionNftAccount,
        tokenAAccount,
        tokenBAccount: tokenVault,
        tokenAVault: dammV2PoolState.tokenAVault,
        tokenBVault: dammV2PoolState.tokenBVault,
        tokenAMint: dammV2PoolState.tokenAMint,
        tokenBMint: dammV2PoolState.tokenBMint,
        tokenAProgram: getTokenProgram(dammV2PoolState.tokenAFlag),
        tokenBProgram: getTokenProgram(dammV2PoolState.tokenBFlag),
        dammv2EventAuthority: deriveDammV2EventAuthorityAddress(),
        dammv2PoolAuthority: derivePoolAuthority(),
        dammv2Program: DAMM_V2_PROGRAM_ID,
      })
      .preInstructions(preInstructions)
      .transaction();
  }

  /**
   * Fund a fee vault by claiming a fee from a dbc creator surplus
   * @param params - The parameters for funding a fee vault by claiming a fee from a dbc creator surplus
   * @returns The transaction to fund a fee vault by claiming a fee from a dbc creator surplus
   */
  async fundByDbcClaimCreatorSurplus(
    params: FundByDbcClaimCreatorSurplusParams
  ) {
    const { feeVault, tokenVault, dbcConfig, dbcPool } = params;

    const dbcClient = new DynamicBondingCurveClient(
      this.connection,
      this.commitment
    );

    const virtualPoolState = await dbcClient.state.getPool(dbcPool);
    if (!virtualPoolState) {
      throw new Error("InvalidDbcPool: Dbc pool not found");
    }

    const configState = await dbcClient.state.getPoolConfig(dbcConfig);
    if (!configState) {
      throw new Error("InvalidDbcConfig: Dbc config not found");
    }

    return this.program.methods
      .fundingByClaimDbcCreatorSurplus()
      .accountsPartial({
        feeVault,
        config: dbcConfig,
        pool: dbcPool,
        tokenQuoteAccount: tokenVault,
        quoteVault: virtualPoolState.quoteVault,
        quoteMint: configState.quoteMint,
        tokenBaseProgram: getTokenProgram(configState.tokenType),
        tokenQuoteProgram: getTokenProgram(configState.quoteTokenFlag),
        dbcEventAuthority: deriveDbcEventAuthority(),
        dbcPoolAuthority: deriveDbcPoolAuthority(),
        dbcProgram: DBC_PROGRAM_ID,
      })
      .transaction();
  }

  /**
   * Fund a fee vault by claiming a fee from a dbc partner surplus
   * @param params - The parameters for funding a fee vault by claiming a fee from a dbc partner surplus
   * @returns The transaction to fund a fee vault by claiming a fee from a dbc partner surplus
   */
  async fundByDbcClaimPartnerSurplus(
    params: FundByDbcClaimPartnerSurplusParams
  ) {
    const { feeVault, tokenVault, dbcConfig, dbcPool } = params;

    const dbcClient = new DynamicBondingCurveClient(
      this.connection,
      this.commitment
    );

    const virtualPoolState = await dbcClient.state.getPool(dbcPool);
    if (!virtualPoolState) {
      throw new Error("InvalidDbcPool: Dbc pool not found");
    }

    const configState = await dbcClient.state.getPoolConfig(dbcConfig);
    if (!configState) {
      throw new Error("InvalidDbcConfig: Dbc config not found");
    }

    return this.program.methods
      .fundingByClaimDbcPartnerSurplus()
      .accountsPartial({
        feeVault,
        config: dbcConfig,
        pool: dbcPool,
        tokenQuoteAccount: tokenVault,
        quoteVault: virtualPoolState.quoteVault,
        quoteMint: configState.quoteMint,
        tokenBaseProgram: getTokenProgram(configState.tokenType),
        tokenQuoteProgram: getTokenProgram(configState.quoteTokenFlag),
        dbcEventAuthority: deriveDbcEventAuthority(),
        dbcPoolAuthority: deriveDbcPoolAuthority(),
        dbcProgram: DBC_PROGRAM_ID,
      })
      .transaction();
  }

  /**
   * Fund a fee vault by claiming a fee from a dbc creator trading fee
   * @param params - The parameters for funding a fee vault by claiming a fee from a dbc creator trading fee
   * @returns The transaction to fund a fee vault by claiming a fee from a dbc creator trading fee
   */
  async fundByDbcClaimCreatorTradingFee(
    params: FundByDbcClaimCreatorTradingFeeParams
  ): Promise<Transaction> {
    const { creator, feeVault, tokenVault, dbcConfig, dbcPool } = params;

    const dbcClient = new DynamicBondingCurveClient(
      this.connection,
      this.commitment
    );

    const virtualPoolState = await dbcClient.state.getPool(dbcPool);
    if (!virtualPoolState) {
      throw new Error("InvalidDbcPool: Dbc pool not found");
    }

    const configState = await dbcClient.state.getPoolConfig(dbcConfig);
    if (!configState) {
      throw new Error("InvalidDbcConfig: Dbc config not found");
    }

    const preInstructions: TransactionInstruction[] = [];
    const { ataPubkey: tokenAAccount, ix: createTokenAAccountIx } =
      await getOrCreateATAInstruction(
        this.connection,
        virtualPoolState.baseMint,
        creator,
        creator,
        true,
        getTokenProgram(configState.tokenType)
      );
    createTokenAAccountIx && preInstructions.push(createTokenAAccountIx);

    return this.program.methods
      .fundingByClaimDbcCreatorTradingFee()
      .accountsPartial({
        feeVault,
        config: dbcConfig,
        pool: dbcPool,
        tokenAAccount,
        tokenBAccount: tokenVault,
        baseVault: virtualPoolState.baseVault,
        quoteVault: virtualPoolState.quoteVault,
        baseMint: virtualPoolState.baseMint,
        quoteMint: configState.quoteMint,
        tokenBaseProgram: getTokenProgram(configState.tokenType),
        tokenQuoteProgram: getTokenProgram(configState.quoteTokenFlag),
        dbcEventAuthority: deriveDbcEventAuthority(),
        dbcPoolAuthority: deriveDbcPoolAuthority(),
        dbcProgram: DBC_PROGRAM_ID,
      })
      .preInstructions(preInstructions)
      .transaction();
  }

  /**
   * Fund a fee vault by claiming a fee from a dbc partner trading fee
   * @param params - The parameters for funding a fee vault by claiming a fee from a dbc partner trading fee
   * @returns The transaction to fund a fee vault by claiming a fee from a dbc partner trading fee
   */
  async fundByDbcClaimPartnerTradingFee(
    params: FundByDbcClaimPartnerTradingFeeParams
  ) {
    const { feeClaimer, feeVault, tokenVault, dbcConfig, dbcPool } = params;

    const dbcClient = new DynamicBondingCurveClient(
      this.connection,
      this.commitment
    );

    const virtualPoolState = await dbcClient.state.getPool(dbcPool);
    if (!virtualPoolState) {
      throw new Error("InvalidDbcPool: Dbc pool not found");
    }

    const configState = await dbcClient.state.getPoolConfig(dbcConfig);
    if (!configState) {
      throw new Error("InvalidDbcConfig: Dbc config not found");
    }

    const preInstructions: TransactionInstruction[] = [];
    const { ataPubkey: tokenAAccount, ix: createTokenAAccountIx } =
      await getOrCreateATAInstruction(
        this.connection,
        virtualPoolState.baseMint,
        feeClaimer,
        feeClaimer,
        true,
        getTokenProgram(configState.tokenType)
      );
    createTokenAAccountIx && preInstructions.push(createTokenAAccountIx);

    return this.program.methods
      .fundingByClaimDbcPartnerTradingFee()
      .accountsPartial({
        feeVault,
        config: dbcConfig,
        pool: dbcPool,
        tokenAAccount,
        tokenBAccount: tokenVault,
        baseVault: virtualPoolState.baseVault,
        quoteVault: virtualPoolState.quoteVault,
        baseMint: virtualPoolState.baseMint,
        quoteMint: configState.quoteMint,
        tokenBaseProgram: getTokenProgram(configState.tokenType),
        tokenQuoteProgram: getTokenProgram(configState.quoteTokenFlag),
        dbcEventAuthority: deriveDbcEventAuthority(),
        dbcPoolAuthority: deriveDbcPoolAuthority(),
        dbcProgram: DBC_PROGRAM_ID,
      })
      .preInstructions(preInstructions)
      .transaction();
  }

  /**
   * Claim user fee
   * @param claimUserFeeParams - The parameters for claiming user fee
   * @returns The transaction to claim user fee
   */
  async claimUserFee(params: ClaimUserFeeParams): Promise<Transaction> {
    const { feeVault, user, payer } = params;

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
        this.connection,
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
