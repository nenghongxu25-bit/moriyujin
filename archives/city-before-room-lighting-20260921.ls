{
  "_$ver": 1,
  "_$id": "mb5bnnmd",
  "_$type": "Scene",
  "left": 0,
  "right": 0,
  "top": 0,
  "bottom": 0,
  "name": "Scene2D",
  "width": 1334,
  "height": 750,
  "_$child": [
    {
      "_$id": "kiapfapq",
      "_$type": "Area2D",
      "name": "Area2D",
      "width": 600,
      "height": 400,
      "_$child": [
        {
          "_$id": "n5yvm4yq",
          "_$type": "Sprite",
          "name": "GroundLayer",
          "width": 100,
          "height": 100,
          "_$child": [
            {
              "_$id": "zwna46k0",
              "_$type": "Sprite",
              "name": "Sprite",
              "width": 100,
              "height": 100,
              "_$comp": [
                {
                  "_$type": "TileMapLayer",
                  "layer": 0,
                  "tileSet": {
                    "_$uuid": "0d5d01c9-256b-4f25-8943-5ff0bf6f37fe",
                    "_$type": "TileSet"
                  },
                  "chunkDatas": {
                    "0": {
                      "0": {
                        "_$type": "TileMapChunkData",
                        "chunkX": 0,
                        "chunkY": 0,
                        "compressData": {
                          "_$type": "Record"
                        },
                        "transFlags": {
                          "_$type": "Record"
                        }
                      },
                      "_$type": "Record",
                      "-1": {
                        "_$type": "TileMapChunkData",
                        "chunkX": -1,
                        "chunkY": 0,
                        "compressData": {
                          "_$type": "Record"
                        },
                        "transFlags": {
                          "_$type": "Record"
                        }
                      }
                    },
                    "1": {
                      "0": {
                        "_$type": "TileMapChunkData",
                        "chunkX": 0,
                        "chunkY": 1,
                        "compressData": {
                          "_$type": "Record"
                        },
                        "transFlags": {
                          "_$type": "Record"
                        }
                      },
                      "_$type": "Record",
                      "-1": {
                        "_$type": "TileMapChunkData",
                        "chunkX": -1,
                        "chunkY": 1,
                        "compressData": {
                          "_$type": "Record"
                        },
                        "transFlags": {
                          "_$type": "Record"
                        }
                      }
                    },
                    "_$type": "Record",
                    "-1": {
                      "0": {
                        "_$type": "TileMapChunkData",
                        "chunkX": 0,
                        "chunkY": -1,
                        "compressData": {
                          "_$type": "Record"
                        },
                        "transFlags": {
                          "_$type": "Record"
                        }
                      },
                      "_$type": "Record",
                      "-1": {
                        "_$type": "TileMapChunkData",
                        "chunkX": -1,
                        "chunkY": -1,
                        "compressData": {
                          "_$type": "Record"
                        },
                        "transFlags": {
                          "_$type": "Record"
                        }
                      }
                    }
                  }
                }
              ]
            }
          ]
        },
        {
          "_$id": "1dd7791d7c38",
          "_$type": "Sprite",
          "name": "GroundDecorLayer",
          "width": 0,
          "height": 0
        },
        {
          "_$id": "0qs978kd",
          "_$type": "Sprite",
          "name": "ActorLayer",
          "x": -709,
          "y": 890,
          "width": 100,
          "height": 100,
          "_$comp": [
            {
              "_$type": "b12949e1-407e-4c07-8171-35559e231554",
              "scriptPath": "../src/systems/ActorLayerGroups.ts",
              "groupNames": "Characters,Walls,Containers,Props"
            }
          ],
          "_$child": [
            {
              "_$id": "ed4883ce4da5",
              "_$type": "Sprite",
              "name": "Characters",
              "width": 0,
              "height": 0,
              "_$child": [
                {
                  "_$id": "rqegugxn",
                  "_$prefab": "5ea8d755-d42c-43c2-b0e6-04787ff545f0",
                  "name": "prefab_player",
                  "active": true,
                  "x": 264,
                  "y": 121,
                  "visible": true,
                  "_$comp": [
                    {
                      "_$override": "76db1d2e-7130-4636-8470-c6615ed7950b",
                      "joystickNode": {
                        "_$ref": [
                          "d6pfw814",
                          "drk6pui3",
                          "9xqe96ru",
                          "0jvaucmc"
                        ]
                      },
                      "spineNode": {
                        "_$ref": [
                          "rqegugxn",
                          "b1t7v9q2"
                        ]
                      },
                      "attackNode": {
                        "_$ref": [
                          "rqegugxn",
                          "51e5hoju"
                        ]
                      },
                      "detectNode": {
                        "_$ref": [
                          "rqegugxn",
                          "51e5hoju"
                        ]
                      }
                    }
                  ],
                  "_$child": [
                    {
                      "_$override": "b1t7v9q2",
                      "x": 0,
                      "y": 0,
                      "_$comp": [
                        {
                          "_$override": "Spine2DRenderNode",
                          "animationName": "attack/attack_ranged_bow",
                          "loop": true
                        }
                      ]
                    }
                  ]
                }
              ]
            },
            {
              "_$id": "68f5db05ddf6",
              "_$type": "Sprite",
              "name": "Containers",
              "width": 0,
              "height": 0,
              "_$child": [
                {
                  "_$id": "rs0wyelr",
                  "_$prefab": "0b6aa9b7-3b50-4932-bc26-4e007cbb2844",
                  "name": "pobudai",
                  "active": true,
                  "x": 563,
                  "y": -1024,
                  "visible": true
                },
                {
                  "_$id": "svprzngi",
                  "_$prefab": "b80a1fe8-e691-41d6-b5d9-419cf767589e",
                  "name": "zhanlipin",
                  "active": true,
                  "x": -301,
                  "y": -1120,
                  "visible": true
                },
                {
                  "_$id": "4h1gz3ao",
                  "_$prefab": "79e4edda-d379-436b-b44c-beadd48d8789",
                  "name": "kongtou",
                  "active": true,
                  "x": 1834,
                  "y": -63,
                  "visible": true
                }
              ]
            },
            {
              "_$id": "4346eee642c8",
              "_$type": "Sprite",
              "name": "Props",
              "width": 0,
              "height": 0,
              "_$child": [
                {
                  "_$id": "ynvov9u6",
                  "_$type": "GImage",
                  "name": "img",
                  "x": 432,
                  "y": -35,
                  "width": 768,
                  "height": 615,
                  "src": "res://18a5185a-1dc8-4cef-9853-8aa69e9d6ce7"
                }
              ]
            },
            {
              "_$id": "8gemi96l",
              "_$type": "Sprite",
              "name": "Wall",
              "width": 100,
              "height": 100,
              "_$comp": [
                {
                  "_$type": "TileMapLayer",
                  "layer": 0,
                  "tileSet": {
                    "_$uuid": "cf7460c7-b221-42c4-a998-ffb820d138f3",
                    "_$type": "TileSet"
                  },
                  "chunkDatas": {
                    "0": {
                      "0": {
                        "_$type": "TileMapChunkData",
                        "chunkX": 0,
                        "chunkY": 0,
                        "compressData": {
                          "_$type": "Record"
                        },
                        "transFlags": {
                          "_$type": "Record"
                        }
                      },
                      "_$type": "Record",
                      "-1": {
                        "_$type": "TileMapChunkData",
                        "chunkX": -1,
                        "chunkY": 0,
                        "compressData": {
                          "5": [
                            93,
                            125,
                            158,
                            190,
                            223,
                            255
                          ],
                          "9": [
                            60
                          ],
                          "10": [
                            29
                          ],
                          "_$type": "Record"
                        },
                        "transFlags": {
                          "29": 0,
                          "60": 0,
                          "93": 0,
                          "125": 0,
                          "158": 0,
                          "190": 0,
                          "223": 0,
                          "255": 0,
                          "_$type": "Record"
                        }
                      }
                    },
                    "_$type": "Record",
                    "-1": {
                      "0": {
                        "_$type": "TileMapChunkData",
                        "chunkX": 0,
                        "chunkY": -1,
                        "compressData": {
                          "3": [
                            832
                          ],
                          "5": [
                            864,
                            897
                          ],
                          "7": [
                            929,
                            962
                          ],
                          "8": [
                            993,
                            961
                          ],
                          "_$type": "Record"
                        },
                        "transFlags": {
                          "832": 0,
                          "864": 0,
                          "897": 0,
                          "929": 0,
                          "961": 0,
                          "962": 0,
                          "993": 0,
                          "_$type": "Record"
                        }
                      },
                      "_$type": "Record",
                      "-1": {
                        "_$type": "TileMapChunkData",
                        "chunkX": -1,
                        "chunkY": -1,
                        "compressData": {
                          "10": [
                            1021,
                            990,
                            958,
                            927,
                            895
                          ],
                          "_$type": "Record"
                        },
                        "transFlags": {
                          "895": 0,
                          "927": 0,
                          "958": 0,
                          "990": 0,
                          "1021": 0,
                          "_$type": "Record"
                        }
                      }
                    }
                  }
                },
                {
                  "_$type": "818f8acf-a35f-42d4-b285-b2d8b67d5af8",
                  "scriptPath": "../src/systems/BrickWallTileLayer.ts",
                  "actorLayer": null,
                  "occludedAlpha": 0.28,
                  "occlusionFadeSeconds": 0.18
                }
              ]
            }
          ]
        },
        {
          "_$id": "73d5ab10a04e",
          "_$type": "Sprite",
          "name": "RoofLayer",
          "width": 0,
          "height": 0
        },
        {
          "_$id": "nightlayer",
          "_$type": "Sprite",
          "name": "LightingLayer",
          "x": 651,
          "y": 394,
          "width": 1334,
          "height": 750,
          "cacheAs": "bitmap",
          "_$comp": [
            {
              "_$type": "7f27ea9f-45c4-4a5a-9f28-99cf250706b9",
              "scriptPath": "../src/debug/DynamicCutoutProbe.ts",
              "cutoutNode": null,
              "targetNode": {
                "_$ref": "rqegugxn"
              },
              "demoMotion": false,
              "directionalLight": true,
              "rearOffset": 0,
              "leftX": 40,
              "rightX": 230,
              "speed": 120,
              "directionSmoothTime": 0.045,
              "positionSmoothTime": 0,
              "diagnosticsEnabled": false,
              "lightningEnabled": true,
              "lightningIntensity": 0.88,
              "lightningDuration": 0.5,
              "lightningMinInterval": 2,
              "lightningMaxInterval": 2
            }
          ],
          "_$child": [
            {
              "_$id": "blackrect",
              "_$type": "Sprite",
              "name": "black_rect",
              "x": -667,
              "y": -375,
              "width": 1334,
              "height": 750,
              "alpha": 0.8,
              "_gcmds": [
                {
                  "_$type": "DrawRectCmd",
                  "fillColor": "#000000"
                }
              ]
            },
            {
              "_$id": "circlecutout",
              "_$type": "Sprite",
              "name": "circle_cutout",
              "width": 1491,
              "height": 2597,
              "anchorX": 0.5,
              "anchorY": 0.5,
              "texture": {
                "_$uuid": "1abf2cf8-b940-4d63-994c-b9ec9f8da0b2",
                "_$type": "Texture"
              },
              "blendMode": "destinationOut",
              "_mouseState": 1
            },
            {
              "_$id": "visionglow",
              "_$type": "Sprite",
              "name": "vision_glow",
              "width": 1239,
              "height": 1239,
              "anchorX": 0.5,
              "anchorY": 0.5,
              "texture": {
                "_$uuid": "cf8b9242-e647-4a65-9583-6952b5513b38",
                "_$type": "Texture"
              },
              "_mouseState": 1
            },
            {
              "_$id": "roomlitlower",
              "_$type": "Sprite",
              "name": "room_light_cutout_lower",
              "width": 2179,
              "height": 891,
              "visible": false,
              "texture": {
                "_$uuid": "c5cba251-ae46-4487-98b5-1d2282647d45",
                "_$type": "Texture"
              },
              "blendMode": "destinationOut",
              "_mouseState": 1
            },
            {
              "_$id": "roomlitupper",
              "_$type": "Sprite",
              "name": "room_light_cutout_upper",
              "width": 2179,
              "height": 1029,
              "visible": false,
              "texture": {
                "_$uuid": "4876f987-dbc9-4b18-b9a6-9d4e938d33ed",
                "_$type": "Texture"
              },
              "blendMode": "destinationOut",
              "_mouseState": 1
            },
            {
              "_$id": "fire1cutout",
              "_$type": "Sprite",
              "name": "fire1_cutout",
              "width": 523,
              "height": 479,
              "visible": false,
              "texture": {
                "_$uuid": "a0df9fa1-674f-439b-a3d0-2e741d39f8ae",
                "_$type": "Texture"
              },
              "blendMode": "destinationOut",
              "_mouseState": 1
            },
            {
              "_$id": "roomlitthird",
              "_$type": "Sprite",
              "name": "room_light_cutout_third",
              "width": 2302,
              "height": 2040,
              "visible": false,
              "texture": {
                "_$uuid": "b7a3d10a-64c8-43ac-9036-17e052ba915f",
                "_$type": "Texture"
              },
              "blendMode": "destinationOut",
              "_mouseState": 1
            }
          ]
        },
        {
          "_$id": "c0d33178804a",
          "_$type": "Sprite",
          "name": "EffectLayer",
          "width": 0,
          "height": 0,
          "_$child": [
            {
              "_$id": "cv5ioqn7",
              "_$type": "Sprite",
              "name": "fire",
              "x": -871,
              "y": 692,
              "width": 100,
              "height": 100,
              "_$child": [
                {
                  "_$id": "4xs2fgny",
                  "_$type": "Sprite",
                  "name": "fire1",
                  "x": -154,
                  "y": -136,
                  "width": 523,
                  "height": 479,
                  "alpha": 0.16,
                  "texture": {
                    "_$uuid": "2ef73fda-f151-4f4b-8eb2-4c9bcb188a23",
                    "_$type": "Texture"
                  },
                  "_mouseState": 1,
                  "_$comp": [
                    {
                      "_$type": "dfe8f345-1fcf-4f4d-967b-fbef9a9fa1b9",
                      "scriptPath": "../src/debug/FireVisualLight.ts",
                      "cutoutNode": {
                        "_$ref": "fire1cutout"
                      },
                      "intensity": 0.9,
                      "warmIntensity": 0.16
                    }
                  ]
                },
                {
                  "_$id": "jsceq87a",
                  "_$type": "Sprite",
                  "name": "fire1_1",
                  "x": -898,
                  "y": 34,
                  "width": 523,
                  "height": 479,
                  "alpha": 0.16,
                  "texture": {
                    "_$uuid": "2ef73fda-f151-4f4b-8eb2-4c9bcb188a23",
                    "_$type": "Texture"
                  },
                  "_mouseState": 1,
                  "_$comp": [
                    {
                      "_$type": "dfe8f345-1fcf-4f4d-967b-fbef9a9fa1b9",
                      "scriptPath": "../src/debug/FireVisualLight.ts",
                      "cutoutNode": {
                        "_$ref": "fire1cutout"
                      },
                      "intensity": 0.9,
                      "warmIntensity": 0.16
                    }
                  ]
                },
                {
                  "_$id": "585aonbs",
                  "_$type": "Sprite",
                  "name": "fire1_2",
                  "x": 779,
                  "y": 204,
                  "width": 523,
                  "height": 479,
                  "alpha": 0.16,
                  "texture": {
                    "_$uuid": "2ef73fda-f151-4f4b-8eb2-4c9bcb188a23",
                    "_$type": "Texture"
                  },
                  "_mouseState": 1,
                  "_$comp": [
                    {
                      "_$type": "dfe8f345-1fcf-4f4d-967b-fbef9a9fa1b9",
                      "scriptPath": "../src/debug/FireVisualLight.ts",
                      "cutoutNode": {
                        "_$ref": "fire1cutout"
                      },
                      "intensity": 0.9,
                      "warmIntensity": 0.16
                    }
                  ]
                }
              ]
            }
          ]
        },
        {
          "_$id": "3aa18388205b",
          "_$type": "Sprite",
          "name": "LogicLayer",
          "width": 0,
          "height": 0,
          "_$child": [
            {
              "_$id": "6yr4tk5w",
              "_$type": "Sprite",
              "name": "BlockLayer",
              "width": 100,
              "height": 100,
              "_$comp": [
                {
                  "_$type": "TileMapLayer",
                  "layer": 0,
                  "chunkDatas": {
                    "_$type": "Record"
                  }
                }
              ]
            },
            {
              "_$id": "l4rkmdmi",
              "_$type": "Sprite",
              "name": "InteractLayer",
              "x": -146,
              "y": -134,
              "width": 100,
              "height": 100,
              "_$child": [
                {
                  "_$id": "x9o7n9tk",
                  "_$type": "Sprite",
                  "name": "container",
                  "width": 100,
                  "height": 100,
                  "_$child": [
                    {
                      "_$id": "zpnxyblh",
                      "_$type": "Sprite",
                      "name": "pobudai",
                      "width": 100,
                      "height": 100
                    },
                    {
                      "_$id": "p51xdvt7",
                      "_$type": "Sprite",
                      "name": "zhanlipin",
                      "width": 100,
                      "height": 100
                    },
                    {
                      "_$id": "unhgt8l4",
                      "_$type": "Sprite",
                      "name": "kongtou",
                      "x": 1271,
                      "y": 961,
                      "width": 100,
                      "height": 100
                    }
                  ]
                }
              ]
            },
            {
              "_$id": "w8efo6iv",
              "_$type": "Sprite",
              "name": "roomnight",
              "x": -1334,
              "y": -435,
              "width": 100,
              "height": 100,
              "_mouseState": 1,
              "_$comp": [
                {
                  "_$type": "b0f26c1a-7564-48ad-a3b9-a1b836acf471",
                  "scriptPath": "../src/debug/RoomNightController.ts",
                  "targetNode": {
                    "_$ref": "rqegugxn"
                  },
                  "nightLayer": {
                    "_$ref": "nightlayer"
                  },
                  "isNight": true,
                  "combineRooms": false,
                  "diagnosticsEnabled": false
                }
              ],
              "_$child": [
                {
                  "_$id": "wz1yvcfq",
                  "_$type": "Sprite",
                  "name": "Sprite",
                  "x": -413,
                  "y": -72,
                  "width": 2179,
                  "height": 891,
                  "texture": {
                    "_$uuid": "c5cba251-ae46-4487-98b5-1d2282647d45",
                    "_$type": "Texture"
                  },
                  "_$comp": [
                    {
                      "_$type": "ea0adccf-1276-4447-bd10-35cd1242e487",
                      "scriptPath": "../src/debug/RoomNightZone.ts",
                      "lightsOn": true,
                      "nightCutout": {
                        "_$ref": "roomlitlower"
                      },
                      "flashlightCutout": {
                        "_$ref": "roomtorch0"
                      },
                      "outsideAlpha": 1,
                      "insideAlpha": 0.25,
                      "fadeSeconds": 0.5,
                      "exitFadeSeconds": 0.3,
                      "exitPadding": 6
                    }
                  ],
                  "_$child": [
                    {
                      "_$id": "roomtorch0",
                      "_$type": "Sprite",
                      "name": "room_flashlight_cutout",
                      "width": 512,
                      "height": 512,
                      "visible": false,
                      "texture": {
                        "_$uuid": "1abf2cf8-b940-4d63-994c-b9ec9f8da0b2",
                        "_$type": "Texture"
                      },
                      "blendMode": "destinationOut",
                      "_mouseState": 1
                    }
                  ]
                },
                {
                  "_$id": "l2kdgz79",
                  "_$type": "Sprite",
                  "name": "Sprite_1",
                  "x": -418,
                  "y": -1102,
                  "width": 2179,
                  "height": 1029,
                  "texture": {
                    "_$uuid": "4876f987-dbc9-4b18-b9a6-9d4e938d33ed",
                    "_$type": "Texture"
                  },
                  "_$comp": [
                    {
                      "_$type": "ea0adccf-1276-4447-bd10-35cd1242e487",
                      "scriptPath": "../src/debug/RoomNightZone.ts",
                      "lightsOn": true,
                      "nightCutout": {
                        "_$ref": "roomlitupper"
                      },
                      "flashlightCutout": {
                        "_$ref": "roomtorch1"
                      },
                      "outsideAlpha": 1,
                      "insideAlpha": 0.25,
                      "fadeSeconds": 0.5,
                      "exitFadeSeconds": 0.3,
                      "exitPadding": 6
                    }
                  ],
                  "_$child": [
                    {
                      "_$id": "roomtorch1",
                      "_$type": "Sprite",
                      "name": "room_flashlight_cutout",
                      "width": 512,
                      "height": 512,
                      "visible": false,
                      "texture": {
                        "_$uuid": "1abf2cf8-b940-4d63-994c-b9ec9f8da0b2",
                        "_$type": "Texture"
                      },
                      "blendMode": "destinationOut",
                      "_mouseState": 1
                    }
                  ]
                },
                {
                  "_$id": "6t72zypy",
                  "_$type": "Sprite",
                  "name": "Sprite_2",
                  "x": -551,
                  "y": 2108,
                  "width": 2302,
                  "height": 2040,
                  "texture": {
                    "_$uuid": "b7a3d10a-64c8-43ac-9036-17e052ba915f",
                    "_$type": "Texture"
                  },
                  "_$comp": [
                    {
                      "_$type": "ea0adccf-1276-4447-bd10-35cd1242e487",
                      "scriptPath": "../src/debug/RoomNightZone.ts",
                      "lightsOn": true,
                      "nightCutout": {
                        "_$ref": "roomlitthird"
                      },
                      "flashlightCutout": {
                        "_$ref": "roomtorch2"
                      },
                      "outsideAlpha": 1,
                      "insideAlpha": 0.25,
                      "fadeSeconds": 0.5,
                      "exitFadeSeconds": 0.3,
                      "exitPadding": 6
                    }
                  ],
                  "_$child": [
                    {
                      "_$id": "roomtorch2",
                      "_$type": "Sprite",
                      "name": "room_flashlight_cutout",
                      "width": 512,
                      "height": 512,
                      "visible": false,
                      "texture": {
                        "_$uuid": "1abf2cf8-b940-4d63-994c-b9ec9f8da0b2",
                        "_$type": "Texture"
                      },
                      "blendMode": "destinationOut",
                      "_mouseState": 1
                    }
                  ]
                }
              ]
            }
          ]
        }
      ]
    },
    {
      "_$id": "d6pfw814",
      "_$prefab": "cfd9bf89-d9c8-421b-a48b-1dc3b28bbec2",
      "name": "UILayer",
      "active": true,
      "x": -15,
      "y": 0,
      "visible": true,
      "_$child": [
        {
          "_$override": [
            "drk6pui3",
            "run_ui"
          ],
          "_$comp": [
            {
              "_$override": "3e46d646-50d0-4380-9afa-0544eff22c4e",
              "playerNode": null
            }
          ]
        },
        {
          "_$override": [
            "drk6pui3",
            "bag_ui"
          ],
          "_$comp": [
            {
              "_$override": "2938a217-4272-4f6d-aaf2-984b61320b26",
              "targetNode": {
                "_$ref": [
                  "d6pfw814",
                  "p8xgvne7"
                ]
              }
            }
          ]
        },
        {
          "_$override": [
            "drk6pui3",
            "ej1msfiy"
          ],
          "_$comp": [
            {
              "_$type": "2938a217-4272-4f6d-aaf2-984b61320b26",
              "scriptPath": "../src/OpenSprite.ts",
              "targetNode": {
                "_$ref": "5eop3uyr"
              },
              "actionId": ""
            }
          ]
        },
        {
          "_$override": [
            "drk6pui3",
            "g39wgkh6"
          ],
          "visible": false,
          "_$comp": [
            {
              "_$override": "10034fdc-629a-4e30-8bc7-32dc80a0683f",
              "playerNode": null
            }
          ]
        },
        {
          "_$override": "p8xgvne7",
          "name": "BagPanel",
          "visible": false
        },
        {
          "_$override": [
            "p8xgvne7",
            "vzkfe927"
          ],
          "_$comp": [
            {
              "_$override": "14d09e1b-aa6f-4bcf-afc1-cf0226a43024",
              "targetNode": {
                "_$ref": [
                  "d6pfw814",
                  "p8xgvne7"
                ]
              }
            }
          ]
        },
        {
          "_$id": "5eop3uyr",
          "_$prefab": "952f2456-5258-42ea-9928-7fa0dc233070",
          "_$index": 2,
          "name": "MakePanel",
          "active": true,
          "x": 0,
          "y": 0,
          "visible": false,
          "_$comp": [
            {
              "_$override": "e7a82e0d-ec39-4ac1-9518-f70baf987b54",
              "messageTextNode": null
            }
          ]
        },
        {
          "_$id": "jahrahe2",
          "_$type": "GWidget",
          "name": "jiesuan",
          "width": 1334,
          "height": 750,
          "visible": false,
          "_$child": [
            {
              "_$id": "tfjp6a07",
              "_$type": "Sprite",
              "name": "Sprite",
              "width": 1334,
              "height": 750,
              "alpha": 0.7,
              "_gcmds": [
                {
                  "_$type": "DrawRectCmd",
                  "fillColor": "#293832"
                }
              ]
            },
            {
              "_$id": "2zn499va",
              "_$type": "Text",
              "name": "Text",
              "x": 116,
              "y": 58,
              "width": 430,
              "height": 138,
              "text": "撤离成功",
              "fontSize": 32,
              "color": "#eee9d9",
              "bold": true,
              "align": "center",
              "valign": "middle",
              "leading": 2,
              "letterSpacing": 0
            },
            {
              "_$id": "w26g1fgt",
              "_$type": "Text",
              "name": "Text_1",
              "x": 133,
              "y": 199,
              "width": 388,
              "height": 137,
              "text": "本次探索时间：10分钟20秒",
              "fontSize": 32,
              "color": "#eee9d9",
              "valign": "middle",
              "leading": 2,
              "letterSpacing": 0
            },
            {
              "_$id": "xieapjto",
              "_$type": "Text",
              "name": "Text_2",
              "x": 135,
              "y": 291,
              "width": 524,
              "height": 140,
              "text": "本次探索带出价值：100k",
              "fontSize": 32,
              "color": "#eee9d9",
              "bold": true,
              "valign": "middle",
              "leading": 2,
              "letterSpacing": 0
            },
            {
              "_$id": "lsbrdewx",
              "_$type": "Text",
              "name": "Text_3",
              "x": 132,
              "y": 375,
              "width": 542,
              "height": 163,
              "text": "本次探索累计击败敌人：20个",
              "fontSize": 32,
              "color": "#eee9d9",
              "bold": true,
              "valign": "middle",
              "leading": 2,
              "letterSpacing": 0
            },
            {
              "_$id": "lnt5scmr",
              "_$type": "Text",
              "name": "Text_4",
              "x": 127,
              "y": 484,
              "width": 199,
              "height": 112,
              "text": "带出物资：",
              "fontSize": 32,
              "color": "#eee9d9",
              "valign": "middle",
              "leading": 2,
              "letterSpacing": 0
            },
            {
              "_$id": "5673uh4a",
              "_$type": "GList",
              "name": "list",
              "x": 331,
              "y": 490,
              "width": 911,
              "height": 244,
              "layout": {
                "type": 3
              },
              "scroller": {
                "_$type": "Scroller",
                "barDisplay": 5,
                "vScrollBarRes": {
                  "_$uuid": "eb7cd798-7a10-46c5-b85f-cdc935a78181",
                  "_$type": "Prefab"
                }
              },
              "_templateNode": {
                "_$ref": "khgzecva",
                "_$tmpl": "itemTemplate"
              },
              "_initItemNum": 20,
              "_$child": [
                {
                  "_$id": "khgzecva",
                  "_$prefab": "a7a8c4f4-7ee8-4b25-ae02-f70166546db5",
                  "name": "boxmodule",
                  "active": true,
                  "x": 0,
                  "y": 0,
                  "visible": true
                }
              ]
            }
          ]
        }
      ]
    }
  ]
}