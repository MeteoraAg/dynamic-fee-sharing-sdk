import {
  createAssociatedTokenAccountIdempotentInstruction,
  createCloseAccountInstruction,
  getAccount,
  getAssociatedTokenAddressSync,
  NATIVE_MINT,
  TOKEN_2022_PROGRAM_ID,
  TOKEN_PROGRAM_ID,
  TokenAccountNotFoundError,
  TokenInvalidAccountOwnerError,
} from "@solana/spl-token";
import {
  Connection,
  PublicKey,
  SystemProgram,
  TransactionInstruction,
} from "@solana/web3.js";
import { TokenType } from "../types";

export function getTokenProgram(tokenFlag: TokenType): PublicKey {
  return tokenFlag === TokenType.SPL ? TOKEN_PROGRAM_ID : TOKEN_2022_PROGRAM_ID;
}

export const getOrCreateATAInstruction = async (
  connection: Connection,
  tokenMint: PublicKey,
  owner: PublicKey,
  payer: PublicKey,
  allowOwnerOffCurve = true,
  tokenProgram: PublicKey
): Promise<{ ataPubkey: PublicKey; ix?: TransactionInstruction }> => {
  const toAccount = getAssociatedTokenAddressSync(
    tokenMint,
    owner,
    allowOwnerOffCurve,
    tokenProgram
  );

  try {
    await getAccount(connection, toAccount);
    return { ataPubkey: toAccount, ix: undefined };
  } catch (e) {
    if (
      e instanceof TokenAccountNotFoundError ||
      e instanceof TokenInvalidAccountOwnerError
    ) {
      const ix = createAssociatedTokenAccountIdempotentInstruction(
        payer,
        toAccount,
        owner,
        tokenMint,
        tokenProgram
      );

      return { ataPubkey: toAccount, ix };
    } else {
      /* handle error */
      console.error("Error::getOrCreateATAInstruction", e);
      throw e;
    }
  }
};

export function wrapSOLInstruction(
  from: PublicKey,
  to: PublicKey,
  amount: bigint
): TransactionInstruction[] {
  return [
    SystemProgram.transfer({
      fromPubkey: from,
      toPubkey: to,
      lamports: amount,
    }),
    new TransactionInstruction({
      keys: [
        {
          pubkey: to,
          isSigner: false,
          isWritable: true,
        },
      ],
      data: Buffer.from(new Uint8Array([17])),
      programId: TOKEN_PROGRAM_ID,
    }),
  ];
}

export function unwrapSOLInstruction(
  owner: PublicKey,
  receiver: PublicKey,
  allowOwnerOffCurve = true
): TransactionInstruction | null {
  const wSolATAAccount = getAssociatedTokenAddressSync(
    NATIVE_MINT,
    owner,
    allowOwnerOffCurve
  );
  if (wSolATAAccount) {
    const closedWrappedSolInstruction = createCloseAccountInstruction(
      wSolATAAccount,
      receiver,
      owner,
      [],
      TOKEN_PROGRAM_ID
    );
    return closedWrappedSolInstruction;
  }
  return null;
}
