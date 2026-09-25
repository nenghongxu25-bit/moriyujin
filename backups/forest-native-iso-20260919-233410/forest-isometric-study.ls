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
      "name": "IsometricProjection",
      "x": 667,
      "y": 95,
      "width": 0,
      "height": 0,
      "scaleY": 0.5,
      "_$child": [
        {
          "_$id": "forestIsoTiles",
          "_$type": "Sprite",
          "name": "OriginalForestTiles_8x8",
          "width": 0,
          "height": 0,
          "scaleX": 0.7071067811865476,
          "scaleY": 0.7071067811865476,
          "rotation": 45,
          "_$comp": [
            {
              "_$type": "TileMapLayer",
              "layer": 0,
              "tileSet": {
                "_$uuid": "cf4f935b-bf97-46e0-bceb-7111f80648f9",
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
                        38,
                        69
                      ],
                      "1": [
                        39
                      ],
                      "5": [
                        198
                      ],
                      "6": [
                        101,
                        133,
                        165
                      ],
                      "7": [
                        71,
                        102,
                        103,
                        134,
                        135,
                        166,
                        167,
                        199
                      ],
                      "10": [
                        128,
                        160,
                        192,
                        224
                      ],
                      "12": [
                        197,
                        230
                      ],
                      "13": [
                        231
                      ],
                      "17": [
                        70
                      ],
                      "21": [
                        6,
                        37
                      ],
                      "26": [
                        68,
                        100
                      ],
                      "27": [
                        132,
                        164,
                        196,
                        228
                      ],
                      "28": [
                        0,
                        7,
                        32,
                        64,
                        96,
                        229
                      ],
                      "35": [
                        2
                      ],
                      "36": [
                        4,
                        35
                      ],
                      "39": [
                        33
                      ],
                      "40": [
                        34
                      ],
                      "43": [
                        1
                      ],
                      "44": [
                        65,
                        97
                      ],
                      "45": [
                        129,
                        161,
                        193
                      ],
                      "46": [
                        66,
                        98,
                        130,
                        162,
                        194
                      ],
                      "47": [
                        67,
                        99,
                        131,
                        163,
                        195
                      ],
                      "50": [
                        3
                      ],
                      "51": [
                        225
                      ],
                      "52": [
                        226
                      ],
                      "53": [
                        5,
                        36,
                        227
                      ],
                      "_$type": "Record"
                    },
                    "transFlags": {
                      "0": 0,
                      "1": 0,
                      "2": 0,
                      "3": 0,
                      "4": 0,
                      "5": 0,
                      "6": 0,
                      "7": 0,
                      "32": 0,
                      "33": 0,
                      "34": 0,
                      "35": 0,
                      "36": 0,
                      "37": 0,
                      "38": 0,
                      "39": 0,
                      "64": 0,
                      "65": 0,
                      "66": 0,
                      "67": 0,
                      "68": 0,
                      "69": 0,
                      "70": 0,
                      "71": 0,
                      "96": 0,
                      "97": 0,
                      "98": 0,
                      "99": 0,
                      "100": 0,
                      "101": 0,
                      "102": 0,
                      "103": 0,
                      "128": 0,
                      "129": 0,
                      "130": 0,
                      "131": 0,
                      "132": 0,
                      "133": 0,
                      "134": 0,
                      "135": 0,
                      "160": 0,
                      "161": 0,
                      "162": 0,
                      "163": 0,
                      "164": 0,
                      "165": 0,
                      "166": 0,
                      "167": 0,
                      "192": 0,
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
      ]
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