import { PublicKey } from "@solana/web3.js";
import { DynamicFeeSharing } from "../idl/idl";
import { Program } from "@coral-xyz/anchor";

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
