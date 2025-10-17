import { Commitment, Connection, PublicKey } from "@solana/web3.js";
import { getAccount } from "@solana/spl-token";
import { CollectFeeMode } from "@meteora-ag/cp-amm-sdk";

/**
 * Check if the fee vault is the owner of the position NFT account
 * @param connection - Solana connection
 * @param commitment - Commitment level for the connection
 * @param positionNftAccount - Position NFT account address
 * @param feeVault - Fee vault address
 * @param tokenProgram - Token program ID (default: TOKEN_PROGRAM_ID)
 * @returns true if the fee vault is the owner, false otherwise
 */
export async function checkPositionOwnership(
  connection: Connection,
  commitment: Commitment,
  positionNftAccount: PublicKey,
  feeVault: PublicKey,
  tokenProgram?: PublicKey
): Promise<boolean> {
  try {
    const accountInfo = await getAccount(
      connection,
      positionNftAccount,
      commitment,
      tokenProgram
    );

    return accountInfo.owner.equals(feeVault);
  } catch (error) {
    console.error("Error checking position ownership:", error);
    return false;
  }
}

/**
 * Validates and determines which token (A or B) matches the fee vault's token mint
 * @param feeVaultTokenMint - The token mint of the fee vault
 * @param tokenAMint - Token A mint from the pool
 * @param tokenBMint - Token B mint from the pool
 * @returns Object containing isTokenA, isTokenB flags
 * @throws Error if the fee vault token mint doesn't match either token A or B
 */
export function checkFeeVaultTokenMint(
  feeVaultTokenMint: PublicKey,
  tokenAMint: PublicKey,
  tokenBMint: PublicKey
): { isTokenA: boolean; isTokenB: boolean } {
  const isTokenA = feeVaultTokenMint.equals(tokenAMint);
  const isTokenB = feeVaultTokenMint.equals(tokenBMint);

  if (!isTokenA && !isTokenB) {
    throw new Error(
      "InvalidTokenMint: Fee vault token mint does not match either token A or token B of the pool"
    );
  }

  return { isTokenA, isTokenB };
}
