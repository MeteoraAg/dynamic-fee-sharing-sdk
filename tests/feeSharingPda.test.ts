import { describe, it, beforeEach, expect } from "bun:test";
import {
  PublicKey,
  Keypair,
  LAMPORTS_PER_SOL,
  Transaction,
  SystemProgram,
} from "@solana/web3.js";
import { BN } from "@coral-xyz/anchor";
import { ProgramTestContext } from "solana-bankrun";
import { DynamicFeeSharingClient } from "../src/dfs";
import { UserShare } from "../src/types";
import {
  createTestContext,
  createClient,
  createToken,
  mintToken,
  generateUsers,
  deriveFeeVaultPdaAddress,
  deriveTokenVaultAddress,
  getProgramErrorCodeHexString,
  expectThrowsErrorCode,
  getOrCreateAssociatedTokenAccount,
  setRecentBlockhash,
  getFeeVault,
  TOKEN_DECIMALS,
} from "./helpers/common";
import { AccountLayout } from "@solana/spl-token";

describe("Fee vault pda sharing", () => {
  let context: ProgramTestContext;
  let client: DynamicFeeSharingClient;
  let admin: Keypair;
  let funder: Keypair;
  let vaultOwner: Keypair;
  let tokenMint: PublicKey;

  beforeEach(async () => {
    context = await createTestContext();
    client = createClient(context);

    admin = context.payer;
    vaultOwner = Keypair.generate();
    funder = Keypair.generate();

    // transfer SOL to accounts
    const transferTx = new Transaction();
    transferTx.add(
      SystemProgram.transfer({
        fromPubkey: admin.publicKey,
        toPubkey: vaultOwner.publicKey,
        lamports: LAMPORTS_PER_SOL,
      }),
      SystemProgram.transfer({
        fromPubkey: admin.publicKey,
        toPubkey: funder.publicKey,
        lamports: LAMPORTS_PER_SOL,
      })
    );

    const latestBlockhash = await context.banksClient.getLatestBlockhash();
    if (latestBlockhash) {
      transferTx.recentBlockhash = latestBlockhash[0];
    }
    transferTx.sign(admin);

    await context.banksClient.processTransaction(transferTx);

    // create token mint and mint to funder
    tokenMint = await createToken(context, admin, admin.publicKey);
    await mintToken(context, admin, tokenMint, admin, funder.publicKey);
  });

  it("Fail to create more than max user", async () => {
    const generatedUsers = await generateUsers(context, 6); // 6 users
    const userShare: UserShare[] = generatedUsers.map((user) => ({
      address: user.publicKey,
      share: new BN(1000),
    }));

    const baseKp = Keypair.generate();

    const tx = await client.createFeeVaultPda({
      base: baseKp.publicKey,
      tokenMint,
      owner: vaultOwner.publicKey,
      payer: admin.publicKey,
      userShare,
    });

    await setRecentBlockhash(context, tx);
    tx.sign(admin, baseKp);

    const errorCode = getProgramErrorCodeHexString("ExceededUser");
    await expectThrowsErrorCode(
      context.banksClient.processTransaction(tx),
      errorCode
    );
  });

  it("Fail to create with zero user", async () => {
    const userShare: UserShare[] = [];

    const baseKp = Keypair.generate();

    const tx = await client.createFeeVaultPda({
      base: baseKp.publicKey,
      tokenMint,
      owner: vaultOwner.publicKey,
      payer: admin.publicKey,
      userShare,
    });

    await setRecentBlockhash(context, tx);
    tx.sign(admin, baseKp);

    const errorCode = getProgramErrorCodeHexString("ExceededUser");
    await expectThrowsErrorCode(
      context.banksClient.processTransaction(tx),
      errorCode
    );
  });

  it("Full flow", async () => {
    const generatedUsers = await generateUsers(context, 5); // 5 users
    const userShare: UserShare[] = generatedUsers.map((user) => ({
      address: user.publicKey,
      share: new BN(1000),
    }));

    await fullFlow(
      context,
      client,
      admin,
      funder,
      generatedUsers,
      vaultOwner.publicKey,
      tokenMint,
      userShare
    );
  });
});

async function fullFlow(
  context: ProgramTestContext,
  client: DynamicFeeSharingClient,
  admin: Keypair,
  funder: Keypair,
  users: Keypair[],
  vaultOwner: PublicKey,
  tokenMint: PublicKey,
  userShare: UserShare[]
) {
  const baseKp = Keypair.generate();
  const feeVault = deriveFeeVaultPdaAddress(baseKp.publicKey, tokenMint);
  const tokenVault = deriveTokenVaultAddress(feeVault);

  console.log("initialize fee vault");
  const tx = await client.createFeeVaultPda({
    base: baseKp.publicKey,
    tokenMint,
    owner: vaultOwner,
    payer: admin.publicKey,
    userShare,
  });

  await setRecentBlockhash(context, tx);
  tx.sign(admin, baseKp);
  const sendRes = await context.banksClient.processTransaction(tx);

  if (sendRes) {
    const feeVaultState = await getFeeVault(
      context.banksClient,
      client.program,
      feeVault
    );
    expect(feeVaultState.owner.toString()).toBe(vaultOwner.toString());
    expect(feeVaultState.tokenMint.toString()).toBe(tokenMint.toString());
    expect(feeVaultState.tokenVault.toString()).toBe(tokenVault.toString());

    const totalShare = userShare.reduce((a, b) => a.add(b.share), new BN(0));
    expect(feeVaultState.totalShare.toNumber()).toBe(totalShare.toNumber());
    expect(feeVaultState.totalFundedFee.toNumber()).toBe(0);

    const totalUsers = feeVaultState.users.filter(
      (item) => !item.address.equals(PublicKey.default)
    ).length;
    expect(totalUsers).toBe(userShare.length);
  }

  console.log("fund fee");
  const fundAmount = new BN(100_000 * 10 ** TOKEN_DECIMALS);
  const fundFeeTx = await client.fundFeeVault({
    fundAmount,
    feeVault,
    funder: funder.publicKey,
  });

  await setRecentBlockhash(context, fundFeeTx);
  fundFeeTx.sign(funder);
  const fundFeeRes = await context.banksClient.processTransaction(fundFeeTx);

  if (fundFeeRes) {
    const feeVaultState = await getFeeVault(
      context.banksClient,
      client.program,
      feeVault
    );
    const account = await context.banksClient.getAccount(tokenVault);
    if (account) {
      const tokenVaultBalance = AccountLayout.decode(
        account.data
      ).amount.toString();
      expect(tokenVaultBalance).toBe(fundAmount.toString());
    }
    expect(feeVaultState.totalFundedFee.toString()).toBe(fundAmount.toString());
  }

  console.log("User claim fee");
  for (let i = 0; i < users.length; i++) {
    const user = users[i];
    const userTokenVault = await getOrCreateAssociatedTokenAccount(
      context.banksClient,
      user,
      tokenMint,
      user.publicKey
    );

    const claimFeeTx = await client.claimUserFee({
      feeVault,
      user: user.publicKey,
      payer: admin.publicKey,
    });

    await setRecentBlockhash(context, claimFeeTx);
    claimFeeTx.sign(admin, user);
    const claimFeeRes = await context.banksClient.processTransaction(
      claimFeeTx
    );

    if (claimFeeRes) {
      const feeVaultState = await getFeeVault(
        context.banksClient,
        client.program,
        feeVault
      );
      const account = await context.banksClient.getAccount(userTokenVault);
      if (account) {
        const userTokenBalance = AccountLayout.decode(
          account.data
        ).amount.toString();
        expect(userTokenBalance).toBe(
          feeVaultState.users[i].feeClaimed.toString()
        );
      }
    }
  }
}
