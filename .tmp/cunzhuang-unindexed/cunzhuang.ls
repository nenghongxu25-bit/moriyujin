{
  "_$ver": 1,
  "_$id": "w3oo9tbb",
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
      "_$id": "y8e6vyis",
      "_$type": "Sprite",
      "name": "UILayer",
      "width": 100,
      "height": 100,
      "_$child": [
        {
          "_$id": "lobby_chrome",
          "_$type": "Sprite",
          "name": "LobbyChrome",
          "width": 1334,
          "height": 750,
          "_mouseState": 1,
          "_$child": [
            {
              "_$id": "lobby_backdrop",
              "_$type": "GWidget",
              "name": "BackdropShade",
              "width": 1334,
              "height": 750,
              "alpha": 0.58,
              "_mouseState": 1,
              "background": {
                "_$type": "DrawRectCmd",
                "lineWidth": 1,
                "lineColor": "#111615",
                "fillColor": "#111615"
              }
            },
            {
              "_$id": "lobby_left_panel",
              "_$type": "GWidget",
              "name": "LeftMenuPanel",
              "x": 22,
              "y": 146,
              "width": 238,
              "height": 428,
              "alpha": 0.9,
              "_mouseState": 1,
              "background": {
                "_$type": "DrawRectCmd",
                "lineWidth": 1,
                "lineColor": "#34433e",
                "fillColor": "#111917"
              }
            },
            {
              "_$id": "lobby_left_accent",
              "_$type": "GWidget",
              "name": "LeftAccent",
              "x": 20,
              "y": 150,
              "width": 7,
              "height": 424,
              "_mouseState": 1,
              "background": {
                "_$type": "DrawRectCmd",
                "lineWidth": 1,
                "lineColor": "#b5a56f",
                "fillColor": "#b5a56f"
              }
            },
            {
              "_$id": "lobby_top_panel",
              "_$type": "GWidget",
              "name": "TopStatusPanel",
              "x": 350,
              "y": 22,
              "width": 610,
              "height": 66,
              "alpha": 0.9,
              "_mouseState": 1,
              "background": {
                "_$type": "DrawRectCmd",
                "lineWidth": 1,
                "lineColor": "#35433f",
                "fillColor": "#141b1a"
              }
            },
            {
              "_$id": "lobby_scene_title",
              "_$type": "Text",
              "name": "SceneTitle",
              "x": 378,
              "y": 31,
              "width": 540,
              "height": 28,
              "_mouseState": 1,
              "text": "柯恩币  —     金券  —     凭证  —",
              "font": "Microsoft YaHei",
              "fontSize": 22,
              "color": "#eee9d9",
              "bold": true,
              "leading": 2,
              "letterSpacing": 0
            },
            {
              "_$id": "lobby_scene_subtitle",
              "_$type": "Text",
              "name": "SceneSubtitle",
              "x": 379,
              "y": 59,
              "width": 370,
              "height": 20,
              "_mouseState": 1,
              "text": "物资账户 / 点击货币区域查看明细",
              "font": "Microsoft YaHei",
              "fontSize": 12,
              "color": "#87928d",
              "leading": 2,
              "letterSpacing": 0
            },
            {
              "_$id": "lobby_right_panel",
              "_$type": "GWidget",
              "name": "ActionPanel",
              "x": 1030,
              "y": 116,
              "width": 278,
              "height": 405,
              "alpha": 0.9,
              "_mouseState": 1,
              "background": {
                "_$type": "DrawRectCmd",
                "lineWidth": 1,
                "lineColor": "#34433e",
                "fillColor": "#111917"
              }
            },
            {
              "_$id": "lobby_action_title",
              "_$type": "Text",
              "name": "ActionTitle",
              "x": 1054,
              "y": 132,
              "width": 220,
              "height": 30,
              "_mouseState": 1,
              "text": "行动情报",
              "font": "Microsoft YaHei",
              "fontSize": 22,
              "color": "#eee9d9",
              "bold": true,
              "leading": 2,
              "letterSpacing": 0
            },
            {
              "_$id": "lobby_action_hint",
              "_$type": "Text",
              "name": "ActionHint",
              "x": 1055,
              "y": 164,
              "width": 225,
              "height": 42,
              "_mouseState": 1,
              "text": "战区动态与限时行动将在此处展示",
              "font": "Microsoft YaHei",
              "fontSize": 13,
              "color": "#8e9a94",
              "wordWrap": true,
              "leading": 5,
              "letterSpacing": 0
            },
            {
              "_$id": "lobby_profile_panel",
              "_$type": "GWidget",
              "name": "ProfilePanel",
              "x": 28,
              "y": 22,
              "width": 300,
              "height": 78,
              "alpha": 0.94,
              "_mouseState": 1,
              "background": {
                "_$type": "DrawRectCmd",
                "lineWidth": 1,
                "lineColor": "#43534d",
                "fillColor": "#15201d"
              }
            },
            {
              "_$id": "lobby_profile_name",
              "_$type": "Text",
              "name": "ProfileName",
              "x": 52,
              "y": 34,
              "width": 245,
              "height": 28,
              "text": "幸存者档案",
              "font": "Microsoft YaHei",
              "fontSize": 21,
              "color": "#eee9d9",
              "bold": true,
              "leading": 2,
              "letterSpacing": 0
            },
            {
              "_$id": "profile_hit_area",
              "_$type": "Sprite",
              "name": "ProfileHitArea",
              "x": 28,
              "y": 22,
              "width": 300,
              "height": 78,
              "_mouseState": 2,
              "_$comp": [
                {
                  "_$type": "2938a217-4272-4f6d-aaf2-984b61320b26",
                  "scriptPath": "../src/OpenSprite.ts",
                  "targetNode": {
                    "_$ref": "profile_page"
                  },
                  "actionId": ""
                }
              ]
            },
            {
              "_$id": "lobby_profile_level",
              "_$type": "Text",
              "name": "ProfileLevel",
              "x": 53,
              "y": 66,
              "width": 245,
              "height": 20,
              "text": "等级 —  ·  段位 —",
              "font": "Microsoft YaHei",
              "fontSize": 13,
              "color": "#8e9a94",
              "leading": 2,
              "letterSpacing": 0
            },
            {
              "_$id": "lobby_top_tools",
              "_$type": "Text",
              "name": "TopTools",
              "x": 985,
              "y": 40,
              "width": 320,
              "height": 38,
              "text": "战绩   电视台   资料   邮件   设置",
              "font": "Microsoft YaHei",
              "fontSize": 15,
              "color": "#d8d4c5",
              "align": "right",
              "valign": "middle",
              "leading": 2,
              "letterSpacing": 1
            },
            {
              "_$id": "lobby_promo_panel",
              "_$type": "GWidget",
              "name": "PromoPanel",
              "x": 1052,
              "y": 202,
              "width": 234,
              "height": 78,
              "_mouseState": 1,
              "background": {
                "_$type": "DrawRectCmd",
                "lineWidth": 1,
                "lineColor": "#655842",
                "fillColor": "#252921"
              }
            },
            {
              "_$id": "lobby_promo_text",
              "_$type": "Text",
              "name": "PromoText",
              "x": 1068,
              "y": 214,
              "width": 200,
              "height": 56,
              "text": "暗区行动\n物资带出，风险自负",
              "font": "Microsoft YaHei",
              "fontSize": 18,
              "color": "#d8c99b",
              "bold": true,
              "leading": 6,
              "letterSpacing": 0
            },
            {
              "_$id": "lobby_season_panel",
              "_$type": "GWidget",
              "name": "SeasonPanel",
              "x": 28,
              "y": 642,
              "width": 455,
              "height": 76,
              "alpha": 0.92,
              "_mouseState": 1,
              "background": {
                "_$type": "DrawRectCmd",
                "lineWidth": 1,
                "lineColor": "#3d4844",
                "fillColor": "#131918"
              }
            },
            {
              "_$id": "lobby_season_text",
              "_$type": "Text",
              "name": "SeasonText",
              "x": 48,
              "y": 655,
              "width": 410,
              "height": 48,
              "text": "S1  赛季手册     段位     赛季挑战     档案",
              "font": "Microsoft YaHei",
              "fontSize": 18,
              "color": "#d6d2c4",
              "valign": "middle",
              "leading": 2,
              "letterSpacing": 0
            },
            {
              "_$id": "lobby_mode_text",
              "_$type": "Text",
              "name": "ModeText",
              "x": 1038,
              "y": 556,
              "width": 260,
              "height": 34,
              "text": "指挥官扮演        训练",
              "font": "Microsoft YaHei",
              "fontSize": 17,
              "color": "#d6d2c4",
              "align": "center",
              "valign": "middle",
              "leading": 2,
              "letterSpacing": 0
            }
          ]
        },
        {
          "_$id": "mubhrxi2",
          "_$type": "Sprite",
          "name": "button",
          "width": 100,
          "height": 100,
          "_$child": [
            {
              "_$id": "at5wnocg",
              "_$prefab": "e5f6cdc4-8abc-4212-b51b-3127183b1042",
              "name": "OpenSprite",
              "active": true,
              "x": 1068,
              "y": 594,
              "scaleX": 1.16,
              "scaleY": 1,
              "visible": true,
              "_$comp": [
                {
                  "_$override": "2938a217-4272-4f6d-aaf2-984b61320b26",
                  "targetNode": {
                    "_$ref": "lessrwbh"
                  }
                }
              ],
              "_$child": [
                {
                  "_$override": "6k3sv098",
                  "text": "进入暗区",
                  "color": "#eee9d9"
                }
              ]
            },
            {
              "_$id": "3dmjv2yk",
              "_$prefab": "e5f6cdc4-8abc-4212-b51b-3127183b1042",
              "name": "OpenSprite_1",
              "active": true,
              "x": 42,
              "y": 409,
              "scaleX": 0.9,
              "scaleY": 0.78,
              "visible": true,
              "_$comp": [
                {
                  "_$override": "2938a217-4272-4f6d-aaf2-984b61320b26",
                  "targetNode": {
                    "_$ref": "shop_panel"
                  }
                }
              ],
              "_$child": [
                {
                  "_$override": "6k3sv098",
                  "text": "市场",
                  "color": "#eee9d9"
                }
              ]
            },
            {
              "_$id": "h79bmpvd",
              "_$prefab": "e5f6cdc4-8abc-4212-b51b-3127183b1042",
              "name": "OpenSprite_2",
              "active": true,
              "x": 42,
              "y": 489,
              "scaleX": 0.9,
              "scaleY": 0.78,
              "visible": true,
              "_$comp": [
                {
                  "_$override": "2938a217-4272-4f6d-aaf2-984b61320b26",
                  "targetNode": {
                    "_$ref": "customization_page"
                  }
                }
              ],
              "_$child": [
                {
                  "_$override": "6k3sv098",
                  "text": "装扮",
                  "color": "#eee9d9"
                }
              ]
            },
            {
              "_$id": "ck42nxn7",
              "_$prefab": "e5f6cdc4-8abc-4212-b51b-3127183b1042",
              "name": "OpenSprite_3",
              "active": true,
              "x": 42,
              "y": 249,
              "scaleX": 0.9,
              "scaleY": 0.78,
              "visible": true,
              "_$comp": [
                {
                  "_$override": "2938a217-4272-4f6d-aaf2-984b61320b26",
                  "targetNode": {
                    "_$ref": "contacts_page"
                  }
                }
              ],
              "_$child": [
                {
                  "_$override": "6k3sv098",
                  "text": "联络人",
                  "color": "#eee9d9"
                }
              ]
            },
            {
              "_$id": "6zyxbh28",
              "_$prefab": "e5f6cdc4-8abc-4212-b51b-3127183b1042",
              "name": "OpenSprite_4",
              "active": true,
              "x": 1172,
              "y": 410,
              "scaleX": 0.5,
              "scaleY": 1,
              "visible": true,
              "_$comp": [
                {
                  "_$override": "2938a217-4272-4f6d-aaf2-984b61320b26",
                  "targetNode": null
                }
              ],
              "_$child": [
                {
                  "_$override": "6k3sv098",
                  "text": "工区",
                  "color": "#eee9d9"
                }
              ]
            },
            {
              "_$id": "5d3fujtq",
              "_$prefab": "e5f6cdc4-8abc-4212-b51b-3127183b1042",
              "name": "OpenSprite_5",
              "active": true,
              "x": 42,
              "y": 329,
              "scaleX": 0.9,
              "scaleY": 0.78,
              "visible": true,
              "_$comp": [
                {
                  "_$override": "2938a217-4272-4f6d-aaf2-984b61320b26",
                  "targetNode": null
                }
              ],
              "_$child": [
                {
                  "_$override": "6k3sv098",
                  "text": "改枪",
                  "color": "#eee9d9"
                }
              ]
            },
            {
              "_$id": "gebxfo6v",
              "_$prefab": "7f94452e-acc7-43a7-8e9c-27fe070a2873",
              "name": "buttonmodule_2",
              "active": true,
              "x": 1054,
              "y": 300,
              "visible": true,
              "_$comp": [
                {
                  "_$type": "2938a217-4272-4f6d-aaf2-984b61320b26",
                  "scriptPath": "../src/OpenSprite.ts",
                  "targetNode": {
                    "_$ref": "shop_panel"
                  },
                  "actionId": ""
                }
              ],
              "_$child": [
                {
                  "_$override": "tz6yo96j",
                  "text": "商城",
                  "color": "#eee9d9"
                },
                {
                  "_$override": "n392fqkh",
                  "visible": true
                }
              ]
            },
            {
              "_$id": "lk32kav8",
              "_$prefab": "e5f6cdc4-8abc-4212-b51b-3127183b1042",
              "name": "OpenSprite_6",
              "active": true,
              "x": 42,
              "y": 169,
              "scaleX": 0.9,
              "scaleY": 0.78,
              "visible": true,
              "_$comp": [
                {
                  "_$override": "2938a217-4272-4f6d-aaf2-984b61320b26",
                  "targetNode": {
                    "_$ref": "warehouse_panel"
                  }
                }
              ],
              "_$child": [
                {
                  "_$override": "6k3sv098",
                  "text": "角色",
                  "color": "#eee9d9"
                }
              ]
            },
            {
              "_$id": "ehmqv3fy",
              "_$prefab": "7f94452e-acc7-43a7-8e9c-27fe070a2873",
              "name": "buttonmodule_3",
              "active": true,
              "x": 1172,
              "y": 300,
              "visible": true,
              "_$child": [
                {
                  "_$override": "tz6yo96j",
                  "text": "活动",
                  "color": "#eee9d9"
                },
                {
                  "_$override": "n392fqkh",
                  "visible": true
                }
              ]
            },
            {
              "_$id": "d57e1jd3",
              "_$prefab": "7f94452e-acc7-43a7-8e9c-27fe070a2873",
              "name": "buttonmodule_4",
              "active": true,
              "x": 1054,
              "y": 410,
              "visible": true,
              "_$comp": [
                {
                  "_$type": "2938a217-4272-4f6d-aaf2-984b61320b26",
                  "scriptPath": "../src/OpenSprite.ts",
                  "targetNode": {
                    "_$ref": "mail_panel"
                  },
                  "actionId": ""
                }
              ],
              "_$child": [
                {
                  "_$override": "tz6yo96j",
                  "text": "邮件",
                  "color": "#eee9d9"
                },
                {
                  "_$override": "n392fqkh",
                  "visible": true
                }
              ]
            }
          ]
        },
        {
          "_$id": "fm9nno5m",
          "_$type": "Sprite",
          "name": "panel",
          "width": 100,
          "height": 100,
          "_$child": [
            {
              "_$id": "lessrwbh",
              "_$prefab": "73ecaedc-782b-45f4-9ec4-b0ab7333b96c",
              "name": "mapchoose",
              "active": true,
              "x": 0,
              "y": 0,
              "visible": false
            },
            {
              "_$id": "warehouse_panel",
              "_$prefab": "9bf2effb-3f48-4c83-8ac7-38f62f17e5a2",
              "name": "warehouse_panel",
              "active": true,
              "x": 0,
              "y": 0,
              "visible": false
            },
            {
              "_$id": "shop_panel",
              "_$prefab": "12820c93-821e-4387-a85d-a11fec2970ed",
              "name": "ShopPanel",
              "active": true,
              "x": 0,
              "y": 0,
              "visible": false
            },
            {
              "_$id": "mail_panel",
              "_$prefab": "a59fd96f-ba7b-4f76-9899-82f97c113bd7",
              "name": "MailPanel",
              "active": true,
              "x": 0,
              "y": 0,
              "visible": false
            },
            {
              "_$id": "profile_page",
              "_$type": "Sprite",
              "name": "DarkZoneProfilePage",
              "width": 1334,
              "height": 750,
              "visible": false,
              "_mouseState": 2,
              "_$child": [
                {
                  "_$id": "profile_bg",
                  "_$type": "GWidget",
                  "name": "Background",
                  "width": 1334,
                  "height": 750,
                  "background": {
                    "_$type": "DrawRectCmd",
                    "lineWidth": 1,
                    "lineColor": "#0e1215",
                    "fillColor": "#0e1215"
                  }
                },
                {
                  "_$id": "profile_header",
                  "_$type": "GWidget",
                  "name": "Header",
                  "width": 1334,
                  "height": 82,
                  "background": {
                    "_$type": "DrawRectCmd",
                    "lineWidth": 1,
                    "lineColor": "#303839",
                    "fillColor": "#191e20"
                  }
                },
                {
                  "_$id": "profile_title",
                  "_$type": "Text",
                  "name": "Title",
                  "x": 48,
                  "y": 19,
                  "width": 260,
                  "height": 42,
                  "text": "个人信息",
                  "font": "Microsoft YaHei",
                  "fontSize": 29,
                  "color": "#eee9d9",
                  "bold": true,
                  "leading": 2,
                  "letterSpacing": 0
                },
                {
                  "_$id": "profile_tabs",
                  "_$type": "Text",
                  "name": "Tabs",
                  "x": 330,
                  "y": 23,
                  "width": 620,
                  "height": 38,
                  "text": "基本信息     战斗信息     历史战绩     评价历史",
                  "font": "Microsoft YaHei",
                  "fontSize": 20,
                  "color": "#b8beb7",
                  "align": "center",
                  "valign": "middle",
                  "leading": 2,
                  "letterSpacing": 1
                },
                {
                  "_$id": "profile_close",
                  "_$prefab": "6f77c7a8-c0f0-492d-81b0-f10e0e52a6b4",
                  "name": "Close",
                  "active": true,
                  "x": 1120,
                  "y": 7,
                  "visible": true,
                  "_$comp": [
                    {
                      "_$override": "14d09e1b-aa6f-4bcf-afc1-cf0226a43024",
                      "targetNode": {
                        "_$ref": "profile_page"
                      }
                    }
                  ],
                  "_$child": [
                    {
                      "_$override": "feo6uqqp",
                      "text": "返回",
                      "fontSize": 20
                    }
                  ]
                },
                {
                  "_$id": "profile_left",
                  "_$type": "GWidget",
                  "name": "ProfileCard",
                  "x": 52,
                  "y": 118,
                  "width": 438,
                  "height": 490,
                  "background": {
                    "_$type": "DrawRectCmd",
                    "lineWidth": 1,
                    "lineColor": "#303839",
                    "fillColor": "#151b1d"
                  }
                },
                {
                  "_$id": "profile_card_title",
                  "_$type": "Text",
                  "name": "CardTitle",
                  "x": 78,
                  "y": 142,
                  "width": 380,
                  "height": 36,
                  "text": "幸存者档案",
                  "font": "Microsoft YaHei",
                  "fontSize": 24,
                  "color": "#eee9d9",
                  "bold": true,
                  "leading": 2,
                  "letterSpacing": 0
                },
                {
                  "_$id": "profile_card_info",
                  "_$type": "Text",
                  "name": "CardInfo",
                  "x": 80,
                  "y": 192,
                  "width": 360,
                  "height": 150,
                  "text": "等级        —\n战队        未加入\n赛季等级    S1\n最高段位    —",
                  "font": "Microsoft YaHei",
                  "fontSize": 20,
                  "color": "#b8beb7",
                  "leading": 18,
                  "letterSpacing": 0
                },
                {
                  "_$id": "profile_goal_title",
                  "_$type": "Text",
                  "name": "GoalTitle",
                  "x": 80,
                  "y": 390,
                  "width": 360,
                  "height": 30,
                  "text": "赛季目标",
                  "font": "Microsoft YaHei",
                  "fontSize": 20,
                  "color": "#eee9d9",
                  "bold": true,
                  "leading": 2,
                  "letterSpacing": 0
                },
                {
                  "_$id": "profile_goal_info",
                  "_$type": "Text",
                  "name": "GoalInfo",
                  "x": 80,
                  "y": 432,
                  "width": 360,
                  "height": 118,
                  "text": "最高段位       未定\n赛季挑战       0 / 84\n档案收集       0 / 90",
                  "font": "Microsoft YaHei",
                  "fontSize": 18,
                  "color": "#8e9a94",
                  "leading": 16,
                  "letterSpacing": 0
                },
                {
                  "_$id": "profile_right",
                  "_$type": "GWidget",
                  "name": "StatsCard",
                  "x": 850,
                  "y": 118,
                  "width": 430,
                  "height": 490,
                  "background": {
                    "_$type": "DrawRectCmd",
                    "lineWidth": 1,
                    "lineColor": "#303839",
                    "fillColor": "#151b1d"
                  }
                },
                {
                  "_$id": "profile_stats_title",
                  "_$type": "Text",
                  "name": "StatsTitle",
                  "x": 882,
                  "y": 142,
                  "width": 370,
                  "height": 36,
                  "text": "战斗信息",
                  "font": "Microsoft YaHei",
                  "fontSize": 24,
                  "color": "#eee9d9",
                  "bold": true,
                  "leading": 2,
                  "letterSpacing": 0
                },
                {
                  "_$id": "profile_stats",
                  "_$type": "Text",
                  "name": "Stats",
                  "x": 884,
                  "y": 208,
                  "width": 360,
                  "height": 270,
                  "text": "撤离率                 —\n战局数                 —\n累计淘汰数             —\n战损比                 —\n累计净赚价值           —\n平均行动时长           —",
                  "font": "Microsoft YaHei",
                  "fontSize": 19,
                  "color": "#c8c4b5",
                  "leading": 21,
                  "letterSpacing": 0
                },
                {
                  "_$id": "profile_footer",
                  "_$type": "GWidget",
                  "name": "Footer",
                  "x": 52,
                  "y": 642,
                  "width": 1228,
                  "height": 70,
                  "background": {
                    "_$type": "DrawRectCmd",
                    "lineWidth": 1,
                    "lineColor": "#303839",
                    "fillColor": "#191e20"
                  }
                },
                {
                  "_$id": "profile_footer_text",
                  "_$type": "Text",
                  "name": "FooterText",
                  "x": 80,
                  "y": 659,
                  "width": 1150,
                  "height": 34,
                  "text": "个人据点          仓库价值 —          游戏时长 —          战局数 —",
                  "font": "Microsoft YaHei",
                  "fontSize": 18,
                  "color": "#b8beb7",
                  "valign": "middle",
                  "leading": 2,
                  "letterSpacing": 0
                }
              ]
            },
            {
              "_$id": "contacts_page",
              "_$type": "Sprite",
              "name": "DarkZoneContactsPage",
              "width": 1334,
              "height": 750,
              "visible": false,
              "_mouseState": 2,
              "_$child": [
                {
                  "_$id": "contacts_bg",
                  "_$type": "GWidget",
                  "name": "Background",
                  "width": 1334,
                  "height": 750,
                  "background": {
                    "_$type": "DrawRectCmd",
                    "lineWidth": 1,
                    "lineColor": "#0e1215",
                    "fillColor": "#0e1215"
                  }
                },
                {
                  "_$id": "contacts_header",
                  "_$type": "GWidget",
                  "name": "Header",
                  "width": 1334,
                  "height": 82,
                  "background": {
                    "_$type": "DrawRectCmd",
                    "lineWidth": 1,
                    "lineColor": "#303839",
                    "fillColor": "#191e20"
                  }
                },
                {
                  "_$id": "contacts_title",
                  "_$type": "Text",
                  "name": "Title",
                  "x": 48,
                  "y": 19,
                  "width": 300,
                  "height": 42,
                  "text": "联络人",
                  "font": "Microsoft YaHei",
                  "fontSize": 29,
                  "color": "#eee9d9",
                  "bold": true,
                  "leading": 2,
                  "letterSpacing": 0
                },
                {
                  "_$id": "contacts_close",
                  "_$prefab": "6f77c7a8-c0f0-492d-81b0-f10e0e52a6b4",
                  "name": "Close",
                  "active": true,
                  "x": 1120,
                  "y": 7,
                  "visible": true,
                  "_$comp": [
                    {
                      "_$override": "14d09e1b-aa6f-4bcf-afc1-cf0226a43024",
                      "targetNode": {
                        "_$ref": "contacts_page"
                      }
                    }
                  ],
                  "_$child": [
                    {
                      "_$override": "feo6uqqp",
                      "text": "返回",
                      "fontSize": 20
                    }
                  ]
                },
                {
                  "_$id": "contacts_hint",
                  "_$type": "Text",
                  "name": "Hint",
                  "x": 52,
                  "y": 102,
                  "width": 1050,
                  "height": 34,
                  "text": "任务联络人       物资联络人       武器配件联络人       赛季物资联络人",
                  "font": "Microsoft YaHei",
                  "fontSize": 18,
                  "color": "#8e9a94",
                  "leading": 2,
                  "letterSpacing": 0
                },
                {
                  "_$id": "contacts_card_grid",
                  "_$type": "Sprite",
                  "name": "ContactCardGrid",
                  "x": 42,
                  "y": 150,
                  "width": 1240,
                  "height": 500,
                  "_$child": [
                    {"_$id":"cc1","_$type":"GWidget","x":0,"y":0,"width":370,"height":132,"background":{"_$type":"DrawRectCmd","lineWidth":1,"lineColor":"#8b7650","fillColor":"#18211f"}},
                    {"_$id":"cc2","_$type":"GWidget","x":410,"y":0,"width":370,"height":132,"background":{"_$type":"DrawRectCmd","lineWidth":1,"lineColor":"#43534d","fillColor":"#151d1c"}},
                    {"_$id":"cc3","_$type":"GWidget","x":820,"y":0,"width":370,"height":132,"background":{"_$type":"DrawRectCmd","lineWidth":1,"lineColor":"#43534d","fillColor":"#151d1c"}},
                    {"_$id":"cc4","_$type":"GWidget","x":0,"y":160,"width":370,"height":132,"background":{"_$type":"DrawRectCmd","lineWidth":1,"lineColor":"#43534d","fillColor":"#151d1c"}},
                    {"_$id":"cc5","_$type":"GWidget","x":410,"y":160,"width":370,"height":132,"background":{"_$type":"DrawRectCmd","lineWidth":1,"lineColor":"#43534d","fillColor":"#151d1c"}},
                    {"_$id":"cc6","_$type":"GWidget","x":820,"y":160,"width":370,"height":132,"background":{"_$type":"DrawRectCmd","lineWidth":1,"lineColor":"#43534d","fillColor":"#151d1c"}},
                    {"_$id":"cc7","_$type":"GWidget","x":0,"y":320,"width":370,"height":132,"background":{"_$type":"DrawRectCmd","lineWidth":1,"lineColor":"#43534d","fillColor":"#151d1c"}},
                    {"_$id":"cc8","_$type":"GWidget","x":410,"y":320,"width":370,"height":132,"background":{"_$type":"DrawRectCmd","lineWidth":1,"lineColor":"#43534d","fillColor":"#151d1c"}},
                    {"_$id":"cc9","_$type":"GWidget","x":820,"y":320,"width":370,"height":132,"background":{"_$type":"DrawRectCmd","lineWidth":1,"lineColor":"#43534d","fillColor":"#151d1c"}}
                  ]
                },
                {
                  "_$id": "contacts_cards",
                  "_$type": "Text",
                  "name": "Cards",
                  "x": 82,
                  "y": 170,
                  "width": 1160,
                  "height": 420,
                  "text": "乔尔·加里森                 拉里·马里亚姆              迪克·文森\n任务联络人                    医疗用品联络人               限时商品联络人\n\n艾薇塔                       兰德尔·费舍              罗德里格斯\n防具容器联络人                武器配件联络人               赛季物资联络人\n\n巴蒂斯塔·杜邦                加文·麦康奈尔              回收商·迈尔斯\n银行联络人                    派遣联络人                 生化物资回收员",
                  "font": "Microsoft YaHei",
                  "fontSize": 22,
                  "color": "#d6d2c4",
                  "leading": 32,
                  "letterSpacing": 0
                }
              ]
            },
            {
              "_$id": "customization_page",
              "_$type": "Sprite",
              "name": "DarkZoneCustomizationPage",
              "width": 1334,
              "height": 750,
              "visible": false,
              "_mouseState": 2,
              "_$child": [
                {
                  "_$id": "custom_bg",
                  "_$type": "GWidget",
                  "name": "Background",
                  "width": 1334,
                  "height": 750,
                  "background": {
                    "_$type": "DrawRectCmd",
                    "lineWidth": 1,
                    "lineColor": "#0e1215",
                    "fillColor": "#0e1215"
                  }
                },
                {
                  "_$id": "custom_header",
                  "_$type": "GWidget",
                  "name": "Header",
                  "width": 1334,
                  "height": 82,
                  "background": {
                    "_$type": "DrawRectCmd",
                    "lineWidth": 1,
                    "lineColor": "#303839",
                    "fillColor": "#191e20"
                  }
                },
                {
                  "_$id": "custom_title",
                  "_$type": "Text",
                  "name": "Title",
                  "x": 48,
                  "y": 19,
                  "width": 300,
                  "height": 42,
                  "text": "个性化",
                  "font": "Microsoft YaHei",
                  "fontSize": 29,
                  "color": "#eee9d9",
                  "bold": true,
                  "leading": 2,
                  "letterSpacing": 0
                },
                {
                  "_$id": "custom_close",
                  "_$prefab": "6f77c7a8-c0f0-492d-81b0-f10e0e52a6b4",
                  "name": "Close",
                  "active": true,
                  "x": 1120,
                  "y": 7,
                  "visible": true,
                  "_$comp": [
                    {
                      "_$override": "14d09e1b-aa6f-4bcf-afc1-cf0226a43024",
                      "targetNode": {
                        "_$ref": "customization_page"
                      }
                    }
                  ],
                  "_$child": [
                    {
                      "_$override": "feo6uqqp",
                      "text": "返回",
                      "fontSize": 20
                    }
                  ]
                },
                {
                  "_$id": "custom_tabs",
                  "_$type": "Text",
                  "name": "Tabs",
                  "x": 330,
                  "y": 23,
                  "width": 650,
                  "height": 38,
                  "text": "枪械        个性资源        装备涂装        近战武器        角色与外观",
                  "font": "Microsoft YaHei",
                  "fontSize": 20,
                  "color": "#b8beb7",
                  "align": "center",
                  "valign": "middle",
                  "leading": 2,
                  "letterSpacing": 1
                },
                {
                  "_$id": "custom_cards",
                  "_$type": "Text",
                  "name": "Cards",
                  "x": 120,
                  "y": 190,
                  "width": 1120,
                  "height": 430,
                  "text": "枪械\n\n个性资源\n\n装备涂装                         近战武器                         角色与外观",
                  "font": "Microsoft YaHei",
                  "fontSize": 25,
                  "color": "#d6d2c4",
                  "leading": 45,
                  "letterSpacing": 0
                }
              ]
            }
          ]
        }
      ]
    }
  ]
}
