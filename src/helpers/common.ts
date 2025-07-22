import { PublicKey } from "@solana/web3.js";
import { DynamicFeeSharing } from "../idl/idl";
import { Program } from "@coral-xyz/anchor";
import BN from "bn.js";
import Decimal from "decimal.js";

export async function getAccountData<T>(
  accountAddress: PublicKey | string,
  accountType: keyof Program<DynamicFeeSharing>["account"],
  program: Program<DynamicFeeSharing>
): Promise<T> {
  const address =
    accountAddress instanceof PublicKey
      ? accountAddress
      : new PublicKey(accountAddress);

  return (await program.account[accountType].fetchNullable(address)) as T;
}

/**
 * Convert amount to lamports and return as a regular number
 * Use this for smaller values like shares that fit in JavaScript's safe integer range
 */
export function convertToLamportsNumber(
  amount: number | string,
  tokenDecimal: number
): number {
  const valueInLamports = new Decimal(amount).mul(
    Decimal.pow(10, tokenDecimal)
  );

  if (valueInLamports.gt(Number.MAX_SAFE_INTEGER)) {
    throw new Error(
      `Value ${valueInLamports.toString()} exceeds safe integer range. Use convertToLamportsBN instead.`
    );
  }

  return valueInLamports.toNumber();
}

/**
 * Convert amount to lamports and return as a BN
 * Use this for large token amounts that might exceed JavaScript's safe integer range
 */
export function convertToLamportsBN(
  amount: number | string,
  tokenDecimal: number
): BN {
  const valueInLamports = new Decimal(amount).mul(
    Decimal.pow(10, tokenDecimal)
  );
  return new BN(valueInLamports.toString());
}
