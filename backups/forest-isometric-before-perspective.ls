{
  "_$ver": 1,
  "_$id": "forestIsoStudy",
  "_$type": "Scene",
  "left": 0,
  "right": 0,
  "top": 0,
  "bottom": 0,
  "name": "CurrentForestIsometricStudy",
  "width": 1334,
  "height": 750,
  "_$comp": [
    {
      "_$type": "86fb35d4-bffe-4012-bc9f-85f003b0b723",
      "scriptPath": "../src/systems/IsometricStudyBackdrop.ts"
    }
  ],
  "_$child": [
    {
      "_$id": "b8c2002fd002",
      "_$type": "Sprite",
      "name": "SoilFoundation",
      "x": 155,
      "y": 95,
      "width": 1024,
      "height": 562,
      "texture": {
        "_$uuid": "aabb3941-df85-49eb-aba9-9853b2f2aba4",
        "_$type": "Texture"
      }
    },
    {
      "_$id": "forestIsoView",
      "_$type": "Sprite",
      "name": "NativeIsometricGround",
      "x": 91,
      "y": 95,
      "width": 0,
      "height": 0,
      "scaleY": 1,
      "_$child": [
        {
          "_$id": "forestIsoTiles",
          "_$type": "Sprite",
          "name": "ForestDiamondTiles_8x8",
          "width": 0,
          "height": 0,
          "scaleX": 1,
          "scaleY": 1,
          "rotation": 0,
          "_$comp": [
            {
              "_$type": "TileMapLayer",
              "layer": 0,
              "tileSet": {
                "_$uuid": "5889eb93-13f3-4dcc-8f73-5a27909be63f",
                "_$type": "TileSet"
              },
              "chunkDatas": {
                "0": {
                  "0": {
                    "_$type": "TileMapChunkData",
                    "chunkX": 0,
                    "chunkY": 0,
                    "compressData": {
                      "0": [
                        230,
                        229
                      ],
                      "1": [
                        263
                      ],
                      "5": [
                        388
                      ],
                      "6": [
                        261,
                        292,
                        324
                      ],
                      "7": [
                        294,
                        293,
                        326,
                        325,
                        357,
                        356,
                        389,
                        420
                      ],
                      "10": [
                        130,
                        161,
                        193,
                        224
                      ],
                      "12": [
                        355,
                        419
                      ],
                      "13": [
                        452
                      ],
                      "17": [
                        262
                      ],
                      "21": [
                        199,
                        198
                      ],
                      "26": [
                        197,
                        228
                      ],
                      "27": [
                        260,
                        291,
                        323,
                        354
                      ],
                      "28": [
                        4,
                        231,
                        35,
                        67,
                        98,
                        387
                      ],
                      "35": [
                        69
                      ],
                      "36": [
                        134,
                        133
                      ],
                      "39": [
                        68
                      ],
                      "40": [
                        100
                      ],
                      "43": [
                        36
                      ],
                      "44": [
                        99,
                        131
                      ],
                      "45": [
                        162,
                        194,
                        225
                      ],
                      "46": [
                        132,
                        163,
                        195,
                        226,
                        258
                      ],
                      "47": [
                        164,
                        196,
                        227,
                        259,
                        290
                      ],
                      "50": [
                        101
                      ],
                      "51": [
                        257
                      ],
                      "52": [
                        289
                      ],
                      "53": [
                        166,
                        165,
                        322
                      ],
                      "_$type": "Record"
                    },
                    "transFlags": {
                      "4": 0,
                      "35": 0,
                      "36": 0,
                      "67": 0,
                      "68": 0,
                      "69": 0,
                      "98": 0,
                      "99": 0,
                      "100": 0,
                      "101": 0,
                      "130": 0,
                      "131": 0,
                      "132": 0,
                      "133": 0,
                      "134": 0,
                      "161": 0,
                      "162": 0,
                      "163": 0,
                      "164": 0,
                      "165": 0,
                      "166": 0,
                      "193": 0,
                      "194": 0,
                      "195": 0,
                      "196": 0,
                      "197": 0,
                      "198": 0,
                      "199": 0,
                      "224": 0,
                      "225": 0,
                      "226": 0,
                      "227": 0,
                      "228": 0,
                      "229": 0,
                      "230": 0,
                      "231": 0,
                      "257": 0,
                      "258": 0,
                      "259": 0,
                      "260": 0,
                      "261": 0,
                      "262": 0,
                      "263": 0,
                      "289": 0,
                      "290": 0,
                      "291": 0,
                      "292": 0,
                      "293": 0,
                      "294": 0,
                      "322": 0,
                      "323": 0,
                      "324": 0,
                      "325": 0,
                      "326": 0,
                      "354": 0,
                      "355": 0,
                      "356": 0,
                      "357": 0,
                      "387": 0,
                      "388": 0,
                      "389": 0,
                      "419": 0,
                      "420": 0,
                      "452": 0,
                      "_$type": "Record"
                    }
                  },
                  "_$type": "Record"
                },
                "_$type": "Record"
              }
            }
          ]
        }
      ],
      "scaleX": 1
    },
    {
      "_$id": "0630ba6976b9",
      "_$type": "Sprite",
      "name": "ContactShadows",
      "width": 0,
      "height": 0,
      "_$child": [
        {
          "_$id": "05de2694ea8d",
          "_$type": "Sprite",
          "name": "ContactShadow1",
          "x": 554,
          "y": 185,
          "width": 84,
          "height": 22,
          "alpha": 0.24,
          "texture": {
            "_$uuid": "56ad4f56-850e-4430-b8b9-a59c2ccc5368",
            "_$type": "Texture"
          }
        },
        {
          "_$id": "47b4f259a498",
          "_$type": "Sprite",
          "name": "ContactShadow2",
          "x": 435,
          "y": 239,
          "width": 94,
          "height": 22,
          "alpha": 0.24,
          "texture": {
            "_$uuid": "56ad4f56-850e-4430-b8b9-a59c2ccc5368",
            "_$type": "Texture"
          }
        },
        {
          "_$id": "1c304a2078e0",
          "_$type": "Sprite",
          "name": "ContactShadow3",
          "x": 1041,
          "y": 345,
          "width": 83,
          "height": 22,
          "alpha": 0.24,
          "texture": {
            "_$uuid": "56ad4f56-850e-4430-b8b9-a59c2ccc5368",
            "_$type": "Texture"
          }
        },
        {
          "_$id": "79668a30d68c",
          "_$type": "Sprite",
          "name": "ContactShadow4",
          "x": 511,
          "y": 505,
          "width": 66,
          "height": 22,
          "alpha": 0.24,
          "texture": {
            "_$uuid": "56ad4f56-850e-4430-b8b9-a59c2ccc5368",
            "_$type": "Texture"
          }
        },
        {
          "_$id": "a23150ffd2a3",
          "_$type": "Sprite",
          "name": "ContactShadow5",
          "x": 491,
          "y": 204,
          "width": 52,
          "height": 14,
          "alpha": 0.24,
          "texture": {
            "_$uuid": "56ad4f56-850e-4430-b8b9-a59c2ccc5368",
            "_$type": "Texture"
          }
        },
        {
          "_$id": "d2a188fc1f6d",
          "_$type": "Sprite",
          "name": "ContactShadow6",
          "x": 906,
          "y": 263,
          "width": 47,
          "height": 14,
          "alpha": 0.24,
          "texture": {
            "_$uuid": "56ad4f56-850e-4430-b8b9-a59c2ccc5368",
            "_$type": "Texture"
          }
        },
        {
          "_$id": "1e05b87e9746",
          "_$type": "Sprite",
          "name": "ContactShadow7",
          "x": 495,
          "y": 479,
          "width": 44,
          "height": 14,
          "alpha": 0.24,
          "texture": {
            "_$uuid": "56ad4f56-850e-4430-b8b9-a59c2ccc5368",
            "_$type": "Texture"
          }
        },
        {
          "_$id": "f8fa933f2752",
          "_$type": "Sprite",
          "name": "ContactShadow8",
          "x": 799,
          "y": 339,
          "width": 50,
          "height": 14,
          "alpha": 0.24,
          "texture": {
            "_$uuid": "56ad4f56-850e-4430-b8b9-a59c2ccc5368",
            "_$type": "Texture"
          }
        },
        {
          "_$id": "9c0a9a7617e3",
          "_$type": "Sprite",
          "name": "ContactShadow9",
          "x": 711,
          "y": 395,
          "width": 38,
          "height": 14,
          "alpha": 0.24,
          "texture": {
            "_$uuid": "56ad4f56-850e-4430-b8b9-a59c2ccc5368",
            "_$type": "Texture"
          }
        },
        {
          "_$id": "3ceb83328ca2",
          "_$type": "Sprite",
          "name": "ContactShadow10",
          "x": 597,
          "y": 454,
          "width": 44,
          "height": 14,
          "alpha": 0.24,
          "texture": {
            "_$uuid": "56ad4f56-850e-4430-b8b9-a59c2ccc5368",
            "_$type": "Texture"
          }
        },
        {
          "_$id": "0d34058a4f23",
          "_$type": "Sprite",
          "name": "ContactShadow11",
          "x": 577,
          "y": 291,
          "width": 47,
          "height": 14,
          "alpha": 0.24,
          "texture": {
            "_$uuid": "56ad4f56-850e-4430-b8b9-a59c2ccc5368",
            "_$type": "Texture"
          }
        },
        {
          "_$id": "b36e64cfeb44",
          "_$type": "Sprite",
          "name": "ContactShadow12",
          "x": 378,
          "y": 339,
          "width": 77,
          "height": 14,
          "alpha": 0.24,
          "texture": {
            "_$uuid": "56ad4f56-850e-4430-b8b9-a59c2ccc5368",
            "_$type": "Texture"
          }
        }
      ]
    },
    {
      "_$id": "c1545241e0c2",
      "_$type": "Sprite",
      "name": "ForestProps",
      "width": 0,
      "height": 0,
      "_$child": [
        {
          "_$id": "4a4912f8bdeb",
          "_$type": "Sprite",
          "name": "pine0",
          "x": 534,
          "y": 14,
          "width": 112,
          "height": 177,
          "texture": {
            "_$uuid": "fd40b293-e4cf-48bb-8dad-39153833012c",
            "_$type": "Texture"
          },
          "zIndex": 191
        },
        {
          "_$id": "8558dc8f5994",
          "_$type": "Sprite",
          "name": "shrub4",
          "x": 479,
          "y": 151,
          "width": 69,
          "height": 59,
          "texture": {
            "_$uuid": "aead6b2d-9829-41ce-b711-20f80bbcda33",
            "_$type": "Texture"
          },
          "zIndex": 210
        },
        {
          "_$id": "8db813e2269d",
          "_$type": "Sprite",
          "name": "pine1",
          "x": 413,
          "y": 50,
          "width": 125,
          "height": 195,
          "texture": {
            "_$uuid": "fd40b293-e4cf-48bb-8dad-39153833012c",
            "_$type": "Texture"
          },
          "zIndex": 245
        },
        {
          "_$id": "a8d5fa074aa2",
          "_$type": "Sprite",
          "name": "shrub5",
          "x": 895,
          "y": 215,
          "width": 63,
          "height": 54,
          "texture": {
            "_$uuid": "aead6b2d-9829-41ce-b711-20f80bbcda33",
            "_$type": "Texture"
          },
          "zIndex": 269
        },
        {
          "_$id": "b5ded66d7a1a",
          "_$type": "Sprite",
          "name": "rocks10",
          "x": 566,
          "y": 235,
          "width": 62,
          "height": 62,
          "texture": {
            "_$uuid": "0eda0cc4-5877-4b07-86cb-f798f89ae9f4",
            "_$type": "Texture"
          },
          "zIndex": 297
        },
        {
          "_$id": "c357cfe4ce0e",
          "_$type": "Sprite",
          "name": "rocks7",
          "x": 788,
          "y": 279,
          "width": 66,
          "height": 66,
          "texture": {
            "_$uuid": "0eda0cc4-5877-4b07-86cb-f798f89ae9f4",
            "_$type": "Texture"
          },
          "zIndex": 345
        },
        {
          "_$id": "36a84685e4c0",
          "_$type": "Sprite",
          "name": "log11",
          "x": 360,
          "y": 291,
          "width": 102,
          "height": 54,
          "texture": {
            "_$uuid": "32c98b15-5115-4cd2-b6b6-c53466d44492",
            "_$type": "Texture"
          },
          "zIndex": 345
        },
        {
          "_$id": "0e71fc6af7a5",
          "_$type": "Sprite",
          "name": "pine2",
          "x": 1022,
          "y": 177,
          "width": 110,
          "height": 174,
          "texture": {
            "_$uuid": "fd40b293-e4cf-48bb-8dad-39153833012c",
            "_$type": "Texture"
          },
          "zIndex": 351
        },
        {
          "_$id": "73ae544e22bc",
          "_$type": "Sprite",
          "name": "rocks8",
          "x": 702,
          "y": 350,
          "width": 51,
          "height": 51,
          "texture": {
            "_$uuid": "0eda0cc4-5877-4b07-86cb-f798f89ae9f4",
            "_$type": "Texture"
          },
          "zIndex": 401
        },
        {
          "_$id": "d450bd5fb64f",
          "_$type": "Sprite",
          "name": "rocks9",
          "x": 586,
          "y": 401,
          "width": 59,
          "height": 59,
          "texture": {
            "_$uuid": "0eda0cc4-5877-4b07-86cb-f798f89ae9f4",
            "_$type": "Texture"
          },
          "zIndex": 460
        },
        {
          "_$id": "c9a6b5bed6cc",
          "_$type": "Sprite",
          "name": "shrub6",
          "x": 484,
          "y": 435,
          "width": 58,
          "height": 50,
          "texture": {
            "_$uuid": "aead6b2d-9829-41ce-b711-20f80bbcda33",
            "_$type": "Texture"
          },
          "zIndex": 485
        },
        {
          "_$id": "8017388786ef",
          "_$type": "Sprite",
          "name": "pine3",
          "x": 495,
          "y": 372,
          "width": 88,
          "height": 139,
          "texture": {
            "_$uuid": "fd40b293-e4cf-48bb-8dad-39153833012c",
            "_$type": "Texture"
          },
          "zIndex": 511
        }
      ]
    }
  ]
}