import {
  Keypair,
  PublicKey,
  LAMPORTS_PER_SOL,
  SystemProgram,
  Transaction,
  clusterApiUrl,
  Connection,
} from "@solana/web3.js";
import {
  FailedTransactionMetadata,
  LiteSVM,
  TransactionMetadata,
} from "litesvm";
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

export function sendTransaction(
  svm: LiteSVM,
  transaction: Transaction,
  signers: Keypair[],
  errorCode?: number,
): TransactionMetadata | FailedTransactionMetadata {
  transaction.recentBlockhash = svm.latestBlockhash();
  transaction.sign(...signers);

  const result = svm.sendTransaction(transaction);
  if (errorCode !== undefined) {
    expectThrowsErrorCode(result, errorCode);
  } else if (result instanceof FailedTransactionMetadata) {
    throw new Error(`Transaction failed: ${result.err().toString()}`);
  }

  return result;
}

export function startSvm(): LiteSVM {
  const svm = new LiteSVM();
  svm.addProgramFromFile(
    DYNAMIC_FEE_SHARING_PROGRAM_ID,
    "./tests/fixtures/dynamic_fee_sharing.so",
  );

  return svm;
}

export function createClient(svm: LiteSVM): DynamicFeeSharingClient {
  const connection = new Connection(clusterApiUrl("devnet"));

  // route account fetches to litesvm so SDK state reads see the test ledger
  const getAccountInfo = async (address: PublicKey) => {
    const account = svm.getAccount(address);
    if (!account) {
      return null;
    }
    return {
      executable: account.executable,
      owner: account.owner,
      lamports: account.lamports,
      data: Buffer.from(account.data),
      rentEpoch: account.rentEpoch,
    };
  };

  connection.getAccountInfo = getAccountInfo as Connection["getAccountInfo"];
  connection.getAccountInfoAndContext = (async (address: PublicKey) => ({
    context: { slot: 0 },
    value: await getAccountInfo(address),
  })) as Connection["getAccountInfoAndContext"];

  return new DynamicFeeSharingClient(connection, "confirmed");
}

export function getOrCreateAssociatedTokenAccount(
  svm: LiteSVM,
  payer: Keypair,
  mint: PublicKey,
  owner: PublicKey,
  tokenProgram = TOKEN_PROGRAM_ID,
): PublicKey {
  const ataKey = getAssociatedTokenAddressSync(mint, owner, true, tokenProgram);

  const account = svm.getAccount(ataKey);
  if (account === null) {
    const createAtaIx = createAssociatedTokenAccountInstruction(
      payer.publicKey,
      ataKey,
      owner,
      mint,
      tokenProgram,
    );
    const transaction = new Transaction();
    transaction.add(createAtaIx);
    sendTransaction(svm, transaction, [payer]);
  }

  return ataKey;
}

export function createToken(
  svm: LiteSVM,
  payer: Keypair,
  mintAuthority: PublicKey,
  freezeAuthority?: PublicKey,
): PublicKey {
  const mintKeypair = Keypair.generate();
  const rent = svm.getRent();
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
    freezeAuthority || null,
  );

  const tx = new Transaction();
  tx.add(createAccountIx, initializeMintIx);
  sendTransaction(svm, tx, [payer, mintKeypair]);

  return mintKeypair.publicKey;
}

export function mintToken(
  svm: LiteSVM,
  payer: Keypair,
  mint: PublicKey,
  mintAuthority: Keypair,
  toWallet: PublicKey,
): void {
  const destination = getOrCreateAssociatedTokenAccount(
    svm,
    payer,
    mint,
    toWallet,
  );

  const mintIx = createMintToInstruction(
    mint,
    destination,
    mintAuthority.publicKey,
    RAW_AMOUNT,
  );

  const tx = new Transaction();
  tx.add(mintIx);
  sendTransaction(svm, tx, [payer, mintAuthority]);
}

export function generateUsers(svm: LiteSVM, numberOfUsers: number): Keypair[] {
  const users: Keypair[] = [];

  for (let i = 0; i < numberOfUsers; i++) {
    const user = Keypair.generate();
    svm.airdrop(user.publicKey, BigInt(LAMPORTS_PER_SOL));
    users.push(user);
  }

  return users;
}

export function getProgramErrorCode(errorName: string): number {
  const error = DynamicFeeSharingIDL.errors.find(
    (e) =>
      e.name.toLowerCase() === errorName.toLowerCase() ||
      e.msg.toLowerCase() === errorName.toLowerCase(),
  );

  if (!error) {
    throw new Error(
      `Unknown Dynamic Fee Sharing error message / name: ${errorName}`,
    );
  }

  return error.code;
}

export function expectThrowsErrorCode(
  response: TransactionMetadata | FailedTransactionMetadata,
  errorCode: number,
): void {
  if (response instanceof FailedTransactionMetadata) {
    const message = response.err().toString();

    if (!message.includes(errorCode.toString())) {
      throw new Error(
        `Unexpected error: ${message}. Expected error code: ${errorCode}`,
      );
    }
  } else {
    throw new Error("Expected an error but didn't get one");
  }
}

export function getFeeVault(
  svm: LiteSVM,
  program: DynamicFeeSharingProgram,
  feeVault: PublicKey,
): FeeVault {
  const account = svm.getAccount(feeVault);
  if (!account) {
    throw new Error(`Fee vault account not found: ${feeVault.toString()}`);
  }
  return program.coder.accounts.decode("feeVault", Buffer.from(account.data));
}
