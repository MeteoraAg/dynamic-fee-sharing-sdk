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
  CreateFeeVaultPdaParams,
  FundByClaimingFeeParams,
  ClaimUserFeeParams,
  FundByClaimDammV2FeeParams,
  FundByClaimDammV2RewardParams,
  FundByClaimDbcCreatorTradingFeeParams,
  FundByClaimDbcPartnerTradingFeeParams,
  FundByWithdrawDbcCreatorSurplusParams,
  FundByWithdrawDbcPartnerSurplusParams,
  FundByWithdrawMigrationFeeParams,
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
import CpAmmIDL, { CP_AMM_PROGRAM_ID, CpAmm } from "@meteora-ag/cp-amm-sdk";
import {
  deriveDammV2EventAuthority,
  deriveDammV2PoolAuthority,
  deriveDbcEventAuthority,
  deriveDbcPoolAuthority,
  DYNAMIC_BONDING_CURVE_PROGRAM_ID,
  DynamicBondingCurveClient,
  DynamicBondingCurveIdl,
  U64_MAX,
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

  private async fundByClaimingFee(
    params: FundByClaimingFeeParams
  ): Promise<Transaction> {
    const {
      signer,
      feeVault,
      remainingAccounts,
      payload,
      sourceProgram,
      preInstructions,
      postInstructions,
    } = params;
    const tokenVault = deriveTokenVaultAddress(feeVault);

    return this.program.methods
      .fundByClaimingFee(payload)
      .accountsPartial({
        feeVault,
        tokenVault,
        signer,
        sourceProgram,
      })
      .remainingAccounts(remainingAccounts)
      .preInstructions(preInstructions || [])
      .postInstructions(postInstructions || [])
      .transaction();
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

    let { feeVaultState } = params;
    if (!feeVaultState) {
      feeVaultState = await this.getFeeVault(feeVault);
    }
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

    // if token is WSOL, wrap SOL before funding
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
   * Fund a fee vault by claiming fee from a DAMM v2 pool
   * @param params - The parameters for funding a fee vault by claiming fee from a DAMM v2 pool
   * @returns The transaction to fund a fee vault by claiming fee from a DAMM v2 pool
   */
  async fundByClaimDammV2Fee(
    params: FundByClaimDammV2FeeParams
  ): Promise<Transaction> {
    const {
      signer,
      owner,
      feeVault,
      dammV2Pool,
      dammV2Position,
      dammV2PositionNftAccount,
    } = params;

    const tokenVault = deriveTokenVaultAddress(feeVault);

    const cpAmmClient = new CpAmm(this.connection);

    let { dammV2PoolState } = params;
    if (!dammV2PoolState) {
      dammV2PoolState = await cpAmmClient.fetchPoolState(dammV2Pool);
    }

    const preInstructions: TransactionInstruction[] = [];
    const { ataPubkey: tokenAAccount, ix: createTokenAAccountIx } =
      await getOrCreateATAInstruction(
        this.connection,
        dammV2PoolState.tokenAMint,
        owner,
        signer,
        true,
        getTokenProgram(dammV2PoolState.tokenAFlag)
      );

    createTokenAAccountIx && preInstructions.push(createTokenAAccountIx);

    const remainingAccounts = [
      {
        isSigner: false,
        isWritable: false,
        pubkey: deriveDammV2PoolAuthority(),
      },
      {
        isSigner: false,
        isWritable: true,
        pubkey: dammV2Pool,
      },
      {
        isSigner: false,
        isWritable: true,
        pubkey: dammV2Position,
      },
      {
        isSigner: false,
        isWritable: true,
        pubkey: tokenAAccount,
      },
      {
        isSigner: false,
        isWritable: true,
        pubkey: tokenVault,
      },
      {
        isSigner: false,
        isWritable: true,
        pubkey: dammV2PoolState.tokenAVault,
      },
      {
        isSigner: false,
        isWritable: true,
        pubkey: dammV2PoolState.tokenBVault,
      },
      {
        isSigner: false,
        isWritable: true,
        pubkey: dammV2PoolState.tokenAMint,
      },
      {
        isSigner: false,
        isWritable: true,
        pubkey: dammV2PoolState.tokenBMint,
      },
      {
        isSigner: false,
        isWritable: false,
        pubkey: dammV2PositionNftAccount,
      },
      {
        isSigner: false,
        isWritable: false,
        pubkey: feeVault,
      },
      {
        isSigner: false,
        isWritable: false,
        pubkey: getTokenProgram(dammV2PoolState.tokenAFlag),
      },
      {
        isSigner: false,
        isWritable: false,
        pubkey: getTokenProgram(dammV2PoolState.tokenBFlag),
      },
      {
        isSigner: false,
        isWritable: false,
        pubkey: deriveDammV2EventAuthority(),
      },
      {
        isSigner: false,
        isWritable: false,
        pubkey: CP_AMM_PROGRAM_ID,
      },
    ];

    const claimPositionFeeDisc = (CpAmmIDL as any).default.instructions.find(
      (instruction: any) => instruction.name === "claim_position_fee"
    ).discriminator;

    const payload = Buffer.from(claimPositionFeeDisc);

    return this.fundByClaimingFee({
      signer,
      feeVault,
      remainingAccounts,
      payload,
      sourceProgram: CP_AMM_PROGRAM_ID,
      preInstructions,
    });
  }

  /**
   * Fund a fee vault by claiming reward from a DAMM v2 pool
   * @param params - The parameters for funding a fee vault by claiming reward from a DAMM v2 pool
   * @returns The transaction to fund a fee vault by claiming reward from a DAMM v2 pool
   */
  async fundByClaimDammV2Reward(
    params: FundByClaimDammV2RewardParams
  ): Promise<Transaction> {
    const {
      signer,
      rewardIndex,
      feeVault,
      dammV2Pool,
      dammV2Position,
      dammV2PositionNftAccount,
    } = params;

    const tokenVault = deriveTokenVaultAddress(feeVault);

    const cpAmmClient = new CpAmm(this.connection);

    let { dammV2PoolState } = params;
    if (!dammV2PoolState) {
      dammV2PoolState = await cpAmmClient.fetchPoolState(dammV2Pool);
    }

    const remainingAccounts = [
      {
        isSigner: false,
        isWritable: false,
        pubkey: deriveDammV2PoolAuthority(),
      },
      {
        isSigner: false,
        isWritable: true,
        pubkey: dammV2Pool,
      },
      {
        isSigner: false,
        isWritable: true,
        pubkey: dammV2Position,
      },
      {
        isSigner: false,
        isWritable: true,
        pubkey: dammV2PoolState.rewardInfos[rewardIndex].vault,
      },
      {
        isSigner: false,
        isWritable: true,
        pubkey: dammV2PoolState.rewardInfos[rewardIndex].mint,
      },
      {
        isSigner: false,
        isWritable: true,
        pubkey: tokenVault,
      },
      {
        isSigner: false,
        isWritable: true,
        pubkey: dammV2PositionNftAccount,
      },
      {
        isSigner: false,
        isWritable: false,
        pubkey: feeVault,
      },
      {
        isSigner: false,
        isWritable: false,
        pubkey: getTokenProgram(
          dammV2PoolState.rewardInfos[rewardIndex].rewardTokenFlag
        ),
      },
      {
        isSigner: false,
        isWritable: false,
        pubkey: deriveDammV2EventAuthority(),
      },
      {
        isSigner: false,
        isWritable: false,
        pubkey: CP_AMM_PROGRAM_ID,
      },
    ];

    const claimDammV2RewardDisc = (CpAmmIDL as any).default.instructions.find(
      (instruction: any) => instruction.name === "claim_reward"
    ).discriminator;

    const payload = Buffer.concat([
      Buffer.from(claimDammV2RewardDisc),
      Buffer.from([rewardIndex]),
      Buffer.from([1]),
    ]);

    return this.fundByClaimingFee({
      signer,
      feeVault,
      remainingAccounts,
      payload,
      sourceProgram: CP_AMM_PROGRAM_ID,
    });
  }

  /**
   * Fund a fee vault by claiming creator trading fee from a DBC pool
   * @param params - The parameters for funding a fee vault by claiming creator trading fee from a DBC pool
   * @returns The transaction to fund a fee vault by claiming creator trading fee from a DBC pool
   */
  async fundByClaimDbcCreatorTradingFee(
    params: FundByClaimDbcCreatorTradingFeeParams
  ): Promise<Transaction> {
    const { signer, creator, feeVault, poolConfig, virtualPool } = params;

    const tokenVault = deriveTokenVaultAddress(feeVault);

    const dbcClient = new DynamicBondingCurveClient(
      this.connection,
      this.commitment
    );

    let { poolConfigState } = params;
    if (!poolConfigState) {
      poolConfigState = await dbcClient.state.getPoolConfig(poolConfig);
    }

    let { virtualPoolState } = params;
    if (!virtualPoolState) {
      virtualPoolState = await dbcClient.state.getPool(virtualPool);
    }

    const preInstructions: TransactionInstruction[] = [];
    const { ataPubkey: tokenAAccount, ix: createTokenAAccountIx } =
      await getOrCreateATAInstruction(
        this.connection,
        virtualPoolState.baseMint,
        creator,
        signer,
        true,
        getTokenProgram(poolConfigState.tokenType)
      );

    createTokenAAccountIx && preInstructions.push(createTokenAAccountIx);

    const remainingAccounts = [
      {
        isSigner: false,
        isWritable: false,
        pubkey: deriveDbcPoolAuthority(),
      },
      {
        isSigner: false,
        isWritable: true,
        pubkey: virtualPool,
      },
      {
        isSigner: false,
        isWritable: true,
        pubkey: tokenAAccount,
      },
      {
        isSigner: false,
        isWritable: true,
        pubkey: tokenVault,
      },
      {
        isSigner: false,
        isWritable: true,
        pubkey: virtualPoolState.baseVault,
      },
      {
        isSigner: false,
        isWritable: true,
        pubkey: virtualPoolState.quoteVault,
      },
      {
        isSigner: false,
        isWritable: false,
        pubkey: virtualPoolState.baseMint,
      },
      {
        isSigner: false,
        isWritable: false,
        pubkey: poolConfigState.quoteMint,
      },
      {
        isSigner: false,
        isWritable: false,
        pubkey: feeVault,
      },
      {
        isSigner: false,
        isWritable: false,
        pubkey: getTokenProgram(poolConfigState.tokenType),
      },
      {
        isSigner: false,
        isWritable: false,
        pubkey: getTokenProgram(poolConfigState.quoteTokenFlag),
      },
      {
        isSigner: false,
        isWritable: false,
        pubkey: deriveDbcEventAuthority(),
      },
      {
        isSigner: false,
        isWritable: false,
        pubkey: DYNAMIC_BONDING_CURVE_PROGRAM_ID,
      },
    ];

    const claimDbcCreatorTradingFeeDisc =
      DynamicBondingCurveIdl.instructions.find(
        (instruction) => instruction.name === "claim_creator_trading_fee"
      ).discriminator;

    const payload = Buffer.concat([
      Buffer.from(claimDbcCreatorTradingFeeDisc),
      U64_MAX.toBuffer(),
      U64_MAX.toBuffer(),
    ]);

    return this.fundByClaimingFee({
      signer,
      feeVault,
      remainingAccounts,
      payload,
      sourceProgram: DYNAMIC_BONDING_CURVE_PROGRAM_ID,
      preInstructions,
    });
  }

  /**
   * Fund a fee vault by claiming partner trading fee from a DBC pool
   * @param params - The parameters for funding a fee vault by claiming partner trading fee from a DBC pool
   * @returns The transaction to fund a fee vault by claiming partner trading fee from a DBC pool
   */
  async fundByClaimDbcPartnerTradingFee(
    params: FundByClaimDbcPartnerTradingFeeParams
  ): Promise<Transaction> {
    const { signer, feeClaimer, feeVault, poolConfig, virtualPool } = params;

    const tokenVault = deriveTokenVaultAddress(feeVault);

    const dbcClient = new DynamicBondingCurveClient(
      this.connection,
      this.commitment
    );

    let { poolConfigState } = params;
    if (!poolConfigState) {
      poolConfigState = await dbcClient.state.getPoolConfig(poolConfig);
    }

    let { virtualPoolState } = params;
    if (!virtualPoolState) {
      virtualPoolState = await dbcClient.state.getPool(virtualPool);
    }

    const preInstructions: TransactionInstruction[] = [];
    const { ataPubkey: tokenAAccount, ix: createTokenAAccountIx } =
      await getOrCreateATAInstruction(
        this.connection,
        virtualPoolState.baseMint,
        feeClaimer,
        signer,
        true,
        getTokenProgram(poolConfigState.tokenType)
      );

    createTokenAAccountIx && preInstructions.push(createTokenAAccountIx);

    const remainingAccounts = [
      {
        isSigner: false,
        isWritable: false,
        pubkey: deriveDbcPoolAuthority(),
      },
      {
        isSigner: false,
        isWritable: true,
        pubkey: poolConfig,
      },
      {
        isSigner: false,
        isWritable: true,
        pubkey: virtualPool,
      },
      {
        isSigner: false,
        isWritable: true,
        pubkey: tokenAAccount,
      },
      {
        isSigner: false,
        isWritable: true,
        pubkey: tokenVault,
      },
      {
        isSigner: false,
        isWritable: true,
        pubkey: virtualPoolState.baseVault,
      },
      {
        isSigner: false,
        isWritable: true,
        pubkey: virtualPoolState.quoteVault,
      },
      {
        isSigner: false,
        isWritable: false,
        pubkey: virtualPoolState.baseMint,
      },
      {
        isSigner: false,
        isWritable: false,
        pubkey: poolConfigState.quoteMint,
      },

      {
        isSigner: false,
        isWritable: true,
        pubkey: feeVault,
      },
      {
        isSigner: false,
        isWritable: false,
        pubkey: getTokenProgram(poolConfigState.tokenType),
      },
      {
        isSigner: false,
        isWritable: false,
        pubkey: getTokenProgram(poolConfigState.quoteTokenFlag),
      },
      {
        isSigner: false,
        isWritable: false,
        pubkey: deriveDbcEventAuthority(),
      },
      {
        isSigner: false,
        isWritable: false,
        pubkey: DYNAMIC_BONDING_CURVE_PROGRAM_ID,
      },
    ];

    const claimDbcPartnerTradingFeeDisc =
      DynamicBondingCurveIdl.instructions.find(
        (instruction) => instruction.name === "claim_trading_fee"
      ).discriminator;

    const payload = Buffer.concat([
      Buffer.from(claimDbcPartnerTradingFeeDisc),
      U64_MAX.toBuffer(),
      U64_MAX.toBuffer(),
    ]);

    return this.fundByClaimingFee({
      signer,
      feeVault,
      remainingAccounts,
      payload,
      sourceProgram: DYNAMIC_BONDING_CURVE_PROGRAM_ID,
      preInstructions,
    });
  }

  /**
   * Fund a fee vault by claiming partner trading fee from a DBC pool
   * @param params - The parameters for funding a fee vault by claiming partner trading fee from a DBC pool
   * @returns The transaction to fund a fee vault by claiming partner trading fee from a DBC pool
   */
  async fundByWithdrawDbcCreatorSurplus(
    params: FundByWithdrawDbcCreatorSurplusParams
  ): Promise<Transaction> {
    const { signer, feeVault, poolConfig, virtualPool } = params;

    const tokenVault = deriveTokenVaultAddress(feeVault);

    const dbcClient = new DynamicBondingCurveClient(
      this.connection,
      this.commitment
    );

    let { poolConfigState } = params;
    if (!poolConfigState) {
      poolConfigState = await dbcClient.state.getPoolConfig(poolConfig);
    }

    let { virtualPoolState } = params;
    if (!virtualPoolState) {
      virtualPoolState = await dbcClient.state.getPool(virtualPool);
    }

    const remainingAccounts = [
      {
        isSigner: false,
        isWritable: false,
        pubkey: deriveDbcPoolAuthority(),
      },
      {
        isSigner: false,
        isWritable: true,
        pubkey: poolConfig,
      },
      {
        isSigner: false,
        isWritable: true,
        pubkey: virtualPool,
      },
      {
        isSigner: false,
        isWritable: true,
        pubkey: tokenVault,
      },
      {
        isSigner: false,
        isWritable: true,
        pubkey: virtualPoolState.quoteVault,
      },
      {
        isSigner: false,
        isWritable: false,
        pubkey: poolConfigState.quoteMint,
      },
      {
        isSigner: false,
        isWritable: true,
        pubkey: feeVault,
      },
      {
        isSigner: false,
        isWritable: false,
        pubkey: getTokenProgram(poolConfigState.quoteTokenFlag),
      },
      {
        isSigner: false,
        isWritable: false,
        pubkey: deriveDbcEventAuthority(),
      },
      {
        isSigner: false,
        isWritable: false,
        pubkey: DYNAMIC_BONDING_CURVE_PROGRAM_ID,
      },
    ];

    const creatorWithdrawSurplusDisc = DynamicBondingCurveIdl.instructions.find(
      (instruction) => instruction.name === "creator_withdraw_surplus"
    ).discriminator;

    const payload = Buffer.from(creatorWithdrawSurplusDisc);

    return this.fundByClaimingFee({
      signer,
      feeVault,
      remainingAccounts,
      payload,
      sourceProgram: DYNAMIC_BONDING_CURVE_PROGRAM_ID,
    });
  }

  /**
   * Fund a fee vault by claiming partner surplus from a DBC pool
   * @param params - The parameters for funding a fee vault by claiming partner surplus from a DBC pool
   * @returns The transaction to fund a fee vault by claiming partner surplus from a DBC pool
   */
  async fundByWithdrawDbcPartnerSurplus(
    params: FundByWithdrawDbcPartnerSurplusParams
  ): Promise<Transaction> {
    const { signer, feeVault, poolConfig, virtualPool } = params;

    const tokenVault = deriveTokenVaultAddress(feeVault);

    const dbcClient = new DynamicBondingCurveClient(
      this.connection,
      this.commitment
    );

    let { poolConfigState } = params;
    if (!poolConfigState) {
      poolConfigState = await dbcClient.state.getPoolConfig(poolConfig);
    }

    let { virtualPoolState } = params;
    if (!virtualPoolState) {
      virtualPoolState = await dbcClient.state.getPool(virtualPool);
    }

    const remainingAccounts = [
      {
        isSigner: false,
        isWritable: false,
        pubkey: deriveDbcPoolAuthority(),
      },
      {
        isSigner: false,
        isWritable: true,
        pubkey: poolConfig,
      },
      {
        isSigner: false,
        isWritable: true,
        pubkey: virtualPool,
      },
      {
        isSigner: false,
        isWritable: true,
        pubkey: tokenVault,
      },
      {
        isSigner: false,
        isWritable: true,
        pubkey: virtualPoolState.quoteVault,
      },
      {
        isSigner: false,
        isWritable: false,
        pubkey: poolConfigState.quoteMint,
      },
      {
        isSigner: false,
        isWritable: true,
        pubkey: feeVault,
      },
      {
        isSigner: false,
        isWritable: false,
        pubkey: getTokenProgram(poolConfigState.quoteTokenFlag),
      },
      {
        isSigner: false,
        isWritable: false,
        pubkey: deriveDbcEventAuthority(),
      },
      {
        isSigner: false,
        isWritable: false,
        pubkey: DYNAMIC_BONDING_CURVE_PROGRAM_ID,
      },
    ];

    const partnerWithdrawSurplusDisc = DynamicBondingCurveIdl.instructions.find(
      (instruction) => instruction.name === "partner_withdraw_surplus"
    ).discriminator;

    const payload = Buffer.from(partnerWithdrawSurplusDisc);

    return this.fundByClaimingFee({
      signer,
      feeVault,
      remainingAccounts,
      payload,
      sourceProgram: DYNAMIC_BONDING_CURVE_PROGRAM_ID,
    });
  }

  /**
   * Fund a fee vault by claiming migration fee from a DBC pool
   * @param params - The parameters for funding a fee vault by claiming migration fee from a DBC pool
   * @returns The transaction to fund a fee vault by claiming migration fee from a DBC pool
   */
  async fundByWithdrawMigrationFee(
    params: FundByWithdrawMigrationFeeParams
  ): Promise<Transaction> {
    const { signer, isPartner, feeVault, poolConfig, virtualPool } = params;

    // 0 as partner and 1 as creator
    const hasPartner = isPartner ? 0 : 1;

    const tokenVault = deriveTokenVaultAddress(feeVault);

    const dbcClient = new DynamicBondingCurveClient(
      this.connection,
      this.commitment
    );

    let { poolConfigState } = params;
    if (!poolConfigState) {
      poolConfigState = await dbcClient.state.getPoolConfig(poolConfig);
    }

    let { virtualPoolState } = params;
    if (!virtualPoolState) {
      virtualPoolState = await dbcClient.state.getPool(virtualPool);
    }

    const remainingAccounts = [
      {
        isSigner: false,
        isWritable: false,
        pubkey: deriveDbcPoolAuthority(),
      },
      {
        isSigner: false,
        isWritable: true,
        pubkey: poolConfig,
      },
      {
        isSigner: false,
        isWritable: true,
        pubkey: virtualPool,
      },
      {
        isSigner: false,
        isWritable: true,
        pubkey: tokenVault,
      },
      {
        isSigner: false,
        isWritable: true,
        pubkey: virtualPoolState.quoteVault,
      },
      {
        isSigner: false,
        isWritable: false,
        pubkey: poolConfigState.quoteMint,
      },
      {
        isSigner: false,
        isWritable: true,
        pubkey: feeVault,
      },
      {
        isSigner: false,
        isWritable: false,
        pubkey: getTokenProgram(poolConfigState.quoteTokenFlag),
      },
      {
        isSigner: false,
        isWritable: false,
        pubkey: deriveDbcEventAuthority(),
      },
      {
        isSigner: false,
        isWritable: false,
        pubkey: DYNAMIC_BONDING_CURVE_PROGRAM_ID,
      },
    ];

    const withdrawMigrationFeeDisc = DynamicBondingCurveIdl.instructions.find(
      (instruction) => instruction.name === "withdraw_migration_fee"
    ).discriminator;

    const payload = Buffer.concat([
      Buffer.from(withdrawMigrationFeeDisc),
      Buffer.from([hasPartner]),
    ]);

    return this.fundByClaimingFee({
      signer,
      feeVault,
      remainingAccounts,
      payload,
      sourceProgram: DYNAMIC_BONDING_CURVE_PROGRAM_ID,
    });
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
