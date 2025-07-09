import {
  Keypair,
  PublicKey,
  LAMPORTS_PER_SOL,
  SystemProgram,
  Transaction,
  clusterApiUrl,
  Connection,
} from "@solana/web3.js";
import { BanksClient, ProgramTestContext, start } from "solana-bankrun";
import {
  createAssociatedTokenAccountInstruction,
  createInitializeMint2Instruction,
  createMintToInstruction,
  getAssociatedTokenAddressSync,
  MINT_SIZE,
  TOKEN_PROGRAM_ID,
} from "@solana/spl-token";
import { DynamicFeeSharingClient } from "../../src/dfs";
import { FeeVault, DynamicFeeSharingProgram } from "../../src/types";
import {
  deriveFeeVaultAuthorityAddress,
  deriveTokenVaultAddress,
  deriveFeeVaultPdaAddress,
} from "../../src/helpers/accounts";
import { DYNAMIC_FEE_SHARING_PROGRAM_ID } from "../../src/constants";
import DynamicFeeSharingIDL from "../../src/idl/idl.json";

export {
  deriveFeeVaultAuthorityAddress,
  deriveTokenVaultAddress,
  deriveFeeVaultPdaAddress,
};

export const TOKEN_DECIMALS = 9;
export const RAW_AMOUNT = 1_000_000_000 * 10 ** TOKEN_DECIMALS;

export async function createTestContext(): Promise<ProgramTestContext> {
  const context = await start(
    [
      {
        name: "dynamic_fee_sharing",
        programId: DYNAMIC_FEE_SHARING_PROGRAM_ID,
      },
    ],
    []
  );

  return context;
}

export function createClient(
  context: ProgramTestContext
): DynamicFeeSharingClient {
  const connection = new Connection(clusterApiUrl("devnet"));
  return new DynamicFeeSharingClient(connection, "confirmed");
}

export async function getOrCreateAssociatedTokenAccount(
  banksClient: BanksClient,
  payer: Keypair,
  mint: PublicKey,
  owner: PublicKey,
  tokenProgram = TOKEN_PROGRAM_ID
): Promise<PublicKey> {
  const ataKey = getAssociatedTokenAddressSync(mint, owner, true, tokenProgram);

  const account = await banksClient.getAccount(ataKey);
  if (account === null) {
    const createAtaIx = createAssociatedTokenAccountInstruction(
      payer.publicKey,
      ataKey,
      owner,
      mint,
      tokenProgram
    );
    const transaction = new Transaction();
    const latestBlockhash = await banksClient.getLatestBlockhash();
    if (latestBlockhash) {
      transaction.recentBlockhash = latestBlockhash[0];
    } else {
      throw new Error("Failed to fetch recent blockhash from banksClient");
    }
    transaction.add(createAtaIx);
    transaction.sign(payer);
    await banksClient.processTransaction(transaction);
  }

  return ataKey;
}

export async function createToken(
  context: ProgramTestContext,
  payer: Keypair,
  mintAuthority: PublicKey,
  freezeAuthority?: PublicKey
): Promise<PublicKey> {
  const mintKeypair = Keypair.generate();
  const rent = await context.banksClient.getRent();
  const lamports = Number(rent.minimumBalance(BigInt(MINT_SIZE)));

  const createAccountIx = SystemProgram.createAccount({
    fromPubkey: payer.publicKey,
    newAccountPubkey: mintKeypair.publicKey,
    space: MINT_SIZE,
    lamports,
    programId: TOKEN_PROGRAM_ID,
  });

  const initializeMintIx = createInitializeMint2Instruction(
    mintKeypair.publicKey,
    TOKEN_DECIMALS,
    mintAuthority,
    freezeAuthority || null
  );

  const tx = new Transaction();
  tx.add(createAccountIx, initializeMintIx);

  const latestBlockhash = await context.banksClient.getLatestBlockhash();
  if (latestBlockhash) {
    tx.recentBlockhash = latestBlockhash[0];
  }
  tx.sign(payer, mintKeypair);

  const txMeta = await context.banksClient.processTransaction(tx);

  return mintKeypair.publicKey;
}

export async function mintToken(
  context: ProgramTestContext,
  payer: Keypair,
  mint: PublicKey,
  mintAuthority: Keypair,
  toWallet: PublicKey
): Promise<void> {
  const destination = await getOrCreateAssociatedTokenAccount(
    context.banksClient,
    payer,
    mint,
    toWallet
  );

  const mintIx = createMintToInstruction(
    mint,
    destination,
    mintAuthority.publicKey,
    RAW_AMOUNT
  );

  const tx = new Transaction();
  tx.add(mintIx);

  const latestBlockhash = await context.banksClient.getLatestBlockhash();
  if (latestBlockhash) {
    tx.recentBlockhash = latestBlockhash[0];
  }
  tx.sign(payer, mintAuthority);
}

export async function fundSol(
  context: ProgramTestContext,
  from: Keypair,
  recipients: PublicKey[],
  amountPerRecipient: number = LAMPORTS_PER_SOL
): Promise<void> {
  const transferTx = new Transaction();

  // Add transfer instruction for each recipient
  recipients.forEach((recipient) => {
    transferTx.add(
      SystemProgram.transfer({
        fromPubkey: from.publicKey,
        toPubkey: recipient,
        lamports: amountPerRecipient,
      })
    );
  });

  // Set recent blockhash
  const latestBlockhash = await context.banksClient.getLatestBlockhash();
  if (latestBlockhash) {
    transferTx.recentBlockhash = latestBlockhash[0];
  } else {
    throw new Error("Failed to fetch recent blockhash from banksClient");
  }

  // Sign and process transaction
  transferTx.sign(from);
  await context.banksClient.processTransaction(transferTx);
}

export async function generateUsers(
  context: ProgramTestContext,
  numberOfUsers: number
): Promise<Keypair[]> {
  const users: Keypair[] = [];

  for (let i = 0; i < numberOfUsers; i++) {
    const user = Keypair.generate();
    const transferIx = SystemProgram.transfer({
      fromPubkey: context.payer.publicKey,
      toPubkey: user.publicKey,
      lamports: LAMPORTS_PER_SOL,
    });

    const tx = new Transaction();
    tx.add(transferIx);

    const latestBlockhash = await context.banksClient.getLatestBlockhash();
    if (latestBlockhash) {
      tx.recentBlockhash = latestBlockhash[0];
    }
    tx.sign(context.payer);

    await context.banksClient.processTransaction(tx);
    users.push(user);
  }

  return users;
}

export function getProgramErrorCodeHexString(errorName: string): string {
  const error = DynamicFeeSharingIDL.errors.find(
    (e) =>
      e.name.toLowerCase() === errorName.toLowerCase() ||
      e.msg.toLowerCase() === errorName.toLowerCase()
  );

  if (!error) {
    throw new Error(
      `Unknown Dynamic Fee Sharing error message / name: ${errorName}`
    );
  }

  return `0x${error.code.toString(16)}`;
}

export async function expectThrowsErrorCode(
  promise: Promise<any>,
  errorCode: string
): Promise<void> {
  try {
    await promise;
    throw new Error("Expected an error but didn't get one");
  } catch (error: any) {
    const message = error.toString();
    if (!message.includes(errorCode)) {
      throw new Error(
        `Unexpected error: ${message}. Expected error code: ${errorCode}`
      );
    }
  }
}

export async function setRecentBlockhash(
  context: ProgramTestContext,
  transaction: Transaction
): Promise<void> {
  const latestBlockhash = await context.banksClient.getLatestBlockhash();
  if (latestBlockhash) {
    transaction.recentBlockhash = latestBlockhash[0];
  }
}

export async function getFeeVault(
  banksClient: BanksClient,
  program: DynamicFeeSharingProgram,
  feeVault: PublicKey
): Promise<FeeVault> {
  const account = await banksClient.getAccount(feeVault);
  if (!account) {
    throw new Error(`Fee vault account not found: ${feeVault.toString()}`);
  }
  return program.coder.accounts.decode("feeVault", Buffer.from(account.data));
}
