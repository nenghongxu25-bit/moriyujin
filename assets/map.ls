{
  "_$ver": 1,
  "_$id": "xa86smod",
  "_$type": "Scene",
  "left": 0,
  "right": 0,
  "top": 0,
  "bottom": 0,
  "name": "Scene2D",
  "width": 1334,
  "height": 750,
  "_$comp": [
    {
      "_$type": "2a2a2f2f-8e35-47f1-a1b4-8b9bb74c6d31",
      "scriptPath": "../src/MapScene.ts"
    }
  ],
  "_$child": [
    {
      "_$id": "mapRoot2d",
      "_$type": "Area2D",
      "name": "MapRoot",
      "width": 1334,
      "height": 750,
      "_$child": [
        {
          "_$id": "mapBg",
          "_$type": "Sprite",
          "name": "Background",
          "width": 1334,
          "height": 750,
          "_gcmds": [
            {
              "_$type": "DrawRectCmd",
              "fillColor": "#20382d"
            }
          ]
        },
        {
          "_$id": "mapTitle",
          "_$type": "Text",
          "name": "Title",
          "x": 541,
          "y": 34,
          "width": 252,
          "height": 72,
          "text": "青槐道",
          "fontSize": 48,
          "color": "#f1dfaa",
          "bold": true,
          "align": "center",
          "valign": "middle",
          "leading": 2,
          "letterSpacing": 0
        },
        {
          "_$id": "placeListNode",
          "_$type": "GList",
          "name": "placeList",
          "x": 122,
          "y": 132,
          "width": 1090,
          "height": 560,
          "background": {
            "_$type": "DrawRectCmd",
            "lineWidth": 4,
            "lineColor": "#16231d",
            "fillColor": "#2d4739"
          },
          "layout": {
            "type": 3,
            "rowGap": 28,
            "columnGap": 28,
            "padding": [
              28,
              28,
              28,
              28
            ],
            "align": 1
          },
          "scroller": {
            "_$type": "Scroller",
            "barDisplay": 1
          },
          "_templateNode": {
            "_$ref": "placeItemTemplate",
            "_$tmpl": "itemTemplate"
          },
          "_initItemNum": 7,
          "_$child": [
            {
              "_$id": "placeItemTemplate",
              "_$type": "GWidget",
              "name": "placeItem",
              "width": 238,
              "height": 220,
              "_$child": [
                {
                  "_$id": "placeItemBg",
                  "_$type": "Sprite",
                  "name": "itemBg",
                  "width": 238,
                  "height": 220,
                  "_gcmds": [
                    {
                      "_$type": "DrawRoundRectCmd",
                      "lt": 10,
                      "rt": 10,
                      "lb": 10,
                      "rb": 10,
                      "lineWidth": 4,
                      "lineColor": "#17140d",
                      "fillColor": "#302407"
                    },
                    {
                      "_$type": "DrawRoundRectCmd",
                      "x": 8,
                      "y": 8,
                      "width": 222,
                      "height": 204,
                      "lt": 8,
                      "rt": 8,
                      "lb": 8,
                      "rb": 8,
                      "lineWidth": 2,
                      "lineColor": "#604f2f",
                      "fillColor": "#d9ca95"
                    }
                  ]
                },
                {
                  "_$id": "placeImage",
                  "_$type": "GImage",
                  "name": "placeImage",
                  "x": 22,
                  "y": 30,
                  "width": 150,
                  "height": 150,
                  "src": "res://0c077e70-1eae-4a99-841a-346a3d60d01d"
                },
                {
                  "_$id": "placeText",
                  "_$type": "GWidget",
                  "name": "placeText",
                  "x": 170,
                  "y": 36,
                  "width": 46,
                  "height": 144,
                  "_$child": [
                    {
                      "_$id": "placeTextChar0",
                      "_$type": "Text",
                      "name": "char_0",
                      "width": 46,
                      "height": 42,
                      "text": "白",
                      "fontSize": 34,
                      "color": "#ad8b13",
                      "bold": true,
                      "align": "center",
                      "valign": "middle",
                      "leading": 2,
                      "letterSpacing": 0
                    },
                    {
                      "_$id": "placeTextChar1",
                      "_$type": "Text",
                      "name": "char_1",
                      "y": 42,
                      "width": 46,
                      "height": 42,
                      "text": "杨",
                      "fontSize": 34,
                      "color": "#ad8b13",
                      "bold": true,
                      "align": "center",
                      "valign": "middle",
                      "leading": 2,
                      "letterSpacing": 0
                    },
                    {
                      "_$id": "placeTextChar2",
                      "_$type": "Text",
                      "name": "char_2",
                      "y": 84,
                      "width": 46,
                      "height": 42,
                      "text": "庄",
                      "fontSize": 34,
                      "color": "#ad8b13",
                      "bold": true,
                      "align": "center",
                      "valign": "middle",
                      "leading": 2,
                      "letterSpacing": 0
                    },
                    {
                      "_$id": "placeTextChar3",
                      "_$type": "Text",
                      "name": "char_3",
                      "y": 126,
                      "width": 46,
                      "height": 42,
                      "fontSize": 34,
                      "color": "#ad8b13",
                      "bold": true,
                      "align": "center",
                      "valign": "middle",
                      "leading": 2,
                      "letterSpacing": 0
                    },
                    {
                      "_$id": "placeTextChar4",
                      "_$type": "Text",
                      "name": "char_4",
                      "y": 168,
                      "width": 46,
                      "height": 42,
                      "fontSize": 34,
                      "color": "#ad8b13",
                      "bold": true,
                      "align": "center",
                      "valign": "middle",
                      "leading": 2,
                      "letterSpacing": 0
                    },
                    {
                      "_$id": "placeTextChar5",
                      "_$type": "Text",
                      "name": "char_5",
                      "y": 210,
                      "width": 46,
                      "height": 42,
                      "fontSize": 34,
                      "color": "#ad8b13",
                      "bold": true,
                      "align": "center",
                      "valign": "middle",
                      "leading": 2,
                      "letterSpacing": 0
                    }
                  ]
                }
              ]
            }
          ]
        },
        {
          "_$id": "m48je9jp",
          "_$type": "Sprite",
          "name": "Sprite",
          "x": 48,
          "y": 54,
          "width": 158,
          "height": 59,
          "_gcmds": [
            {
              "_$type": "DrawRectCmd",
              "lineWidth": 3,
              "lineColor": "#080908",
              "fillColor": "#35361e"
            }
          ],
          "_$child": [
            {
              "_$id": "ys8ru616",
              "_$type": "Text",
              "name": "Text",
              "width": 165,
              "height": 62,
              "text": "返回",
              "fontSize": 35,
              "color": "#ffffff",
              "align": "center",
              "valign": "middle",
              "leading": 2,
              "letterSpacing": 0
            }
          ]
        }
      ]
    },
    {
      "_$id": "oknuk3w2",
      "_$type": "Area2D",
      "name": "UI",
      "width": 1334,
      "height": 750,
      "mouseThrough": true,
      "_$child": [
        {
          "_$id": "map_location_panels",
          "_$type": "GWidget",
          "name": "MapPanels",
          "width": 1334,
          "height": 750,
          "mouseThrough": true,
          "_$child": [
            {
              "_$id": "map_panels_qinghuaidao",
              "_$type": "GWidget",
              "name": "qinghuaidaoPanels",
              "width": 1334,
              "height": 750,
              "mouseThrough": true,
              "_$child": [
                {
                  "_$id": "map_fengqiaozhen_panel",
                  "_$prefab": "7dc3a7af-8fad-4c20-8fb8-0aad24af845e",
                  "name": "fengqiaozhen",
                  "active": true,
                  "x": 0,
                  "y": 0,
                  "visible": false
                },
                {
                  "_$id": "map_huangtuji_panel",
                  "_$prefab": "dc7af013-e94a-430f-aec1-1c101d11b8a5",
                  "name": "huangtuji",
                  "active": true,
                  "x": 0,
                  "y": 0,
                  "visible": false
                },
                {
                  "_$id": "map_liujindu_panel",
                  "_$prefab": "2b150204-0e92-40f4-869d-89e8cba7db45",
                  "name": "liujindu",
                  "active": true,
                  "x": 0,
                  "y": 0,
                  "visible": false
                },
                {
                  "_$id": "map_qinghuaizong_panel",
                  "_$prefab": "b161c615-ac86-4c79-bb5e-4f9925e2780b",
                  "name": "qinghuaizong",
                  "active": true,
                  "x": 0,
                  "y": 0,
                  "visible": false
                },
                {
                  "_$id": "map_qingpingshan_panel",
                  "_$prefab": "3e6b82ce-4bd3-45fa-a577-55407dc2f583",
                  "name": "qingpingshan",
                  "active": true,
                  "x": 0,
                  "y": 0,
                  "visible": false
                },
                {
                  "_$id": "map_zhaoyangfu_panel",
                  "_$prefab": "3d7b7c22-521b-4d7a-a250-52423f267c02",
                  "name": "zhaoyangfu",
                  "active": true,
                  "x": 0,
                  "y": 0,
                  "visible": false
                }
              ]
            },
            {
              "_$id": "map_panels_yunlandao",
              "_$type": "GWidget",
              "name": "yunlandaoPanels",
              "width": 1334,
              "height": 750,
              "mouseThrough": true,
              "_$child": [
                {
                  "_$id": "map_baiyangzhuang_panel",
                  "_$prefab": "130d135c-5854-41fb-a378-3903a1ce4ae7",
                  "name": "baiyangzhuang",
                  "active": true,
                  "x": 0,
                  "y": 0,
                  "visible": false
                },
                {
                  "_$id": "map_beifenggu_panel",
                  "_$prefab": "d236b909-8171-4828-9b18-a3a5ee2adc4e",
                  "name": "beifenggu",
                  "active": true,
                  "x": 0,
                  "y": 0,
                  "visible": false
                },
                {
                  "_$id": "map_badaomen_panel",
                  "_$prefab": "acc86bea-cb28-435e-88fc-b13a999ad785",
                  "name": "badaomen",
                  "active": true,
                  "x": 0,
                  "y": 0,
                  "visible": false
                },
                {
                  "_$id": "map_yanhuishan_panel",
                  "_$prefab": "9e83fb4d-a3f7-400b-82cb-af4f1b7457b1",
                  "name": "yanhuishan",
                  "active": true,
                  "x": 0,
                  "y": 0,
                  "visible": false
                },
                {
                  "_$id": "map_beijing_panel",
                  "_$prefab": "ae1d4180-6276-4651-867c-26a61b02e311",
                  "name": "beijing",
                  "active": true,
                  "x": 0,
                  "y": 0,
                  "visible": false
                }
              ]
            },
            {
              "_$id": "map_panels_xuanjiadao",
              "_$type": "GWidget",
              "name": "xuanjiadaoPanels",
              "width": 1334,
              "height": 750,
              "mouseThrough": true,
              "_$child": [
                {
                  "_$id": "map_zhongyuecheng_panel",
                  "_$prefab": "40e147d8-8809-4f68-ba91-78260c7a00b5",
                  "name": "zhongyuecheng",
                  "active": true,
                  "x": 0,
                  "y": 0,
                  "visible": false
                },
                {
                  "_$id": "map_heishicun_panel",
                  "_$prefab": "097d07b5-b646-443d-a1f5-f21edf0064e2",
                  "name": "heishicun",
                  "active": true,
                  "x": 0,
                  "y": 0,
                  "visible": false
                },
                {
                  "_$id": "map_chentiehu_panel",
                  "_$prefab": "ecc9140c-eadb-407e-b3f9-90bf621af4b5",
                  "name": "chentiehu",
                  "active": true,
                  "x": 0,
                  "y": 0,
                  "visible": false
                },
                {
                  "_$id": "map_guixiangling_panel",
                  "_$prefab": "9719400a-5a92-46f8-ae2f-c783aa0b9a9e",
                  "name": "guixiangling",
                  "active": true,
                  "x": 0,
                  "y": 0,
                  "visible": false
                },
                {
                  "_$id": "map_xuanjiawei_panel",
                  "_$prefab": "1e050c1e-e138-4027-97f1-9c1fca019cf2",
                  "name": "xuanjiawei",
                  "active": true,
                  "x": 0,
                  "y": 0,
                  "visible": false
                },
                {
                  "_$id": "map_zhenyuezong_panel",
                  "_$prefab": "61651238-e2e9-43ee-81d0-5908f8241ad7",
                  "name": "zhenyuezong",
                  "active": true,
                  "x": 0,
                  "y": 0,
                  "visible": false
                }
              ]
            },
            {
              "_$id": "map_panels_chirangdao",
              "_$type": "GWidget",
              "name": "chirangdaoPanels",
              "width": 1334,
              "height": 750,
              "mouseThrough": true,
              "_$child": [
                {
                  "_$id": "map_jiaotupo_panel",
                  "_$prefab": "c689e3f5-d4f3-486a-be1a-176833bb4aec",
                  "name": "jiaotupo",
                  "active": true,
                  "x": 0,
                  "y": 0,
                  "visible": false
                },
                {
                  "_$id": "map_liaoyuangu_panel",
                  "_$prefab": "c8674b49-22e8-473b-9c1b-7f4fc4270f03",
                  "name": "liaoyuangu",
                  "active": true,
                  "x": 0,
                  "y": 0,
                  "visible": false
                },
                {
                  "_$id": "map_kaiyangzong_panel",
                  "_$prefab": "ebbeb85e-a5c9-43b0-ae73-4934655493bc",
                  "name": "kaiyangzong",
                  "active": true,
                  "x": 0,
                  "y": 0,
                  "visible": false
                }
              ]
            },
            {
              "_$id": "map_panels_chaoyindao",
              "_$type": "GWidget",
              "name": "chaoyindaoPanels",
              "width": 1334,
              "height": 750,
              "mouseThrough": true,
              "_$child": [
                {
                  "_$id": "map_canglangzong_panel",
                  "_$prefab": "70059386-0829-4dbe-89c6-3e2cac034a81",
                  "name": "canglangzong",
                  "active": true,
                  "x": 0,
                  "y": 0,
                  "visible": false
                },
                {
                  "_$id": "map_yewai_panel",
                  "_$prefab": "473900b7-6ff5-4682-af28-fd5b1a534dea",
                  "name": "yewai",
                  "active": true,
                  "x": 0,
                  "y": 0,
                  "visible": false
                }
              ]
            },
            {
              "_$id": "map_panels_cangwudao",
              "_$type": "GWidget",
              "name": "cangwudaoPanels",
              "width": 1334,
              "height": 750,
              "mouseThrough": true,
              "_$child": [
                {
                  "_$id": "map_cangshan_panel",
                  "_$prefab": "006792de-e6a7-4aa9-b347-a3839420711f",
                  "name": "cangshan",
                  "active": true,
                  "x": 0,
                  "y": 0,
                  "visible": false
                },
                {
                  "_$id": "map_guixugong_panel",
                  "_$prefab": "1a82bc37-b253-4c20-88d1-79858a6b8283",
                  "name": "guixugong",
                  "active": true,
                  "x": 0,
                  "y": 0,
                  "visible": false
                }
              ]
            }
          ]
        },
        {
          "_$id": "ie9shc4l",
          "_$type": "GWidget",
          "name": "node",
          "x": 1262,
          "y": 695,
          "width": 100,
          "height": 100,
          "_$child": [
            {
              "_$id": "mapDrawerButtonRole",
              "_$type": "Sprite",
              "name": "MapDrawerButtonRole",
              "x": 37,
              "y": -12,
              "width": 86,
              "height": 44,
              "alpha": 0,
              "_mouseState": 2,
              "_gcmds": [
                {
                  "_$type": "DrawRectCmd",
                  "width": 86,
                  "height": 44,
                  "lineWidth": 2,
                  "lineColor": "#d6c276",
                  "fillColor": "#1f2f2a"
                }
              ],
              "_$child": [
                {
                  "_$id": "mapDrawerButtonRoleText",
                  "_$type": "Text",
                  "name": "Text",
                  "width": 86,
                  "height": 44,
                  "text": "角色",
                  "fontSize": 20,
                  "color": "#f6e7b2",
                  "bold": true,
                  "align": "center",
                  "valign": "middle",
                  "leading": 2,
                  "letterSpacing": 0
                }
              ]
            },
            {
              "_$id": "mapDrawerButtonBag",
              "_$type": "Sprite",
              "name": "MapDrawerButtonBag",
              "x": 37,
              "y": -12,
              "width": 86,
              "height": 44,
              "visible": false,
              "alpha": 0,
              "_mouseState": 2,
              "_gcmds": [
                {
                  "_$type": "DrawRectCmd",
                  "width": 86,
                  "height": 44,
                  "lineWidth": 2,
                  "lineColor": "#d6c276",
                  "fillColor": "#1f2f2a"
                }
              ],
              "_$child": [
                {
                  "_$id": "mapDrawerButtonBagText",
                  "_$type": "Text",
                  "name": "Text",
                  "width": 86,
                  "height": 44,
                  "text": "背包",
                  "fontSize": 20,
                  "color": "#f6e7b2",
                  "bold": true,
                  "align": "center",
                  "valign": "middle",
                  "leading": 2,
                  "letterSpacing": 0
                }
              ]
            },
            {
              "_$id": "mapDrawerButtonFormation",
              "_$type": "Sprite",
              "name": "MapDrawerButtonFormation",
              "x": 37,
              "y": -12,
              "width": 86,
              "height": 44,
              "visible": false,
              "alpha": 0,
              "_mouseState": 2,
              "_gcmds": [
                {
                  "_$type": "DrawRectCmd",
                  "width": 86,
                  "height": 44,
                  "lineWidth": 2,
                  "lineColor": "#d6c276",
                  "fillColor": "#1f2f2a"
                }
              ],
              "_$child": [
                {
                  "_$id": "mapDrawerButtonFormationText",
                  "_$type": "Text",
                  "name": "Text",
                  "width": 86,
                  "height": 44,
                  "text": "阵型",
                  "fontSize": 20,
                  "color": "#f6e7b2",
                  "bold": true,
                  "align": "center",
                  "valign": "middle",
                  "leading": 2,
                  "letterSpacing": 0
                }
              ]
            },
            {
              "_$id": "mapDrawerButtonMenu",
              "_$type": "Sprite",
              "name": "MapDrawerButtonMenu",
              "x": 37,
              "y": -12,
              "width": 86,
              "height": 44,
              "visible": false,
              "alpha": 0,
              "_mouseState": 2,
              "_gcmds": [
                {
                  "_$type": "DrawRectCmd",
                  "width": 86,
                  "height": 44,
                  "lineWidth": 2,
                  "lineColor": "#d6c276",
                  "fillColor": "#1f2f2a"
                }
              ],
              "_$child": [
                {
                  "_$id": "mapDrawerButtonMenuText",
                  "_$type": "Text",
                  "name": "Text",
                  "width": 86,
                  "height": 44,
                  "text": "菜单",
                  "fontSize": 20,
                  "color": "#f6e7b2",
                  "bold": true,
                  "align": "center",
                  "valign": "middle",
                  "leading": 2,
                  "letterSpacing": 0
                }
              ]
            },
            {
              "_$id": "e75qlkap",
              "_$type": "Sprite",
              "name": "mapDrawerHead",
              "x": 21,
              "y": -15,
              "width": 100,
              "height": 100,
              "anchorX": 0.5,
              "scaleX": -0.5,
              "scaleY": 0.5,
              "_gcmds": [
                {
                  "_$type": "DrawPolyCmd",
                  "x": 0,
                  "y": 0,
                  "points": [
                    0,
                    0,
                    100,
                    50,
                    0,
                    100
                  ],
                  "lineWidth": 9,
                  "lineColor": "#000000",
                  "fillColor": "#787933"
                }
              ]
            }
          ]
        },
        {
          "_$id": "map_system_panels",
          "_$type": "GWidget",
          "name": "SystemPanels",
          "width": 1334,
          "height": 750,
          "mouseThrough": true,
          "_$child": [
            {
              "_$id": "a1b753bl",
              "_$prefab": "c7d87cb9-88a3-4fcb-85e0-cdc1abe65ce0",
              "name": "role",
              "active": true,
              "x": 0,
              "y": 0,
              "visible": false,
              "_$child": [
                {
                  "_$override": "r9jg9vb5",
                  "x": 0,
                  "y": 0
                },
                {
                  "_$override": "7z8rjetz",
                  "visible": true
                }
              ]
            },
            {
              "_$id": "map_bag_panel",
              "_$prefab": "5ad5a301-9eb7-4332-9131-aec248d76590",
              "name": "bag",
              "active": true,
              "x": 0,
              "y": 0,
              "visible": false
            },
            {
              "_$id": "pcqx5inw",
              "_$prefab": "f688351e-11b3-45c5-bb33-1e66404595ac",
              "name": "zhenxing",
              "active": true,
              "x": 0,
              "y": 0,
              "visible": false
            },
            {
              "_$id": "dm4yn9ga",
              "_$prefab": "320fd627-426d-4058-8b68-2ecb5d4a7ccc",
              "name": "Battle",
              "active": true,
              "x": 0,
              "y": 0,
              "visible": false
            }
          ]
        }
      ]
    }
  ]
}