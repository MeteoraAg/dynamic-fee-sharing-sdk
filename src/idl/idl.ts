/**
 * Program IDL in camelCase format in order to be used in JS/TS.
 *
 * Note that this is only a type helper and is not the actual IDL. The original
 * IDL can be found at `target/idl/dynamic_fee_sharing.json`.
 */
export type DynamicFeeSharing = {
  address: "dfsdo2UqvwfN8DuUVrMRNfQe11VaiNoKcMqLHVvDPzh";
  metadata: {
    name: "dynamicFeeSharing";
    version: "0.1.0";
    spec: "0.1.0";
    description: "Created with Anchor";
  };
  instructions: [
    {
      name: "claimFee";
      discriminator: [169, 32, 79, 137, 136, 232, 70, 137];
      accounts: [
        {
          name: "feeVault";
          writable: true;
        },
        {
          name: "feeVaultAuthority";
          pda: {
            seeds: [
              {
                kind: "const";
                value: [
                  102,
                  101,
                  101,
                  95,
                  118,
                  97,
                  117,
                  108,
                  116,
                  95,
                  97,
                  117,
                  116,
                  104,
                  111,
                  114,
                  105,
                  116,
                  121
                ];
              }
            ];
          };
        },
        {
          name: "tokenVault";
          writable: true;
          relations: ["feeVault"];
        },
        {
          name: "tokenMint";
          relations: ["feeVault"];
        },
        {
          name: "userTokenVault";
          writable: true;
        },
        {
          name: "user";
          signer: true;
        },
        {
          name: "tokenProgram";
        },
        {
          name: "eventAuthority";
          pda: {
            seeds: [
              {
                kind: "const";
                value: [
                  95,
                  95,
                  101,
                  118,
                  101,
                  110,
                  116,
                  95,
                  97,
                  117,
                  116,
                  104,
                  111,
                  114,
                  105,
                  116,
                  121
                ];
              }
            ];
          };
        },
        {
          name: "program";
        }
      ];
      args: [
        {
          name: "index";
          type: "u8";
        }
      ];
    },
    {
      name: "fundFee";
      discriminator: [243, 236, 235, 235, 101, 24, 186, 178];
      accounts: [
        {
          name: "feeVault";
          writable: true;
        },
        {
          name: "tokenVault";
          writable: true;
          relations: ["feeVault"];
        },
        {
          name: "tokenMint";
          relations: ["feeVault"];
        },
        {
          name: "fundTokenVault";
          writable: true;
        },
        {
          name: "funder";
          signer: true;
        },
        {
          name: "tokenProgram";
        },
        {
          name: "eventAuthority";
          pda: {
            seeds: [
              {
                kind: "const";
                value: [
                  95,
                  95,
                  101,
                  118,
                  101,
                  110,
                  116,
                  95,
                  97,
                  117,
                  116,
                  104,
                  111,
                  114,
                  105,
                  116,
                  121
                ];
              }
            ];
          };
        },
        {
          name: "program";
        }
      ];
      args: [
        {
          name: "maxAmount";
          type: "u64";
        }
      ];
    },
    {
      name: "initializeFeeVault";
      discriminator: [185, 140, 228, 234, 79, 203, 252, 50];
      accounts: [
        {
          name: "feeVault";
          writable: true;
          signer: true;
        },
        {
          name: "feeVaultAuthority";
          pda: {
            seeds: [
              {
                kind: "const";
                value: [
                  102,
                  101,
                  101,
                  95,
                  118,
                  97,
                  117,
                  108,
                  116,
                  95,
                  97,
                  117,
                  116,
                  104,
                  111,
                  114,
                  105,
                  116,
                  121
                ];
              }
            ];
          };
        },
        {
          name: "tokenVault";
          writable: true;
          pda: {
            seeds: [
              {
                kind: "const";
                value: [116, 111, 107, 101, 110, 95, 118, 97, 117, 108, 116];
              },
              {
                kind: "account";
                path: "feeVault";
              }
            ];
          };
        },
        {
          name: "tokenMint";
        },
        {
          name: "owner";
        },
        {
          name: "payer";
          writable: true;
          signer: true;
        },
        {
          name: "tokenProgram";
        },
        {
          name: "systemProgram";
          address: "11111111111111111111111111111111";
        },
        {
          name: "eventAuthority";
          pda: {
            seeds: [
              {
                kind: "const";
                value: [
                  95,
                  95,
                  101,
                  118,
                  101,
                  110,
                  116,
                  95,
                  97,
                  117,
                  116,
                  104,
                  111,
                  114,
                  105,
                  116,
                  121
                ];
              }
            ];
          };
        },
        {
          name: "program";
        }
      ];
      args: [
        {
          name: "params";
          type: {
            defined: {
              name: "initializeFeeVaultParameters";
            };
          };
        }
      ];
    },
    {
      name: "initializeFeeVaultPda";
      discriminator: [250, 250, 156, 113, 88, 143, 60, 233];
      accounts: [
        {
          name: "feeVault";
          writable: true;
          pda: {
            seeds: [
              {
                kind: "const";
                value: [102, 101, 101, 95, 118, 97, 117, 108, 116];
              },
              {
                kind: "account";
                path: "base";
              },
              {
                kind: "account";
                path: "tokenMint";
              }
            ];
          };
        },
        {
          name: "feeVaultAuthority";
          pda: {
            seeds: [
              {
                kind: "const";
                value: [
                  102,
                  101,
                  101,
                  95,
                  118,
                  97,
                  117,
                  108,
                  116,
                  95,
                  97,
                  117,
                  116,
                  104,
                  111,
                  114,
                  105,
                  116,
                  121
                ];
              }
            ];
          };
        },
        {
          name: "tokenVault";
          writable: true;
          pda: {
            seeds: [
              {
                kind: "const";
                value: [116, 111, 107, 101, 110, 95, 118, 97, 117, 108, 116];
              },
              {
                kind: "account";
                path: "feeVault";
              }
            ];
          };
        },
        {
          name: "tokenMint";
        },
        {
          name: "owner";
        },
        {
          name: "base";
          signer: true;
        },
        {
          name: "payer";
          writable: true;
          signer: true;
        },
        {
          name: "tokenProgram";
        },
        {
          name: "systemProgram";
          address: "11111111111111111111111111111111";
        },
        {
          name: "eventAuthority";
          pda: {
            seeds: [
              {
                kind: "const";
                value: [
                  95,
                  95,
                  101,
                  118,
                  101,
                  110,
                  116,
                  95,
                  97,
                  117,
                  116,
                  104,
                  111,
                  114,
                  105,
                  116,
                  121
                ];
              }
            ];
          };
        },
        {
          name: "program";
        }
      ];
      args: [
        {
          name: "params";
          type: {
            defined: {
              name: "initializeFeeVaultParameters";
            };
          };
        }
      ];
    }
  ];
  accounts: [
    {
      name: "feeVault";
      discriminator: [192, 178, 69, 232, 58, 149, 157, 132];
    }
  ];
  events: [
    {
      name: "evtClaimFee";
      discriminator: [6, 36, 88, 232, 53, 193, 253, 98];
    },
    {
      name: "evtFundFee";
      discriminator: [15, 14, 233, 140, 19, 195, 163, 7];
    },
    {
      name: "evtInitializeFeeVault";
      discriminator: [42, 203, 38, 10, 38, 178, 238, 77];
    }
  ];
  errors: [
    {
      code: 6000;
      name: "mathOverflow";
      msg: "Math operation overflow";
    },
    {
      code: 6001;
      name: "invalidMint";
      msg: "Mint is not supported";
    },
    {
      code: 6002;
      name: "invalidFeeVaultParameters";
      msg: "Fee vault parameters are invalid";
    },
    {
      code: 6003;
      name: "amountIsZero";
      msg: "Amount is zero";
    },
    {
      code: 6004;
      name: "invalidUserIndex";
      msg: "Invalid user index";
    },
    {
      code: 6005;
      name: "invalidUserAddress";
      msg: "Invalid user address";
    },
    {
      code: 6006;
      name: "exceededUser";
      msg: "Exceeded number of users allowed";
    }
  ];
  types: [
    {
      name: "evtClaimFee";
      type: {
        kind: "struct";
        fields: [
          {
            name: "feeVault";
            type: "pubkey";
          },
          {
            name: "user";
            type: "pubkey";
          },
          {
            name: "index";
            type: "u8";
          },
          {
            name: "claimedFee";
            type: "u64";
          }
        ];
      };
    },
    {
      name: "evtFundFee";
      type: {
        kind: "struct";
        fields: [
          {
            name: "feeVault";
            type: "pubkey";
          },
          {
            name: "funder";
            type: "pubkey";
          },
          {
            name: "excludedTransferFeeAmount";
            type: "u64";
          },
          {
            name: "maxAmount";
            type: "u64";
          },
          {
            name: "feePerShare";
            type: "u128";
          }
        ];
      };
    },
    {
      name: "evtInitializeFeeVault";
      type: {
        kind: "struct";
        fields: [
          {
            name: "feeVault";
            type: "pubkey";
          },
          {
            name: "tokenMint";
            type: "pubkey";
          },
          {
            name: "owner";
            type: "pubkey";
          },
          {
            name: "base";
            type: "pubkey";
          },
          {
            name: "params";
            type: {
              defined: {
                name: "initializeFeeVaultParameters";
              };
            };
          }
        ];
      };
    },
    {
      name: "feeVault";
      serialization: "bytemuck";
      repr: {
        kind: "c";
      };
      type: {
        kind: "struct";
        fields: [
          {
            name: "owner";
            type: "pubkey";
          },
          {
            name: "tokenMint";
            type: "pubkey";
          },
          {
            name: "tokenVault";
            type: "pubkey";
          },
          {
            name: "tokenFlag";
            type: "u8";
          },
          {
            name: "padding0";
            type: {
              array: ["u8", 15];
            };
          },
          {
            name: "totalShare";
            type: "u64";
          },
          {
            name: "totalFundedFee";
            type: "u64";
          },
          {
            name: "feePerShare";
            type: "u128";
          },
          {
            name: "padding";
            type: {
              array: ["u128", 6];
            };
          },
          {
            name: "users";
            type: {
              array: [
                {
                  defined: {
                    name: "userFee";
                  };
                },
                5
              ];
            };
          }
        ];
      };
    },
    {
      name: "initializeFeeVaultParameters";
      type: {
        kind: "struct";
        fields: [
          {
            name: "padding";
            type: {
              array: ["u64", 8];
            };
          },
          {
            name: "users";
            type: {
              vec: {
                defined: {
                  name: "userShare";
                };
              };
            };
          }
        ];
      };
    },
    {
      name: "userFee";
      serialization: "bytemuck";
      repr: {
        kind: "c";
      };
      type: {
        kind: "struct";
        fields: [
          {
            name: "address";
            type: "pubkey";
          },
          {
            name: "share";
            type: "u64";
          },
          {
            name: "feeClaimed";
            type: "u64";
          },
          {
            name: "padding";
            type: {
              array: ["u8", 16];
            };
          },
          {
            name: "feePerShareCheckpoint";
            type: "u128";
          }
        ];
      };
    },
    {
      name: "userShare";
      type: {
        kind: "struct";
        fields: [
          {
            name: "address";
            type: "pubkey";
          },
          {
            name: "share";
            type: "u64";
          }
        ];
      };
    }
  ];
};
