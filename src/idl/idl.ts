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
    version: "0.1.1";
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
          address: "EYqHRdtepv1KKUkPAYMBYpSfiGfNd8sa55ZtswodTfBS";
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
      name: "fundingByClaimDammv2Fee";
      discriminator: [41, 114, 86, 74, 99, 80, 149, 203];
      accounts: [
        {
          name: "feeVault";
          writable: true;
        },
        {
          name: "pool";
        },
        {
          name: "position";
          writable: true;
        },
        {
          name: "positionNftAccount";
          docs: ["The token account for nft"];
        },
        {
          name: "tokenAAccount";
          writable: true;
        },
        {
          name: "tokenBAccount";
          docs: ["The user token b account"];
          writable: true;
        },
        {
          name: "tokenAVault";
          docs: ["The vault token account for input token"];
          writable: true;
        },
        {
          name: "tokenBVault";
          docs: ["The vault token account for output token"];
          writable: true;
        },
        {
          name: "tokenAMint";
          docs: ["The mint of token a"];
        },
        {
          name: "tokenBMint";
          docs: ["The mint of token b"];
        },
        {
          name: "tokenAProgram";
        },
        {
          name: "tokenBProgram";
        },
        {
          name: "dammv2PoolAuthority";
        },
        {
          name: "dammv2Program";
          address: "cpamdpZCGKUy5JxQXB4dcpGPiikHawvSWAd6mEn1sGG";
        },
        {
          name: "dammv2EventAuthority";
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
      args: [];
    },
    {
      name: "fundingByClaimDbcCreatorSurplus";
      discriminator: [236, 206, 26, 241, 85, 228, 45, 93];
      accounts: [
        {
          name: "feeVault";
          writable: true;
        },
        {
          name: "config";
        },
        {
          name: "pool";
          docs: ["The dbc virtual pool"];
          writable: true;
        },
        {
          name: "tokenQuoteAccount";
          docs: ["The treasury token b account"];
          writable: true;
        },
        {
          name: "quoteVault";
          writable: true;
        },
        {
          name: "quoteMint";
        },
        {
          name: "tokenBaseProgram";
        },
        {
          name: "tokenQuoteProgram";
        },
        {
          name: "dbcPoolAuthority";
        },
        {
          name: "dbcProgram";
          address: "dbcij3LWUppWqq96dh6gJWwBifmcGfLSB5D4DuSMaqN";
        },
        {
          name: "dbcEventAuthority";
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
      args: [];
    },
    {
      name: "fundingByClaimDbcCreatorTradingFee";
      discriminator: [255, 219, 222, 197, 46, 146, 167, 4];
      accounts: [
        {
          name: "feeVault";
          writable: true;
        },
        {
          name: "config";
        },
        {
          name: "pool";
          writable: true;
        },
        {
          name: "tokenAAccount";
          writable: true;
        },
        {
          name: "tokenBAccount";
          docs: ["The token b account"];
          writable: true;
        },
        {
          name: "baseVault";
          writable: true;
        },
        {
          name: "quoteVault";
          writable: true;
        },
        {
          name: "baseMint";
        },
        {
          name: "quoteMint";
          relations: ["config"];
        },
        {
          name: "tokenBaseProgram";
        },
        {
          name: "tokenQuoteProgram";
        },
        {
          name: "dbcPoolAuthority";
        },
        {
          name: "dbcProgram";
          address: "dbcij3LWUppWqq96dh6gJWwBifmcGfLSB5D4DuSMaqN";
        },
        {
          name: "dbcEventAuthority";
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
      args: [];
    },
    {
      name: "fundingByClaimDbcPartnerSurplus";
      discriminator: [146, 67, 241, 237, 23, 164, 213, 113];
      accounts: [
        {
          name: "feeVault";
          writable: true;
        },
        {
          name: "config";
        },
        {
          name: "pool";
          docs: ["The dbc virtual pool"];
          writable: true;
        },
        {
          name: "tokenQuoteAccount";
          docs: ["The token b account"];
          writable: true;
        },
        {
          name: "quoteVault";
          writable: true;
        },
        {
          name: "quoteMint";
        },
        {
          name: "tokenBaseProgram";
        },
        {
          name: "tokenQuoteProgram";
        },
        {
          name: "dbcPoolAuthority";
        },
        {
          name: "dbcProgram";
          address: "dbcij3LWUppWqq96dh6gJWwBifmcGfLSB5D4DuSMaqN";
        },
        {
          name: "dbcEventAuthority";
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
      args: [];
    },
    {
      name: "fundingByClaimDbcPartnerTradingFee";
      discriminator: [0, 156, 54, 230, 218, 238, 81, 47];
      accounts: [
        {
          name: "feeVault";
          writable: true;
        },
        {
          name: "config";
        },
        {
          name: "pool";
          writable: true;
        },
        {
          name: "tokenAAccount";
          writable: true;
        },
        {
          name: "tokenBAccount";
          docs: ["The treasury token b account"];
          writable: true;
        },
        {
          name: "baseVault";
          writable: true;
        },
        {
          name: "quoteVault";
          writable: true;
        },
        {
          name: "baseMint";
        },
        {
          name: "quoteMint";
          relations: ["config"];
        },
        {
          name: "tokenBaseProgram";
        },
        {
          name: "tokenQuoteProgram";
        },
        {
          name: "dbcPoolAuthority";
        },
        {
          name: "dbcProgram";
          address: "dbcij3LWUppWqq96dh6gJWwBifmcGfLSB5D4DuSMaqN";
        },
        {
          name: "dbcEventAuthority";
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
      args: [];
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
    },
    {
      name: "pool";
      discriminator: [241, 154, 109, 4, 17, 177, 109, 188];
    },
    {
      name: "poolConfig";
      discriminator: [26, 108, 14, 123, 116, 230, 129, 43];
    },
    {
      name: "virtualPool";
      discriminator: [213, 224, 5, 209, 98, 69, 119, 92];
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
    },
    {
      code: 6007;
      name: "invalidFeeVault";
      msg: "Invalid fee vault";
    },
    {
      code: 6008;
      name: "invalidDammv2Pool";
      msg: "Invalid dammv2 pool";
    },
    {
      code: 6009;
      name: "invalidDbcPool";
      msg: "Invalid dammv2 pool";
    }
  ];
  types: [
    {
      name: "baseFeeConfig";
      serialization: "bytemuck";
      repr: {
        kind: "c";
      };
      type: {
        kind: "struct";
        fields: [
          {
            name: "cliffFeeNumerator";
            type: "u64";
          },
          {
            name: "secondFactor";
            type: "u64";
          },
          {
            name: "thirdFactor";
            type: "u64";
          },
          {
            name: "firstFactor";
            type: "u16";
          },
          {
            name: "baseFeeMode";
            type: "u8";
          },
          {
            name: "padding0";
            type: {
              array: ["u8", 5];
            };
          }
        ];
      };
    },
    {
      name: "baseFeeStruct";
      serialization: "bytemuck";
      repr: {
        kind: "c";
      };
      type: {
        kind: "struct";
        fields: [
          {
            name: "cliffFeeNumerator";
            type: "u64";
          },
          {
            name: "feeSchedulerMode";
            type: "u8";
          },
          {
            name: "padding0";
            type: {
              array: ["u8", 5];
            };
          },
          {
            name: "numberOfPeriod";
            type: "u16";
          },
          {
            name: "periodFrequency";
            type: "u64";
          },
          {
            name: "reductionFactor";
            type: "u64";
          },
          {
            name: "padding1";
            type: "u64";
          }
        ];
      };
    },
    {
      name: "dynamicFeeConfig";
      serialization: "bytemuck";
      repr: {
        kind: "c";
      };
      type: {
        kind: "struct";
        fields: [
          {
            name: "initialized";
            type: "u8";
          },
          {
            name: "padding";
            type: {
              array: ["u8", 7];
            };
          },
          {
            name: "maxVolatilityAccumulator";
            type: "u32";
          },
          {
            name: "variableFeeControl";
            type: "u32";
          },
          {
            name: "binStep";
            type: "u16";
          },
          {
            name: "filterPeriod";
            type: "u16";
          },
          {
            name: "decayPeriod";
            type: "u16";
          },
          {
            name: "reductionFactor";
            type: "u16";
          },
          {
            name: "padding2";
            type: {
              array: ["u8", 8];
            };
          },
          {
            name: "binStepU128";
            type: "u128";
          }
        ];
      };
    },
    {
      name: "dynamicFeeStruct";
      serialization: "bytemuck";
      repr: {
        kind: "c";
      };
      type: {
        kind: "struct";
        fields: [
          {
            name: "initialized";
            type: "u8";
          },
          {
            name: "padding";
            type: {
              array: ["u8", 7];
            };
          },
          {
            name: "maxVolatilityAccumulator";
            type: "u32";
          },
          {
            name: "variableFeeControl";
            type: "u32";
          },
          {
            name: "binStep";
            type: "u16";
          },
          {
            name: "filterPeriod";
            type: "u16";
          },
          {
            name: "decayPeriod";
            type: "u16";
          },
          {
            name: "reductionFactor";
            type: "u16";
          },
          {
            name: "lastUpdateTimestamp";
            type: "u64";
          },
          {
            name: "binStepU128";
            type: "u128";
          },
          {
            name: "sqrtPriceReference";
            type: "u128";
          },
          {
            name: "volatilityAccumulator";
            type: "u128";
          },
          {
            name: "volatilityReference";
            type: "u128";
          }
        ];
      };
    },
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
            name: "fundingType";
            type: {
              defined: {
                name: "fundingType";
              };
            };
          },
          {
            name: "feeVault";
            type: "pubkey";
          },
          {
            name: "funder";
            type: "pubkey";
          },
          {
            name: "fundedAmount";
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
            name: "feeVaultType";
            type: "u8";
          },
          {
            name: "feeVaultBump";
            type: "u8";
          },
          {
            name: "padding0";
            type: {
              array: ["u8", 13];
            };
          },
          {
            name: "totalShare";
            type: "u32";
          },
          {
            name: "padding1";
            type: {
              array: ["u8", 4];
            };
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
            name: "base";
            type: "pubkey";
          },
          {
            name: "padding";
            type: {
              array: ["u128", 4];
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
      name: "fundingType";
      repr: {
        kind: "rust";
      };
      type: {
        kind: "enum";
        variants: [
          {
            name: "direct";
          },
          {
            name: "claimDammV2";
          },
          {
            name: "claimDbcPartnerTradingFee";
          },
          {
            name: "claimDbcCreatorTradingFee";
          },
          {
            name: "claimDbcPartnerSurplus";
          },
          {
            name: "claimDbcCreatorSurplus";
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
      name: "liquidityDistributionConfig";
      serialization: "bytemuck";
      repr: {
        kind: "c";
      };
      type: {
        kind: "struct";
        fields: [
          {
            name: "sqrtPrice";
            type: "u128";
          },
          {
            name: "liquidity";
            type: "u128";
          }
        ];
      };
    },
    {
      name: "lockedVestingConfig";
      serialization: "bytemuck";
      repr: {
        kind: "c";
      };
      type: {
        kind: "struct";
        fields: [
          {
            name: "amountPerPeriod";
            type: "u64";
          },
          {
            name: "cliffDurationFromMigrationTime";
            type: "u64";
          },
          {
            name: "frequency";
            type: "u64";
          },
          {
            name: "numberOfPeriod";
            type: "u64";
          },
          {
            name: "cliffUnlockAmount";
            type: "u64";
          },
          {
            name: "padding";
            type: "u64";
          }
        ];
      };
    },
    {
      name: "pool";
      serialization: "bytemuck";
      repr: {
        kind: "c";
      };
      type: {
        kind: "struct";
        fields: [
          {
            name: "poolFees";
            type: {
              defined: {
                name: "poolFeesStruct";
              };
            };
          },
          {
            name: "tokenAMint";
            type: "pubkey";
          },
          {
            name: "tokenBMint";
            type: "pubkey";
          },
          {
            name: "tokenAVault";
            type: "pubkey";
          },
          {
            name: "tokenBVault";
            type: "pubkey";
          },
          {
            name: "whitelistedVault";
            type: "pubkey";
          },
          {
            name: "partner";
            type: "pubkey";
          },
          {
            name: "liquidity";
            type: "u128";
          },
          {
            name: "padding";
            type: "u128";
          },
          {
            name: "protocolAFee";
            type: "u64";
          },
          {
            name: "protocolBFee";
            type: "u64";
          },
          {
            name: "partnerAFee";
            type: "u64";
          },
          {
            name: "partnerBFee";
            type: "u64";
          },
          {
            name: "sqrtMinPrice";
            type: "u128";
          },
          {
            name: "sqrtMaxPrice";
            type: "u128";
          },
          {
            name: "sqrtPrice";
            type: "u128";
          },
          {
            name: "activationPoint";
            type: "u64";
          },
          {
            name: "activationType";
            type: "u8";
          },
          {
            name: "poolStatus";
            type: "u8";
          },
          {
            name: "tokenAFlag";
            type: "u8";
          },
          {
            name: "tokenBFlag";
            type: "u8";
          },
          {
            name: "collectFeeMode";
            type: "u8";
          },
          {
            name: "poolType";
            type: "u8";
          },
          {
            name: "padding0";
            type: {
              array: ["u8", 2];
            };
          },
          {
            name: "feeAPerLiquidity";
            type: {
              array: ["u8", 32];
            };
          },
          {
            name: "feeBPerLiquidity";
            type: {
              array: ["u8", 32];
            };
          },
          {
            name: "permanentLockLiquidity";
            type: "u128";
          },
          {
            name: "metrics";
            type: {
              defined: {
                name: "damm_v2::damm_v2::types::PoolMetrics";
              };
            };
          },
          {
            name: "creator";
            type: "pubkey";
          },
          {
            name: "padding1";
            type: {
              array: ["u64", 6];
            };
          },
          {
            name: "rewardInfos";
            type: {
              array: [
                {
                  defined: {
                    name: "rewardInfo";
                  };
                },
                2
              ];
            };
          }
        ];
      };
    },
    {
      name: "poolConfig";
      serialization: "bytemuck";
      repr: {
        kind: "c";
      };
      type: {
        kind: "struct";
        fields: [
          {
            name: "quoteMint";
            type: "pubkey";
          },
          {
            name: "feeClaimer";
            type: "pubkey";
          },
          {
            name: "leftoverReceiver";
            type: "pubkey";
          },
          {
            name: "poolFees";
            type: {
              defined: {
                name: "poolFeesConfig";
              };
            };
          },
          {
            name: "collectFeeMode";
            type: "u8";
          },
          {
            name: "migrationOption";
            type: "u8";
          },
          {
            name: "activationType";
            type: "u8";
          },
          {
            name: "tokenDecimal";
            type: "u8";
          },
          {
            name: "version";
            type: "u8";
          },
          {
            name: "tokenType";
            type: "u8";
          },
          {
            name: "quoteTokenFlag";
            type: "u8";
          },
          {
            name: "partnerLockedLpPercentage";
            type: "u8";
          },
          {
            name: "partnerLpPercentage";
            type: "u8";
          },
          {
            name: "creatorLockedLpPercentage";
            type: "u8";
          },
          {
            name: "creatorLpPercentage";
            type: "u8";
          },
          {
            name: "migrationFeeOption";
            type: "u8";
          },
          {
            name: "fixedTokenSupplyFlag";
            type: "u8";
          },
          {
            name: "creatorTradingFeePercentage";
            type: "u8";
          },
          {
            name: "tokenUpdateAuthority";
            type: "u8";
          },
          {
            name: "migrationFeePercentage";
            type: "u8";
          },
          {
            name: "creatorMigrationFeePercentage";
            type: "u8";
          },
          {
            name: "padding0";
            type: {
              array: ["u8", 7];
            };
          },
          {
            name: "swapBaseAmount";
            type: "u64";
          },
          {
            name: "migrationQuoteThreshold";
            type: "u64";
          },
          {
            name: "migrationBaseThreshold";
            type: "u64";
          },
          {
            name: "migrationSqrtPrice";
            type: "u128";
          },
          {
            name: "lockedVestingConfig";
            type: {
              defined: {
                name: "lockedVestingConfig";
              };
            };
          },
          {
            name: "preMigrationTokenSupply";
            type: "u64";
          },
          {
            name: "postMigrationTokenSupply";
            type: "u64";
          },
          {
            name: "migratedCollectFeeMode";
            type: "u8";
          },
          {
            name: "migratedDynamicFee";
            type: "u8";
          },
          {
            name: "migratedPoolFeeBps";
            type: "u16";
          },
          {
            name: "padding1";
            type: {
              array: ["u8", 12];
            };
          },
          {
            name: "padding2";
            type: "u128";
          },
          {
            name: "sqrtStartPrice";
            type: "u128";
          },
          {
            name: "curve";
            type: {
              array: [
                {
                  defined: {
                    name: "liquidityDistributionConfig";
                  };
                },
                20
              ];
            };
          }
        ];
      };
    },
    {
      name: "poolFeesConfig";
      serialization: "bytemuck";
      repr: {
        kind: "c";
      };
      type: {
        kind: "struct";
        fields: [
          {
            name: "baseFee";
            type: {
              defined: {
                name: "baseFeeConfig";
              };
            };
          },
          {
            name: "dynamicFee";
            type: {
              defined: {
                name: "dynamicFeeConfig";
              };
            };
          },
          {
            name: "padding0";
            type: {
              array: ["u64", 5];
            };
          },
          {
            name: "padding1";
            type: {
              array: ["u8", 6];
            };
          },
          {
            name: "protocolFeePercent";
            type: "u8";
          },
          {
            name: "referralFeePercent";
            type: "u8";
          }
        ];
      };
    },
    {
      name: "poolFeesStruct";
      docs: [
        "Information regarding fee charges",
        "trading_fee = amount * trade_fee_numerator / denominator",
        "protocol_fee = trading_fee * protocol_fee_percentage / 100",
        "referral_fee = protocol_fee * referral_percentage / 100",
        "partner_fee = (protocol_fee - referral_fee) * partner_fee_percentage / denominator"
      ];
      serialization: "bytemuck";
      repr: {
        kind: "c";
      };
      type: {
        kind: "struct";
        fields: [
          {
            name: "baseFee";
            type: {
              defined: {
                name: "baseFeeStruct";
              };
            };
          },
          {
            name: "protocolFeePercent";
            type: "u8";
          },
          {
            name: "partnerFeePercent";
            type: "u8";
          },
          {
            name: "referralFeePercent";
            type: "u8";
          },
          {
            name: "padding0";
            type: {
              array: ["u8", 5];
            };
          },
          {
            name: "dynamicFee";
            type: {
              defined: {
                name: "dynamicFeeStruct";
              };
            };
          },
          {
            name: "padding1";
            type: {
              array: ["u64", 2];
            };
          }
        ];
      };
    },
    {
      name: "rewardInfo";
      docs: ["Stores the state relevant for tracking liquidity mining rewards"];
      serialization: "bytemuck";
      repr: {
        kind: "c";
      };
      type: {
        kind: "struct";
        fields: [
          {
            name: "initialized";
            type: "u8";
          },
          {
            name: "rewardTokenFlag";
            type: "u8";
          },
          {
            name: "padding0";
            type: {
              array: ["u8", 6];
            };
          },
          {
            name: "padding1";
            type: {
              array: ["u8", 8];
            };
          },
          {
            name: "mint";
            type: "pubkey";
          },
          {
            name: "vault";
            type: "pubkey";
          },
          {
            name: "funder";
            type: "pubkey";
          },
          {
            name: "rewardDuration";
            type: "u64";
          },
          {
            name: "rewardDurationEnd";
            type: "u64";
          },
          {
            name: "rewardRate";
            type: "u128";
          },
          {
            name: "rewardPerTokenStored";
            type: {
              array: ["u8", 32];
            };
          },
          {
            name: "lastUpdateTime";
            type: "u64";
          },
          {
            name: "cumulativeSecondsWithEmptyLiquidityReward";
            type: "u64";
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
            type: "u32";
          },
          {
            name: "padding0";
            type: {
              array: ["u8", 4];
            };
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
            type: "u32";
          }
        ];
      };
    },
    {
      name: "virtualPool";
      serialization: "bytemuck";
      repr: {
        kind: "c";
      };
      type: {
        kind: "struct";
        fields: [
          {
            name: "volatilityTracker";
            type: {
              defined: {
                name: "volatilityTracker";
              };
            };
          },
          {
            name: "config";
            type: "pubkey";
          },
          {
            name: "creator";
            type: "pubkey";
          },
          {
            name: "baseMint";
            type: "pubkey";
          },
          {
            name: "baseVault";
            type: "pubkey";
          },
          {
            name: "quoteVault";
            type: "pubkey";
          },
          {
            name: "baseReserve";
            type: "u64";
          },
          {
            name: "quoteReserve";
            type: "u64";
          },
          {
            name: "protocolBaseFee";
            type: "u64";
          },
          {
            name: "protocolQuoteFee";
            type: "u64";
          },
          {
            name: "partnerBaseFee";
            type: "u64";
          },
          {
            name: "partnerQuoteFee";
            type: "u64";
          },
          {
            name: "sqrtPrice";
            type: "u128";
          },
          {
            name: "activationPoint";
            type: "u64";
          },
          {
            name: "poolType";
            type: "u8";
          },
          {
            name: "isMigrated";
            type: "u8";
          },
          {
            name: "isPartnerWithdrawSurplus";
            type: "u8";
          },
          {
            name: "isProtocolWithdrawSurplus";
            type: "u8";
          },
          {
            name: "migrationProgress";
            type: "u8";
          },
          {
            name: "isWithdrawLeftover";
            type: "u8";
          },
          {
            name: "isCreatorWithdrawSurplus";
            type: "u8";
          },
          {
            name: "migrationFeeWithdrawStatus";
            type: "u8";
          },
          {
            name: "metrics";
            type: {
              defined: {
                name: "dynamic_bonding_curve::dynamic_bonding_curve::types::PoolMetrics";
              };
            };
          },
          {
            name: "finishCurveTimestamp";
            type: "u64";
          },
          {
            name: "creatorBaseFee";
            type: "u64";
          },
          {
            name: "creatorQuoteFee";
            type: "u64";
          },
          {
            name: "padding1";
            type: {
              array: ["u64", 7];
            };
          }
        ];
      };
    },
    {
      name: "volatilityTracker";
      serialization: "bytemuck";
      repr: {
        kind: "c";
      };
      type: {
        kind: "struct";
        fields: [
          {
            name: "lastUpdateTimestamp";
            type: "u64";
          },
          {
            name: "padding";
            type: {
              array: ["u8", 8];
            };
          },
          {
            name: "sqrtPriceReference";
            type: "u128";
          },
          {
            name: "volatilityAccumulator";
            type: "u128";
          },
          {
            name: "volatilityReference";
            type: "u128";
          }
        ];
      };
    },
    {
      name: "damm_v2::damm_v2::types::PoolMetrics";
      serialization: "bytemuck";
      repr: {
        kind: "c";
      };
      type: {
        kind: "struct";
        fields: [
          {
            name: "totalLpAFee";
            type: "u128";
          },
          {
            name: "totalLpBFee";
            type: "u128";
          },
          {
            name: "totalProtocolAFee";
            type: "u64";
          },
          {
            name: "totalProtocolBFee";
            type: "u64";
          },
          {
            name: "totalPartnerAFee";
            type: "u64";
          },
          {
            name: "totalPartnerBFee";
            type: "u64";
          },
          {
            name: "totalPosition";
            type: "u64";
          },
          {
            name: "padding";
            type: "u64";
          }
        ];
      };
    },
    {
      name: "dynamic_bonding_curve::dynamic_bonding_curve::types::PoolMetrics";
      serialization: "bytemuck";
      repr: {
        kind: "c";
      };
      type: {
        kind: "struct";
        fields: [
          {
            name: "totalProtocolBaseFee";
            type: "u64";
          },
          {
            name: "totalProtocolQuoteFee";
            type: "u64";
          },
          {
            name: "totalTradingBaseFee";
            type: "u64";
          },
          {
            name: "totalTradingQuoteFee";
            type: "u64";
          }
        ];
      };
    }
  ];
};
