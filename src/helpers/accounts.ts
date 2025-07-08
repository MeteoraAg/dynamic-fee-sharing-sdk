import { PublicKey } from "@solana/web3.js";
import {
  DYNAMIC_FEE_SHARING_PROGRAM_ID,
  FEE_VAULT_AUTHORITY_PREFIX,
  FEE_VAULT_PREFIX,
  TOKEN_VAULT_PREFIX,
} from "../constants";

export function deriveFeeVaultAuthorityAddress(): PublicKey {
  return PublicKey.findProgramAddressSync(
    [Buffer.from(FEE_VAULT_AUTHORITY_PREFIX)],
    DYNAMIC_FEE_SHARING_PROGRAM_ID
  )[0];
}

export function deriveTokenVaultAddress(feeVault: PublicKey): PublicKey {
  return PublicKey.findProgramAddressSync(
    [Buffer.from(TOKEN_VAULT_PREFIX), feeVault.toBuffer()],
    DYNAMIC_FEE_SHARING_PROGRAM_ID
  )[0];
}

export function deriveFeeVaultPdaAddress(
  base: PublicKey,
  tokenMint: PublicKey
): PublicKey {
  return PublicKey.findProgramAddressSync(
    [Buffer.from(FEE_VAULT_PREFIX), base.toBuffer(), tokenMint.toBuffer()],
    DYNAMIC_FEE_SHARING_PROGRAM_ID
  )[0];
}
