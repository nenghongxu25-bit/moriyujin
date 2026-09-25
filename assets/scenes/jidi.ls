{
    "_$ver":  1,
    "_$id":  "w3oo9tbb",
    "_$type":  "Scene",
    "left":  0,
    "right":  0,
    "top":  0,
    "bottom":  0,
    "name":  "Scene2D",
    "width":  1334,
    "height":  750,
    "_$child":  [
                    {
                        "_$id":  "y8e6vyis",
                        "_$type":  "Sprite",
                        "name":  "UILayer",
                        "width":  100,
                        "height":  100,
                        "_$comp":  [
                                       {
                                           "_$type":  "86caec40-e001-46c8-936a-23e0e175eb55",
                                           "scriptPath":  "../src/PlayUI/ReferenceTemplates.ts"
                                       }
                                   ],
                        "_$child":  [
                                        {
                                            "_$id":  "lobby_chrome",
                                            "_$type":  "Sprite",
                                            "name":  "LobbyChrome",
                                            "width":  1334,
                                            "height":  750,
                                            "_mouseState":  1,
                                            "_$child":  [
                                                            {
                                                                "_$id":  "lobby_backdrop",
                                                                "_$type":  "GWidget",
                                                                "name":  "BackdropShade",
                                                                "width":  1334,
                                                                "height":  750,
                                                                "alpha":  0.58,
                                                                "_mouseState":  1,
                                                                "background":  {
                                                                                   "_$type":  "DrawRectCmd",
                                                                                   "lineWidth":  1,
                                                                                   "lineColor":  "#394247",
                                                                                   "fillColor":  "#1b2226"
                                                                               }
                                                            },
                                                            {
                                                                "_$id":  "lobby_left_panel",
                                                                "_$type":  "GWidget",
                                                                "name":  "LeftMenuPanel",
                                                                "x":  22,
                                                                "y":  146,
                                                                "width":  238,
                                                                "height":  428,
                                                                "alpha":  0.9,
                                                                "_mouseState":  1,
                                                                "background":  {
                                                                                   "_$type":  "DrawRectCmd",
                                                                                   "lineWidth":  1,
                                                                                   "lineColor":  "#394247",
                                                                                   "fillColor":  "#1b2226"
                                                                               }
                                                            },
                                                            {
                                                                "_$id":  "lobby_top_panel",
                                                                "_$type":  "GWidget",
                                                                "name":  "TopStatusPanel",
                                                                "x":  350,
                                                                "y":  22,
                                                                "width":  610,
                                                                "height":  66,
                                                                "alpha":  0.9,
                                                                "_mouseState":  1,
                                                                "background":  {
                                                                                   "_$type":  "DrawRectCmd",
                                                                                   "lineWidth":  1,
                                                                                   "lineColor":  "#394247",
                                                                                   "fillColor":  "#1b2226"
                                                                               }
                                                            },
                                                            {
                                                                "_$id":  "lobby_scene_title",
                                                                "_$type":  "Text",
                                                                "name":  "SceneTitle",
                                                                "x":  424,
                                                                "y":  31,
                                                                "width":  70,
                                                                "height":  52,
                                                                "_mouseState":  1,
                                                                "text":  "—",
                                                                "font":  "Microsoft YaHei",
                                                                "fontSize":  22,
                                                                "color":  "#e2e6e8",
                                                                "bold":  true,
                                                                "valign":  "middle",
                                                                "leading":  2,
                                                                "letterSpacing":  0
                                                            },
                                                            {
                                                                "_$id":  "lobby_right_panel",
                                                                "_$type":  "GWidget",
                                                                "name":  "ActionPanel",
                                                                "x":  1030,
                                                                "y":  116,
                                                                "width":  278,
                                                                "height":  405,
                                                                "alpha":  0.9,
                                                                "_mouseState":  1,
                                                                "background":  {
                                                                                   "_$type":  "DrawRectCmd",
                                                                                   "lineWidth":  1,
                                                                                   "lineColor":  "#394247",
                                                                                   "fillColor":  "#1b2226"
                                                                               }
                                                            },
                                                            {
                                                                "_$id":  "lobby_action_title",
                                                                "_$type":  "Text",
                                                                "name":  "ActionTitle",
                                                                "x":  1054,
                                                                "y":  132,
                                                                "width":  220,
                                                                "height":  30,
                                                                "_mouseState":  1,
                                                                "text":  "行动情报",
                                                                "font":  "Microsoft YaHei",
                                                                "fontSize":  22,
                                                                "color":  "#e2e6e8",
                                                                "bold":  true,
                                                                "leading":  2,
                                                                "letterSpacing":  0
                                                            },
                                                            {
                                                                "_$id":  "lobby_action_hint",
                                                                "_$type":  "Text",
                                                                "name":  "ActionHint",
                                                                "x":  1055,
                                                                "y":  164,
                                                                "width":  225,
                                                                "height":  42,
                                                                "_mouseState":  1,
                                                                "text":  "战区动态与限时行动将在此处展示",
                                                                "font":  "Microsoft YaHei",
                                                                "fontSize":  13,
                                                                "color":  "#e2e6e8",
                                                                "wordWrap":  true,
                                                                "leading":  5,
                                                                "letterSpacing":  0
                                                            },
                                                            {
                                                                "_$id":  "lobby_promo_panel",
                                                                "_$type":  "GWidget",
                                                                "name":  "PromoPanel",
                                                                "x":  1052,
                                                                "y":  202,
                                                                "width":  234,
                                                                "height":  78,
                                                                "_mouseState":  1,
                                                                "background":  {
                                                                                   "_$type":  "DrawRectCmd",
                                                                                   "lineWidth":  1,
                                                                                   "lineColor":  "#394247",
                                                                                   "fillColor":  "#1b2226"
                                                                               }
                                                            },
                                                            {
                                                                "_$id":  "lobby_promo_text",
                                                                "_$type":  "Text",
                                                                "name":  "PromoText",
                                                                "x":  1068,
                                                                "y":  214,
                                                                "width":  200,
                                                                "height":  56,
                                                                "text":  "最新活动",
                                                                "font":  "Microsoft YaHei",
                                                                "fontSize":  40,
                                                                "color":  "#e2e6e8",
                                                                "bold":  true,
                                                                "align":  "center",
                                                                "valign":  "bottom",
                                                                "leading":  6,
                                                                "letterSpacing":  0
                                                            },
                                                            {
                                                                "_$id":  "lobby_season_panel",
                                                                "_$type":  "GWidget",
                                                                "name":  "SeasonPanel",
                                                                "x":  28,
                                                                "y":  642,
                                                                "width":  455,
                                                                "height":  76,
                                                                "alpha":  0.92,
                                                                "_mouseState":  1,
                                                                "background":  {
                                                                                   "_$type":  "DrawRectCmd",
                                                                                   "lineWidth":  1,
                                                                                   "lineColor":  "#394247",
                                                                                   "fillColor":  "#1b2226"
                                                                               }
                                                            },
                                                            {
                                                                "_$id":  "lobby_season_text",
                                                                "_$type":  "Text",
                                                                "name":  "SeasonText",
                                                                "x":  48,
                                                                "y":  655,
                                                                "width":  410,
                                                                "height":  48,
                                                                "text":  "S1  赛季手册     段位     赛季挑战     档案",
                                                                "font":  "Microsoft YaHei",
                                                                "fontSize":  18,
                                                                "color":  "#e2e6e8",
                                                                "valign":  "middle",
                                                                "leading":  2,
                                                                "letterSpacing":  0
                                                            },
                                                            {
                                                                "_$id":  "lobby_credit_point_icon",
                                                                "_$type":  "GImage",
                                                                "name":  "CreditPointIcon",
                                                                "x":  378,
                                                                "y":  35,
                                                                "width":  40,
                                                                "height":  40,
                                                                "src":  "res://34eedc77-265d-449a-b876-be211fa4ab88",
                                                                "autoSize":  false,
                                                                "color":  "#ffffff"
                                                            },
                                                            {
                                                                "_$id":  "lobby_gold_voucher_icon",
                                                                "_$type":  "GImage",
                                                                "name":  "GoldVoucherIcon",
                                                                "x":  520,
                                                                "y":  35,
                                                                "width":  40,
                                                                "height":  40,
                                                                "src":  "res://103f954c-36c1-4e73-95bf-0342043e928a",
                                                                "autoSize":  false,
                                                                "color":  "#ffffff"
                                                            },
                                                            {
                                                                "_$id":  "lobby_gold_balance",
                                                                "_$type":  "Text",
                                                                "name":  "GoldBalance",
                                                                "x":  566,
                                                                "y":  31,
                                                                "width":  70,
                                                                "height":  52,
                                                                "text":  "—",
                                                                "font":  "Microsoft YaHei",
                                                                "fontSize":  22,
                                                                "color":  "#e2e6e8",
                                                                "bold":  true,
                                                                "valign":  "middle",
                                                                "leading":  2,
                                                                "letterSpacing":  0
                                                            }
                                                        ]
                                        },
                                        {
                                            "_$id":  "mubhrxi2",
                                            "_$type":  "Sprite",
                                            "name":  "button",
                                            "width":  100,
                                            "height":  100,
                                            "_$child":  [
                                                            {
                                                                "_$id":  "rt_nz",
                                                                "_$type":  "Sprite",
                                                                "name":  "go:warehouse",
                                                                "x":  42,
                                                                "y":  170,
                                                                "width":  185,
                                                                "height":  55,
                                                                "_mouseState":  2,
                                                                "_$child":  [
                                                                                {
                                                                                    "_$id":  "rt_nw",
                                                                                    "_$type":  "GWidget",
                                                                                    "name":  "ButtonBackground",
                                                                                    "width":  185,
                                                                                    "height":  55,
                                                                                    "background":  {
                                                                                                       "_$type":  "DrawRectCmd",
                                                                                                       "lineWidth":  1,
                                                                                                       "lineColor":  "#394247",
                                                                                                       "fillColor":  "#1b2226"
                                                                                                   }
                                                                                },
                                                                                {
                                                                                    "_$id":  "rt_nx",
                                                                                    "_$type":  "GWidget",
                                                                                    "name":  "Selected",
                                                                                    "width":  185,
                                                                                    "height":  55,
                                                                                    "visible":  false,
                                                                                    "background":  {
                                                                                                       "_$type":  "DrawRectCmd",
                                                                                                       "lineWidth":  1,
                                                                                                       "lineColor":  "#d76532",
                                                                                                       "fillColor":  "#34241d"
                                                                                                   }
                                                                                },
                                                                                {
                                                                                    "_$id":  "rt_ny",
                                                                                    "_$type":  "Text",
                                                                                    "name":  "Label",
                                                                                    "x":  10,
                                                                                    "width":  165,
                                                                                    "height":  55,
                                                                                    "_mouseState":  1,
                                                                                    "text":  "角色",
                                                                                    "font":  "Microsoft YaHei",
                                                                                    "fontSize":  18,
                                                                                    "color":  "#e2e6e8",
                                                                                    "align":  "center",
                                                                                    "valign":  "middle",
                                                                                    "wordWrap":  true,
                                                                                    "leading":  5,
                                                                                    "letterSpacing":  0
                                                                                }
                                                                            ]
                                                            },
                                                            {
                                                                "_$id":  "rt_o3",
                                                                "_$type":  "Sprite",
                                                                "name":  "go:contacts",
                                                                "x":  42,
                                                                "y":  250,
                                                                "width":  185,
                                                                "height":  55,
                                                                "_mouseState":  2,
                                                                "_$child":  [
                                                                                {
                                                                                    "_$id":  "rt_o0",
                                                                                    "_$type":  "GWidget",
                                                                                    "name":  "ButtonBackground",
                                                                                    "width":  185,
                                                                                    "height":  55,
                                                                                    "background":  {
                                                                                                       "_$type":  "DrawRectCmd",
                                                                                                       "lineWidth":  1,
                                                                                                       "lineColor":  "#394247",
                                                                                                       "fillColor":  "#1b2226"
                                                                                                   }
                                                                                },
                                                                                {
                                                                                    "_$id":  "rt_o1",
                                                                                    "_$type":  "GWidget",
                                                                                    "name":  "Selected",
                                                                                    "width":  185,
                                                                                    "height":  55,
                                                                                    "visible":  false,
                                                                                    "background":  {
                                                                                                       "_$type":  "DrawRectCmd",
                                                                                                       "lineWidth":  1,
                                                                                                       "lineColor":  "#d76532",
                                                                                                       "fillColor":  "#34241d"
                                                                                                   }
                                                                                },
                                                                                {
                                                                                    "_$id":  "rt_o2",
                                                                                    "_$type":  "Text",
                                                                                    "name":  "Label",
                                                                                    "x":  10,
                                                                                    "width":  165,
                                                                                    "height":  55,
                                                                                    "_mouseState":  1,
                                                                                    "text":  "联络人",
                                                                                    "font":  "Microsoft YaHei",
                                                                                    "fontSize":  18,
                                                                                    "color":  "#e2e6e8",
                                                                                    "align":  "center",
                                                                                    "valign":  "middle",
                                                                                    "wordWrap":  true,
                                                                                    "leading":  5,
                                                                                    "letterSpacing":  0
                                                                                }
                                                                            ]
                                                            },
                                                            {
                                                                "_$id":  "rt_o7",
                                                                "_$type":  "Sprite",
                                                                "name":  "go:weapons",
                                                                "x":  42,
                                                                "y":  330,
                                                                "width":  185,
                                                                "height":  55,
                                                                "_mouseState":  2,
                                                                "_$child":  [
                                                                                {
                                                                                    "_$id":  "rt_o4",
                                                                                    "_$type":  "GWidget",
                                                                                    "name":  "ButtonBackground",
                                                                                    "width":  185,
                                                                                    "height":  55,
                                                                                    "background":  {
                                                                                                       "_$type":  "DrawRectCmd",
                                                                                                       "lineWidth":  1,
                                                                                                       "lineColor":  "#394247",
                                                                                                       "fillColor":  "#1b2226"
                                                                                                   }
                                                                                },
                                                                                {
                                                                                    "_$id":  "rt_o5",
                                                                                    "_$type":  "GWidget",
                                                                                    "name":  "Selected",
                                                                                    "width":  185,
                                                                                    "height":  55,
                                                                                    "visible":  false,
                                                                                    "background":  {
                                                                                                       "_$type":  "DrawRectCmd",
                                                                                                       "lineWidth":  1,
                                                                                                       "lineColor":  "#d76532",
                                                                                                       "fillColor":  "#34241d"
                                                                                                   }
                                                                                },
                                                                                {
                                                                                    "_$id":  "rt_o6",
                                                                                    "_$type":  "Text",
                                                                                    "name":  "Label",
                                                                                    "x":  10,
                                                                                    "width":  165,
                                                                                    "height":  55,
                                                                                    "_mouseState":  1,
                                                                                    "text":  "改枪",
                                                                                    "font":  "Microsoft YaHei",
                                                                                    "fontSize":  18,
                                                                                    "color":  "#e2e6e8",
                                                                                    "align":  "center",
                                                                                    "valign":  "middle",
                                                                                    "wordWrap":  true,
                                                                                    "leading":  5,
                                                                                    "letterSpacing":  0
                                                                                }
                                                                            ]
                                                            },
                                                            {
                                                                "_$id":  "rt_ob",
                                                                "_$type":  "Sprite",
                                                                "name":  "go:market",
                                                                "x":  42,
                                                                "y":  410,
                                                                "width":  185,
                                                                "height":  55,
                                                                "_mouseState":  2,
                                                                "_$child":  [
                                                                                {
                                                                                    "_$id":  "rt_o8",
                                                                                    "_$type":  "GWidget",
                                                                                    "name":  "ButtonBackground",
                                                                                    "width":  185,
                                                                                    "height":  55,
                                                                                    "background":  {
                                                                                                       "_$type":  "DrawRectCmd",
                                                                                                       "lineWidth":  1,
                                                                                                       "lineColor":  "#394247",
                                                                                                       "fillColor":  "#1b2226"
                                                                                                   }
                                                                                },
                                                                                {
                                                                                    "_$id":  "rt_o9",
                                                                                    "_$type":  "GWidget",
                                                                                    "name":  "Selected",
                                                                                    "width":  185,
                                                                                    "height":  55,
                                                                                    "visible":  false,
                                                                                    "background":  {
                                                                                                       "_$type":  "DrawRectCmd",
                                                                                                       "lineWidth":  1,
                                                                                                       "lineColor":  "#d76532",
                                                                                                       "fillColor":  "#34241d"
                                                                                                   }
                                                                                },
                                                                                {
                                                                                    "_$id":  "rt_oa",
                                                                                    "_$type":  "Text",
                                                                                    "name":  "Label",
                                                                                    "x":  10,
                                                                                    "width":  165,
                                                                                    "height":  55,
                                                                                    "_mouseState":  1,
                                                                                    "text":  "市场",
                                                                                    "font":  "Microsoft YaHei",
                                                                                    "fontSize":  18,
                                                                                    "color":  "#e2e6e8",
                                                                                    "align":  "center",
                                                                                    "valign":  "middle",
                                                                                    "wordWrap":  true,
                                                                                    "leading":  5,
                                                                                    "letterSpacing":  0
                                                                                }
                                                                            ]
                                                            },
                                                            {
                                                                "_$id":  "rt_of",
                                                                "_$type":  "Sprite",
                                                                "name":  "go:customization",
                                                                "x":  42,
                                                                "y":  490,
                                                                "width":  185,
                                                                "height":  55,
                                                                "_mouseState":  2,
                                                                "_$child":  [
                                                                                {
                                                                                    "_$id":  "rt_oc",
                                                                                    "_$type":  "GWidget",
                                                                                    "name":  "ButtonBackground",
                                                                                    "width":  185,
                                                                                    "height":  55,
                                                                                    "background":  {
                                                                                                       "_$type":  "DrawRectCmd",
                                                                                                       "lineWidth":  1,
                                                                                                       "lineColor":  "#394247",
                                                                                                       "fillColor":  "#1b2226"
                                                                                                   }
                                                                                },
                                                                                {
                                                                                    "_$id":  "rt_od",
                                                                                    "_$type":  "GWidget",
                                                                                    "name":  "Selected",
                                                                                    "width":  185,
                                                                                    "height":  55,
                                                                                    "visible":  false,
                                                                                    "background":  {
                                                                                                       "_$type":  "DrawRectCmd",
                                                                                                       "lineWidth":  1,
                                                                                                       "lineColor":  "#d76532",
                                                                                                       "fillColor":  "#34241d"
                                                                                                   }
                                                                                },
                                                                                {
                                                                                    "_$id":  "rt_oe",
                                                                                    "_$type":  "Text",
                                                                                    "name":  "Label",
                                                                                    "x":  10,
                                                                                    "width":  165,
                                                                                    "height":  55,
                                                                                    "_mouseState":  1,
                                                                                    "text":  "装扮",
                                                                                    "font":  "Microsoft YaHei",
                                                                                    "fontSize":  18,
                                                                                    "color":  "#e2e6e8",
                                                                                    "align":  "center",
                                                                                    "valign":  "middle",
                                                                                    "wordWrap":  true,
                                                                                    "leading":  5,
                                                                                    "letterSpacing":  0
                                                                                }
                                                                            ]
                                                            },
                                                            {
                                                                "_$id":  "rt_or",
                                                                "_$type":  "Sprite",
                                                                "name":  "go:mode",
                                                                "x":  1068,
                                                                "y":  594,
                                                                "width":  222,
                                                                "height":  66,
                                                                "_mouseState":  2,
                                                                "_$child":  [
                                                                                {
                                                                                    "_$id":  "rt_oo",
                                                                                    "_$type":  "GWidget",
                                                                                    "name":  "ButtonBackground",
                                                                                    "width":  222,
                                                                                    "height":  66,
                                                                                    "background":  {
                                                                                                       "_$type":  "DrawRectCmd",
                                                                                                       "lineWidth":  1,
                                                                                                       "lineColor":  "#394247",
                                                                                                       "fillColor":  "#1b2226"
                                                                                                   }
                                                                                },
                                                                                {
                                                                                    "_$id":  "rt_op",
                                                                                    "_$type":  "GWidget",
                                                                                    "name":  "Selected",
                                                                                    "width":  222,
                                                                                    "height":  66,
                                                                                    "background":  {
                                                                                                       "_$type":  "DrawRectCmd",
                                                                                                       "lineWidth":  1,
                                                                                                       "lineColor":  "#d76532",
                                                                                                       "fillColor":  "#34241d"
                                                                                                   }
                                                                                },
                                                                                {
                                                                                    "_$id":  "rt_oq",
                                                                                    "_$type":  "Text",
                                                                                    "name":  "Label",
                                                                                    "x":  10,
                                                                                    "width":  202,
                                                                                    "height":  66,
                                                                                    "_mouseState":  1,
                                                                                    "text":  "进入暗区",
                                                                                    "font":  "Microsoft YaHei",
                                                                                    "fontSize":  18,
                                                                                    "color":  "#e2e6e8",
                                                                                    "align":  "center",
                                                                                    "valign":  "middle",
                                                                                    "wordWrap":  true,
                                                                                    "leading":  5,
                                                                                    "letterSpacing":  0
                                                                                }
                                                                            ]
                                                            },
                                                            {
                                                                "_$id":  "rt_ov",
                                                                "_$type":  "Sprite",
                                                                "name":  "go:profile",
                                                                "x":  28,
                                                                "y":  22,
                                                                "width":  300,
                                                                "height":  78,
                                                                "_mouseState":  2,
                                                                "_$child":  [
                                                                                {
                                                                                    "_$id":  "rt_os",
                                                                                    "_$type":  "GWidget",
                                                                                    "name":  "ButtonBackground",
                                                                                    "width":  300,
                                                                                    "height":  78,
                                                                                    "background":  {
                                                                                                       "_$type":  "DrawRectCmd",
                                                                                                       "lineWidth":  1,
                                                                                                       "lineColor":  "#394247",
                                                                                                       "fillColor":  "#1b2226"
                                                                                                   }
                                                                                },
                                                                                {
                                                                                    "_$id":  "rt_ot",
                                                                                    "_$type":  "GWidget",
                                                                                    "name":  "Selected",
                                                                                    "width":  300,
                                                                                    "height":  78,
                                                                                    "visible":  false,
                                                                                    "background":  {
                                                                                                       "_$type":  "DrawRectCmd",
                                                                                                       "lineWidth":  1,
                                                                                                       "lineColor":  "#d76532",
                                                                                                       "fillColor":  "#34241d"
                                                                                                   }
                                                                                },
                                                                                {
                                                                                    "_$id":  "rt_ou",
                                                                                    "_$type":  "Text",
                                                                                    "name":  "Label",
                                                                                    "x":  10,
                                                                                    "width":  280,
                                                                                    "height":  78,
                                                                                    "_mouseState":  1,
                                                                                    "text":  "幸存者档案",
                                                                                    "font":  "Microsoft YaHei",
                                                                                    "fontSize":  18,
                                                                                    "color":  "#e2e6e8",
                                                                                    "align":  "center",
                                                                                    "valign":  "middle",
                                                                                    "wordWrap":  true,
                                                                                    "leading":  5,
                                                                                    "letterSpacing":  0
                                                                                }
                                                                            ]
                                                            },
                                                            {
                                                                "_$id":  "top_action_0_0",
                                                                "_$type":  "Sprite",
                                                                "name":  "LeaderboardButton",
                                                                "x":  985,
                                                                "y":  30,
                                                                "width":  100,
                                                                "height":  44,
                                                                "_mouseState":  2,
                                                                "_$child":  [
                                                                                {
                                                                                    "_$id":  "top_action_0_1",
                                                                                    "_$type":  "GWidget",
                                                                                    "name":  "ButtonBackground",
                                                                                    "width":  100,
                                                                                    "height":  44,
                                                                                    "background":  {
                                                                                                       "_$type":  "DrawRectCmd",
                                                                                                       "lineWidth":  1,
                                                                                                       "lineColor":  "#394247",
                                                                                                       "fillColor":  "#1b2226"
                                                                                                   }
                                                                                },
                                                                                {
                                                                                    "_$id":  "top_action_0_2",
                                                                                    "_$type":  "GWidget",
                                                                                    "name":  "Selected",
                                                                                    "width":  100,
                                                                                    "height":  44,
                                                                                    "visible":  false,
                                                                                    "background":  {
                                                                                                       "_$type":  "DrawRectCmd",
                                                                                                       "lineWidth":  1,
                                                                                                       "lineColor":  "#d76532",
                                                                                                       "fillColor":  "#34241d"
                                                                                                   }
                                                                                },
                                                                                {
                                                                                    "_$id":  "top_action_0_3",
                                                                                    "_$type":  "Text",
                                                                                    "name":  "Label",
                                                                                    "x":  10,
                                                                                    "width":  80,
                                                                                    "height":  44,
                                                                                    "_mouseState":  1,
                                                                                    "text":  "排行榜",
                                                                                    "font":  "Microsoft YaHei",
                                                                                    "fontSize":  18,
                                                                                    "color":  "#e2e6e8",
                                                                                    "align":  "center",
                                                                                    "valign":  "middle",
                                                                                    "wordWrap":  true,
                                                                                    "leading":  5,
                                                                                    "letterSpacing":  0
                                                                                }
                                                                            ]
                                                            },
                                                            {
                                                                "_$id":  "top_action_1_0",
                                                                "_$type":  "Sprite",
                                                                "name":  "go:mail",
                                                                "x":  1093,
                                                                "y":  30,
                                                                "width":  100,
                                                                "height":  44,
                                                                "_mouseState":  2,
                                                                "_$child":  [
                                                                                {
                                                                                    "_$id":  "top_action_1_1",
                                                                                    "_$type":  "GWidget",
                                                                                    "name":  "ButtonBackground",
                                                                                    "width":  100,
                                                                                    "height":  44,
                                                                                    "background":  {
                                                                                                       "_$type":  "DrawRectCmd",
                                                                                                       "lineWidth":  1,
                                                                                                       "lineColor":  "#394247",
                                                                                                       "fillColor":  "#1b2226"
                                                                                                   }
                                                                                },
                                                                                {
                                                                                    "_$id":  "top_action_1_2",
                                                                                    "_$type":  "GWidget",
                                                                                    "name":  "Selected",
                                                                                    "width":  100,
                                                                                    "height":  44,
                                                                                    "visible":  false,
                                                                                    "background":  {
                                                                                                       "_$type":  "DrawRectCmd",
                                                                                                       "lineWidth":  1,
                                                                                                       "lineColor":  "#d76532",
                                                                                                       "fillColor":  "#34241d"
                                                                                                   }
                                                                                },
                                                                                {
                                                                                    "_$id":  "top_action_1_3",
                                                                                    "_$type":  "Text",
                                                                                    "name":  "Label",
                                                                                    "x":  10,
                                                                                    "width":  80,
                                                                                    "height":  44,
                                                                                    "_mouseState":  1,
                                                                                    "text":  "邮件",
                                                                                    "font":  "Microsoft YaHei",
                                                                                    "fontSize":  18,
                                                                                    "color":  "#e2e6e8",
                                                                                    "align":  "center",
                                                                                    "valign":  "middle",
                                                                                    "wordWrap":  true,
                                                                                    "leading":  5,
                                                                                    "letterSpacing":  0
                                                                                }
                                                                            ]
                                                            },
                                                            {
                                                                "_$id":  "top_action_2_0",
                                                                "_$type":  "Sprite",
                                                                "name":  "SettingsButton",
                                                                "x":  1201,
                                                                "y":  30,
                                                                "width":  100,
                                                                "height":  44,
                                                                "_mouseState":  2,
                                                                "_$child":  [
                                                                                {
                                                                                    "_$id":  "top_action_2_1",
                                                                                    "_$type":  "GWidget",
                                                                                    "name":  "ButtonBackground",
                                                                                    "width":  100,
                                                                                    "height":  44,
                                                                                    "background":  {
                                                                                                       "_$type":  "DrawRectCmd",
                                                                                                       "lineWidth":  1,
                                                                                                       "lineColor":  "#394247",
                                                                                                       "fillColor":  "#1b2226"
                                                                                                   }
                                                                                },
                                                                                {
                                                                                    "_$id":  "top_action_2_2",
                                                                                    "_$type":  "GWidget",
                                                                                    "name":  "Selected",
                                                                                    "width":  100,
                                                                                    "height":  44,
                                                                                    "visible":  false,
                                                                                    "background":  {
                                                                                                       "_$type":  "DrawRectCmd",
                                                                                                       "lineWidth":  1,
                                                                                                       "lineColor":  "#d76532",
                                                                                                       "fillColor":  "#34241d"
                                                                                                   }
                                                                                },
                                                                                {
                                                                                    "_$id":  "top_action_2_3",
                                                                                    "_$type":  "Text",
                                                                                    "name":  "Label",
                                                                                    "x":  10,
                                                                                    "width":  80,
                                                                                    "height":  44,
                                                                                    "_mouseState":  1,
                                                                                    "text":  "设置",
                                                                                    "font":  "Microsoft YaHei",
                                                                                    "fontSize":  18,
                                                                                    "color":  "#e2e6e8",
                                                                                    "align":  "center",
                                                                                    "valign":  "middle",
                                                                                    "wordWrap":  true,
                                                                                    "leading":  5,
                                                                                    "letterSpacing":  0
                                                                                }
                                                                            ]
                                                            }
                                                        ]
                                        },
                                        {
                                            "_$id":  "fm9nno5m",
                                            "_$type":  "Sprite",
                                            "name":  "panel",
                                            "width":  100,
                                            "height":  100,
                                            "_$child":  [
                                                            {
                                                                "_$id":  "lessrwbh",
                                                                "_$prefab":  "73ecaedc-782b-45f4-9ec4-b0ab7333b96c",
                                                                "name":  "mapchoose",
                                                                "active":  true,
                                                                "x":  0,
                                                                "y":  0,
                                                                "visible":  false
                                                            },
                                                            {
                                                                "_$id":  "warehouse_panel",
                                                                "_$prefab":  "9bf2effb-3f48-4c83-8ac7-38f62f17e5a2",
                                                                "name":  "warehouse_panel",
                                                                "active":  true,
                                                                "x":  0,
                                                                "y":  0,
                                                                "visible":  false
                                                            },
                                                            {
                                                                "_$id":  "rt_1",
                                                                "_$prefab":  "fa4daa99-2f8c-4662-8644-655ae4a1acdb",
                                                                "name":  "page:contacts",
                                                                "active":  true,
                                                                "x":  0,
                                                                "y":  0,
                                                                "visible":  false,
                                                                "_$child":  [
                                                                                {
                                                                                    "_$override":  "rt_m",
                                                                                    "x":  140,
                                                                                    "y":  180
                                                                                },
                                                                                {
                                                                                    "_$override":  "rt_v",
                                                                                    "x":  494,
                                                                                    "y":  180
                                                                                },
                                                                                {
                                                                                    "_$override":  "rt_14",
                                                                                    "x":  848,
                                                                                    "y":  180
                                                                                },
                                                                                {
                                                                                    "_$override":  "rt_1d",
                                                                                    "x":  140,
                                                                                    "y":  366
                                                                                },
                                                                                {
                                                                                    "_$override":  "rt_1m",
                                                                                    "x":  494,
                                                                                    "y":  366
                                                                                },
                                                                                {
                                                                                    "_$override":  "rt_1v",
                                                                                    "x":  848,
                                                                                    "y":  366
                                                                                }
                                                                            ]
                                                            },
                                                            {
                                                                "_$id":  "rt_30",
                                                                "_$prefab":  "8abe5cb9-4cc2-4130-a059-39540296ab84",
                                                                "name":  "page:market",
                                                                "active":  true,
                                                                "x":  0,
                                                                "y":  0,
                                                                "visible":  false
                                                            },
                                                            {
                                                                "_$id":  "rt_69",
                                                                "_$prefab":  "c4b5b205-91ef-49a9-b908-128f432a9bbf",
                                                                "name":  "page:customization",
                                                                "active":  true,
                                                                "x":  0,
                                                                "y":  0,
                                                                "visible":  false
                                                            },
                                                            {
                                                                "_$id":  "rt_7m",
                                                                "_$prefab":  "1433d3a7-b7cc-4ad9-a9f9-3cc93f0eb7c7",
                                                                "name":  "page:mail",
                                                                "active":  true,
                                                                "x":  0,
                                                                "y":  0,
                                                                "visible":  false
                                                            },
                                                            {
                                                                "_$id":  "rt_ax",
                                                                "_$prefab":  "ac0a78e8-d1be-4ccc-ba6a-cdf4b772cefd",
                                                                "name":  "page:profile",
                                                                "active":  true,
                                                                "x":  0,
                                                                "y":  0,
                                                                "visible":  false
                                                            },
                                                            {
                                                                "_$id":  "rt_d3",
                                                                "_$prefab":  "6b8b9248-d889-4f02-9956-d4d1ff0c6ef4",
                                                                "name":  "page:combat",
                                                                "active":  true,
                                                                "x":  0,
                                                                "y":  0,
                                                                "visible":  false
                                                            },
                                                            {
                                                                "_$id":  "rt_ez",
                                                                "_$prefab":  "786e11e1-8fd0-4bb3-a98a-6d33d1a36648",
                                                                "name":  "page:history",
                                                                "active":  true,
                                                                "x":  0,
                                                                "y":  0,
                                                                "visible":  false
                                                            },
                                                            {
                                                                "_$id":  "rt_he",
                                                                "_$prefab":  "e3a6640f-b8c5-4d76-9af2-1876319acdb5",
                                                                "name":  "page:evaluation",
                                                                "active":  true,
                                                                "x":  0,
                                                                "y":  0,
                                                                "visible":  false
                                                            },
                                                            {
                                                                "_$id":  "rt_kh",
                                                                "_$prefab":  "91624819-b286-4081-9964-61033e90b3c8",
                                                                "name":  "page:weapons",
                                                                "active":  true,
                                                                "x":  0,
                                                                "y":  0,
                                                                "visible":  false
                                                            },
                                                            {
                                                                "_$id":  "rt_mm",
                                                                "_$prefab":  "5446ff71-45a9-4af5-8b8d-a5a61ec4043e",
                                                                "name":  "page:mode",
                                                                "active":  true,
                                                                "x":  0,
                                                                "y":  0,
                                                                "visible":  false
                                                            }
                                                        ]
                                        }
                                    ]
                    }
                ]
}