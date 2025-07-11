import { describe, it, beforeEach, expect } from "bun:test";
import { PublicKey, Keypair } from "@solana/web3.js";
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
  deriveTokenVaultAddress,
  getProgramErrorCodeHexString,
  expectThrowsErrorCode,
  getOrCreateAssociatedTokenAccount,
  setRecentBlockhash,
  getFeeVault,
  TOKEN_DECIMALS,
  fundSol,
} from "./helpers/common";
import { AccountLayout, TOKEN_PROGRAM_ID } from "@solana/spl-token";

describe("Fee vault sharing", () => {
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

    // Transfer SOL to accounts
    await fundSol(context, admin, [vaultOwner.publicKey, funder.publicKey]);

    tokenMint = await createToken(context, admin, admin.publicKey);
    await mintToken(context, admin, tokenMint, admin, funder.publicKey);
  });

  it("Fail to create more than max user", async () => {
    const generatedUsers = await generateUsers(context, 6); // 6 users
    const userShare: UserShare[] = generatedUsers.map((user) => ({
      address: user.publicKey,
      share: new BN(1000),
    }));

    const feeVault = Keypair.generate();

    const tx = await client.createFeeVault({
      feeVault: feeVault.publicKey,
      tokenMint,
      tokenProgram: TOKEN_PROGRAM_ID,
      owner: vaultOwner.publicKey,
      payer: admin.publicKey,
      userShare,
    });

    await setRecentBlockhash(context, tx);
    tx.sign(admin, feeVault);

    const errorCode = getProgramErrorCodeHexString("ExceededUser");
    await expectThrowsErrorCode(
      context.banksClient.processTransaction(tx),
      errorCode
    );
  });

  it("Fail to create with zero user", async () => {
    const userShare: UserShare[] = [];

    const feeVault = Keypair.generate();

    const tx = await client.createFeeVault({
      feeVault: feeVault.publicKey,
      tokenMint,
      tokenProgram: TOKEN_PROGRAM_ID,
      owner: vaultOwner.publicKey,
      payer: admin.publicKey,
      userShare,
    });

    await setRecentBlockhash(context, tx);
    tx.sign(admin, feeVault);

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
  const feeVault = Keypair.generate();
  const tokenVault = deriveTokenVaultAddress(feeVault.publicKey);

  console.log("initialize fee vault");
  const tx = await client.createFeeVault({
    feeVault: feeVault.publicKey,
    tokenMint,
    tokenProgram: TOKEN_PROGRAM_ID,
    owner: vaultOwner,
    payer: admin.publicKey,
    userShare,
  });

  await setRecentBlockhash(context, tx);
  tx.sign(admin, feeVault);
  const sendRes = await context.banksClient.processTransaction(tx);

  const feeVaultState = await getFeeVault(
    context.banksClient,
    client.program,
    feeVault.publicKey
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

  console.log("fund fee");
  const fundAmount = new BN(100_000 * 10 ** TOKEN_DECIMALS);
  const fundFeeTx = await client.fundFeeVault({
    fundAmount,
    feeVault: feeVault.publicKey,
    funder: funder.publicKey,
  });

  await setRecentBlockhash(context, fundFeeTx);
  fundFeeTx.sign(funder);

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
      feeVault: feeVault.publicKey,
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
        feeVault.publicKey
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
