import { describe, it, beforeEach, expect } from "bun:test";
import { PublicKey, Keypair, LAMPORTS_PER_SOL } from "@solana/web3.js";
import { BN } from "@coral-xyz/anchor";
import { LiteSVM } from "litesvm";
import { DynamicFeeSharingClient } from "../src/dfs";
import { UserShare } from "../src/types";
import {
  startSvm,
  createClient,
  createToken,
  mintToken,
  generateUsers,
  deriveTokenVaultAddress,
  getProgramErrorCode,
  sendTransaction,
  getOrCreateAssociatedTokenAccount,
  getFeeVault,
  TOKEN_DECIMALS,
} from "./helpers/common";
import { AccountLayout, TOKEN_PROGRAM_ID } from "@solana/spl-token";

describe("Fee vault sharing", () => {
  let svm: LiteSVM;
  let client: DynamicFeeSharingClient;
  let admin: Keypair;
  let funder: Keypair;
  let vaultOwner: Keypair;
  let tokenMint: PublicKey;

  beforeEach(() => {
    svm = startSvm();
    client = createClient(svm);

    admin = Keypair.generate();
    vaultOwner = Keypair.generate();
    funder = Keypair.generate();

    svm.airdrop(admin.publicKey, BigInt(100 * LAMPORTS_PER_SOL));
    svm.airdrop(vaultOwner.publicKey, BigInt(LAMPORTS_PER_SOL));
    svm.airdrop(funder.publicKey, BigInt(LAMPORTS_PER_SOL));

    tokenMint = createToken(svm, admin, admin.publicKey);
    mintToken(svm, admin, tokenMint, admin, funder.publicKey);
  });

  it("Fail to create more than max user", async () => {
    const generatedUsers = generateUsers(svm, 6); // 6 users
    const userShare: UserShare[] = generatedUsers.map((user) => ({
      address: user.publicKey,
      share: 1000,
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

    sendTransaction(
      svm,
      tx,
      [admin, feeVault],
      getProgramErrorCode("ExceededUser"),
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

    sendTransaction(
      svm,
      tx,
      [admin, feeVault],
      getProgramErrorCode("ExceededUser"),
    );
  });

  it("Full flow", async () => {
    const generatedUsers = generateUsers(svm, 5); // 5 users
    const userShare: UserShare[] = generatedUsers.map((user) => ({
      address: user.publicKey,
      share: 1000,
    }));

    await fullFlow(
      svm,
      client,
      admin,
      funder,
      generatedUsers,
      vaultOwner.publicKey,
      tokenMint,
      userShare,
    );
  });
});

async function fullFlow(
  svm: LiteSVM,
  client: DynamicFeeSharingClient,
  admin: Keypair,
  funder: Keypair,
  users: Keypair[],
  vaultOwner: PublicKey,
  tokenMint: PublicKey,
  userShare: UserShare[],
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

  sendTransaction(svm, tx, [admin, feeVault]);

  const feeVaultState = getFeeVault(svm, client.program, feeVault.publicKey);
  expect(feeVaultState.owner.toString()).toBe(vaultOwner.toString());
  expect(feeVaultState.tokenMint.toString()).toBe(tokenMint.toString());
  expect(feeVaultState.tokenVault.toString()).toBe(tokenVault.toString());

  const totalShare = userShare.reduce(
    (a, b) => a.add(new BN(b.share)),
    new BN(0),
  );
  expect(feeVaultState.totalShare).toBe(totalShare.toNumber());
  expect(feeVaultState.totalFundedFee.toNumber()).toBe(0);

  const totalUsers = feeVaultState.users.filter(
    (item) => !item.address.equals(PublicKey.default),
  ).length;
  expect(totalUsers).toBe(userShare.length);

  console.log("fund fee");
  const fundAmount = new BN(100_000 * 10 ** TOKEN_DECIMALS);
  const fundFeeTx = await client.fundFeeVault({
    fundAmount,
    feeVault: feeVault.publicKey,
    funder: funder.publicKey,
  });

  sendTransaction(svm, fundFeeTx, [funder]);

  console.log("User claim fee");
  for (let i = 0; i < users.length; i++) {
    const user = users[i];
    const userTokenVault = getOrCreateAssociatedTokenAccount(
      svm,
      user,
      tokenMint,
      user.publicKey,
    );

    const claimFeeTx = await client.claimUserFee({
      feeVault: feeVault.publicKey,
      user: user.publicKey,
      payer: admin.publicKey,
    });

    sendTransaction(svm, claimFeeTx, [admin, user]);

    const feeVaultState = getFeeVault(svm, client.program, feeVault.publicKey);
    const account = svm.getAccount(userTokenVault);
    if (account) {
      const userTokenBalance = AccountLayout.decode(
        Buffer.from(account.data),
      ).amount.toString();
      expect(userTokenBalance).toBe(
        feeVaultState.users[i].feeClaimed.toString(),
      );
    }
  }
}
