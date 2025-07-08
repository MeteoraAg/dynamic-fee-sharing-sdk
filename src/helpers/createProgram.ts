import { Commitment, Connection } from "@solana/web3.js";
import { DynamicFeeSharingProgram } from "../types";
import { AnchorProvider, Program, Wallet } from "@coral-xyz/anchor";
import { DynamicFeeSharing } from "../idl/idl";
import DynamicFeeSharingIDL from "../idl/idl.json";

export function createDfsProgram(
  connection: Connection,
  commitment: Commitment = "confirmed"
): DynamicFeeSharingProgram {
  const provider = new AnchorProvider(connection, null as Wallet, {
    commitment,
  });
  const program = new Program<DynamicFeeSharing>(
    DynamicFeeSharingIDL,
    provider
  );

  return program;
}
