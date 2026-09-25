{
  "_$ver": 1,
  "_$id": "loot_gallery_20260922",
  "_$type": "Scene",
  "name": "今日物资点总览_18种",
  "width": 1334,
  "height": 750,
  "_$comp": [
    {
      "_$type": "0bd7bb22-b457-4ea2-bf56-59ff2c1a0336",
      "scriptPath": "../src/container/LootPointGallery.ts"
    }
  ],
  "_$child": [
    {
      "_$id": "title",
      "_$type": "Text",
      "name": "说明",
      "x": 24,
      "y": 20,
      "width": 1280,
      "height": 45,
      "text": "今日物资点 · 18种 / 72帧    点击物件播放开启动画",
      "fontSize": 25,
      "color": "#ffffff"
    },
    {
      "_$ver": 1,
      "_$id": "loot_weapon_crate",
      "_$type": "Sprite",
      "name": "军用武器箱",
      "width": 320,
      "height": 320,
      "_$comp": [
        {
          "_$id": "weapon_crate_component_0",
          "_$type": "StaticCollider",
          "shapes": [
            {
              "_$type": "BoxShape2D",
              "x": 32,
              "y": 128,
              "density": 10,
              "restitution": 0,
              "restitutionThreshold": 1,
              "friction": 0.2,
              "isSensor": true,
              "width": 256,
              "height": 192
            }
          ]
        },
        {
          "_$type": "ed764396-9a64-4823-baa5-0206ff8f2dbf",
          "scriptPath": "../src/container/LootPoint.ts",
          "containerId": "loot_weapon_crate",
          "instanceId": "gallery_weapon_crate",
          "displayName": "军用武器箱",
          "contentsJson": "",
          "once": true,
          "destroyAfterOpen": false,
          "visualId": "weapon_crate"
        },
        {
          "_$id": "weapon_crate_component_2",
          "_$type": "1806c38c-ebc3-45d1-a8a0-322ed94be4cb",
          "scriptPath": "../src/systems/DepthSortable.ts",
          "groundY": 297.5,
          "blendDistance": 0
        },
        {
          "_$type": "ad602582-0a8d-4d34-8573-3cab8b47a2b0",
          "scriptPath": "../src/systems/ImageDepthOccluder.ts",
          "imageNode": {
            "_$ref": "weapon_crate_image"
          }
        }
      ],
      "_$child": [
        {
          "_$id": "weapon_crate_image",
          "_$type": "GImage",
          "name": "img",
          "width": 320,
          "height": 320,
          "scaleX": 1,
          "scaleY": 1,
          "src": "res://5b78a720-a7ac-4f77-a3f2-95bea230d654",
          "autoSize": false
        }
      ],
      "x": 31,
      "y": 98.375,
      "scaleY": 0.55,
      "scaleX": 0.55
    },
    {
      "_$id": "label_weapon_crate",
      "_$type": "Text",
      "name": "名称_weapon_crate",
      "x": 24,
      "y": 270,
      "width": 195,
      "height": 28,
      "text": "军用武器箱",
      "fontSize": 17,
      "color": "#eeeeee",
      "align": "center"
    },
    {
      "_$ver": 1,
      "_$id": "loot_ammo_box",
      "_$type": "Sprite",
      "name": "钢制弹药箱",
      "width": 176,
      "height": 176,
      "_$comp": [
        {
          "_$id": "ammo_box_component_0",
          "_$type": "StaticCollider",
          "shapes": [
            {
              "_$type": "BoxShape2D",
              "x": 17.6,
              "y": 70.4,
              "density": 10,
              "restitution": 0,
              "restitutionThreshold": 1,
              "friction": 0.2,
              "isSensor": true,
              "width": 140.8,
              "height": 105.6
            }
          ]
        },
        {
          "_$type": "ed764396-9a64-4823-baa5-0206ff8f2dbf",
          "scriptPath": "../src/container/LootPoint.ts",
          "containerId": "loot_ammo_box",
          "instanceId": "gallery_ammo_box",
          "displayName": "钢制弹药箱",
          "contentsJson": "",
          "once": true,
          "destroyAfterOpen": false,
          "visualId": "ammo_box"
        },
        {
          "_$id": "ammo_box_component_2",
          "_$type": "1806c38c-ebc3-45d1-a8a0-322ed94be4cb",
          "scriptPath": "../src/systems/DepthSortable.ts",
          "groundY": 163.625,
          "blendDistance": 0
        },
        {
          "_$type": "ad602582-0a8d-4d34-8573-3cab8b47a2b0",
          "scriptPath": "../src/systems/ImageDepthOccluder.ts",
          "imageNode": {
            "_$ref": "ammo_box_image"
          }
        }
      ],
      "_$child": [
        {
          "_$id": "ammo_box_image",
          "_$type": "GImage",
          "name": "img",
          "width": 176,
          "height": 176,
          "scaleX": 1,
          "scaleY": 1,
          "src": "res://8aa50d6f-7507-41c9-ba00-72e74e1e09ae",
          "autoSize": false
        }
      ],
      "x": 288.6,
      "y": 172.00625,
      "scaleY": 0.55,
      "scaleX": 0.55
    },
    {
      "_$id": "label_ammo_box",
      "_$type": "Text",
      "name": "名称_ammo_box",
      "x": 242,
      "y": 270,
      "width": 195,
      "height": 28,
      "text": "钢制弹药箱",
      "fontSize": 17,
      "color": "#eeeeee",
      "align": "center"
    },
    {
      "_$ver": 1,
      "_$id": "loot_medical_case",
      "_$type": "Sprite",
      "name": "急救医疗箱",
      "width": 208,
      "height": 208,
      "_$comp": [
        {
          "_$id": "medical_case_component_0",
          "_$type": "StaticCollider",
          "shapes": [
            {
              "_$type": "BoxShape2D",
              "x": 20.8,
              "y": 83.2,
              "density": 10,
              "restitution": 0,
              "restitutionThreshold": 1,
              "friction": 0.2,
              "isSensor": true,
              "width": 166.4,
              "height": 124.8
            }
          ]
        },
        {
          "_$type": "ed764396-9a64-4823-baa5-0206ff8f2dbf",
          "scriptPath": "../src/container/LootPoint.ts",
          "containerId": "loot_medical_case",
          "instanceId": "gallery_medical_case",
          "displayName": "急救医疗箱",
          "contentsJson": "",
          "once": true,
          "destroyAfterOpen": false,
          "visualId": "medical_case"
        },
        {
          "_$id": "medical_case_component_2",
          "_$type": "1806c38c-ebc3-45d1-a8a0-322ed94be4cb",
          "scriptPath": "../src/systems/DepthSortable.ts",
          "groundY": 193.375,
          "blendDistance": 0
        },
        {
          "_$type": "ad602582-0a8d-4d34-8573-3cab8b47a2b0",
          "scriptPath": "../src/systems/ImageDepthOccluder.ts",
          "imageNode": {
            "_$ref": "medical_case_image"
          }
        }
      ],
      "_$child": [
        {
          "_$id": "medical_case_image",
          "_$type": "GImage",
          "name": "img",
          "width": 208,
          "height": 208,
          "scaleX": 1,
          "scaleY": 1,
          "src": "res://db4eca27-c71c-4fba-9e2c-2ad0af690595",
          "autoSize": false
        }
      ],
      "x": 497.8,
      "y": 155.64375,
      "scaleY": 0.55,
      "scaleX": 0.55
    },
    {
      "_$id": "label_medical_case",
      "_$type": "Text",
      "name": "名称_medical_case",
      "x": 460,
      "y": 270,
      "width": 195,
      "height": 28,
      "text": "急救医疗箱",
      "fontSize": 17,
      "color": "#eeeeee",
      "align": "center"
    },
    {
      "_$ver": 1,
      "_$id": "loot_toolbox",
      "_$type": "Sprite",
      "name": "工业工具箱",
      "width": 208,
      "height": 208,
      "_$comp": [
        {
          "_$id": "toolbox_component_0",
          "_$type": "StaticCollider",
          "shapes": [
            {
              "_$type": "BoxShape2D",
              "x": 20.8,
              "y": 83.2,
              "density": 10,
              "restitution": 0,
              "restitutionThreshold": 1,
              "friction": 0.2,
              "isSensor": true,
              "width": 166.4,
              "height": 124.8
            }
          ]
        },
        {
          "_$type": "ed764396-9a64-4823-baa5-0206ff8f2dbf",
          "scriptPath": "../src/container/LootPoint.ts",
          "containerId": "loot_toolbox",
          "instanceId": "gallery_toolbox",
          "displayName": "工业工具箱",
          "contentsJson": "",
          "once": true,
          "destroyAfterOpen": false,
          "visualId": "toolbox"
        },
        {
          "_$id": "toolbox_component_2",
          "_$type": "1806c38c-ebc3-45d1-a8a0-322ed94be4cb",
          "scriptPath": "../src/systems/DepthSortable.ts",
          "groundY": 193.375,
          "blendDistance": 0
        },
        {
          "_$type": "ad602582-0a8d-4d34-8573-3cab8b47a2b0",
          "scriptPath": "../src/systems/ImageDepthOccluder.ts",
          "imageNode": {
            "_$ref": "toolbox_image"
          }
        }
      ],
      "_$child": [
        {
          "_$id": "toolbox_image",
          "_$type": "GImage",
          "name": "img",
          "width": 208,
          "height": 208,
          "scaleX": 1,
          "scaleY": 1,
          "src": "res://337c20dc-9a5a-4cd6-870e-c997979147a4",
          "autoSize": false
        }
      ],
      "x": 715.8,
      "y": 155.64375,
      "scaleY": 0.55,
      "scaleX": 0.55
    },
    {
      "_$id": "label_toolbox",
      "_$type": "Text",
      "name": "名称_toolbox",
      "x": 678,
      "y": 270,
      "width": 195,
      "height": 28,
      "text": "工业工具箱",
      "fontSize": 17,
      "color": "#eeeeee",
      "align": "center"
    },
    {
      "_$ver": 1,
      "_$id": "loot_duffel_bag",
      "_$type": "Sprite",
      "name": "帆布旅行袋",
      "width": 224,
      "height": 224,
      "_$comp": [
        {
          "_$id": "duffel_bag_component_0",
          "_$type": "StaticCollider",
          "shapes": [
            {
              "_$type": "BoxShape2D",
              "x": 22.400000000000002,
              "y": 89.60000000000001,
              "density": 10,
              "restitution": 0,
              "restitutionThreshold": 1,
              "friction": 0.2,
              "isSensor": true,
              "width": 179.20000000000002,
              "height": 134.4
            }
          ]
        },
        {
          "_$type": "ed764396-9a64-4823-baa5-0206ff8f2dbf",
          "scriptPath": "../src/container/LootPoint.ts",
          "containerId": "loot_duffel_bag",
          "instanceId": "gallery_duffel_bag",
          "displayName": "帆布旅行袋",
          "contentsJson": "",
          "once": true,
          "destroyAfterOpen": false,
          "visualId": "duffel_bag"
        },
        {
          "_$id": "duffel_bag_component_2",
          "_$type": "1806c38c-ebc3-45d1-a8a0-322ed94be4cb",
          "scriptPath": "../src/systems/DepthSortable.ts",
          "groundY": 208.25,
          "blendDistance": 0
        },
        {
          "_$type": "ad602582-0a8d-4d34-8573-3cab8b47a2b0",
          "scriptPath": "../src/systems/ImageDepthOccluder.ts",
          "imageNode": {
            "_$ref": "duffel_bag_image"
          }
        }
      ],
      "_$child": [
        {
          "_$id": "duffel_bag_image",
          "_$type": "GImage",
          "name": "img",
          "width": 224,
          "height": 224,
          "scaleX": 1,
          "scaleY": 1,
          "src": "res://7620039a-aaf0-4013-a160-39ca623cf113",
          "autoSize": false
        }
      ],
      "x": 929.4,
      "y": 147.46249999999998,
      "scaleY": 0.55,
      "scaleX": 0.55
    },
    {
      "_$id": "label_duffel_bag",
      "_$type": "Text",
      "name": "名称_duffel_bag",
      "x": 896,
      "y": 270,
      "width": 195,
      "height": 28,
      "text": "帆布旅行袋",
      "fontSize": 17,
      "color": "#eeeeee",
      "align": "center"
    },
    {
      "_$ver": 1,
      "_$id": "loot_safe",
      "_$type": "Sprite",
      "name": "机械保险箱",
      "width": 240,
      "height": 240,
      "_$comp": [
        {
          "_$id": "safe_component_0",
          "_$type": "StaticCollider",
          "shapes": [
            {
              "_$type": "BoxShape2D",
              "x": 24,
              "y": 96,
              "density": 10,
              "restitution": 0,
              "restitutionThreshold": 1,
              "friction": 0.2,
              "isSensor": true,
              "width": 192,
              "height": 144
            }
          ]
        },
        {
          "_$type": "ed764396-9a64-4823-baa5-0206ff8f2dbf",
          "scriptPath": "../src/container/LootPoint.ts",
          "containerId": "loot_safe",
          "instanceId": "gallery_safe",
          "displayName": "机械保险箱",
          "contentsJson": "",
          "once": true,
          "destroyAfterOpen": false,
          "visualId": "safe"
        },
        {
          "_$id": "safe_component_2",
          "_$type": "1806c38c-ebc3-45d1-a8a0-322ed94be4cb",
          "scriptPath": "../src/systems/DepthSortable.ts",
          "groundY": 223.125,
          "blendDistance": 0
        },
        {
          "_$type": "ad602582-0a8d-4d34-8573-3cab8b47a2b0",
          "scriptPath": "../src/systems/ImageDepthOccluder.ts",
          "imageNode": {
            "_$ref": "safe_image"
          }
        }
      ],
      "_$child": [
        {
          "_$id": "safe_image",
          "_$type": "GImage",
          "name": "img",
          "width": 240,
          "height": 240,
          "scaleX": 1,
          "scaleY": 1,
          "src": "res://ac1516d3-1162-4282-9df3-b763ca412d36",
          "autoSize": false
        }
      ],
      "x": 1143,
      "y": 139.28125,
      "scaleY": 0.55,
      "scaleX": 0.55
    },
    {
      "_$id": "label_safe",
      "_$type": "Text",
      "name": "名称_safe",
      "x": 1114,
      "y": 270,
      "width": 195,
      "height": 28,
      "text": "机械保险箱",
      "fontSize": 17,
      "color": "#eeeeee",
      "align": "center"
    },
    {
      "_$ver": 1,
      "_$id": "loot_filing_cabinet",
      "_$type": "Sprite",
      "name": "旧式文件柜",
      "width": 300,
      "height": 300,
      "_$comp": [
        {
          "_$id": "filing_cabinet_component_0",
          "_$type": "StaticCollider",
          "shapes": [
            {
              "_$type": "BoxShape2D",
              "x": 30,
              "y": 120,
              "density": 10,
              "restitution": 0,
              "restitutionThreshold": 1,
              "friction": 0.2,
              "isSensor": true,
              "width": 240,
              "height": 180
            }
          ]
        },
        {
          "_$type": "ed764396-9a64-4823-baa5-0206ff8f2dbf",
          "scriptPath": "../src/container/LootPoint.ts",
          "containerId": "loot_filing_cabinet",
          "instanceId": "gallery_filing_cabinet",
          "displayName": "旧式文件柜",
          "contentsJson": "",
          "once": true,
          "destroyAfterOpen": false,
          "visualId": "filing_cabinet",
          "visualFolder": "loot-points-v2"
        },
        {
          "_$id": "filing_cabinet_component_2",
          "_$type": "1806c38c-ebc3-45d1-a8a0-322ed94be4cb",
          "scriptPath": "../src/systems/DepthSortable.ts",
          "groundY": 278.90625,
          "blendDistance": 0
        },
        {
          "_$type": "ad602582-0a8d-4d34-8573-3cab8b47a2b0",
          "scriptPath": "../src/systems/ImageDepthOccluder.ts",
          "imageNode": {
            "_$ref": "filing_cabinet_image"
          }
        }
      ],
      "_$child": [
        {
          "_$id": "filing_cabinet_image",
          "_$type": "GImage",
          "name": "img",
          "width": 300,
          "height": 300,
          "scaleX": 1,
          "scaleY": 1,
          "src": "res://29a1a449-80e0-457b-83d1-bc3307cb2838",
          "autoSize": false
        }
      ],
      "x": 36.5,
      "y": 326.6015625,
      "scaleY": 0.55,
      "scaleX": 0.55
    },
    {
      "_$id": "label_filing_cabinet",
      "_$type": "Text",
      "name": "名称_filing_cabinet",
      "x": 24,
      "y": 488,
      "width": 195,
      "height": 28,
      "text": "旧式文件柜",
      "fontSize": 17,
      "color": "#eeeeee",
      "align": "center"
    },
    {
      "_$ver": 1,
      "_$id": "loot_wardrobe",
      "_$type": "Sprite",
      "name": "旧木衣柜",
      "width": 360,
      "height": 360,
      "_$comp": [
        {
          "_$id": "wardrobe_component_0",
          "_$type": "StaticCollider",
          "shapes": [
            {
              "_$type": "BoxShape2D",
              "x": 36,
              "y": 144,
              "density": 10,
              "restitution": 0,
              "restitutionThreshold": 1,
              "friction": 0.2,
              "isSensor": true,
              "width": 288,
              "height": 216
            }
          ]
        },
        {
          "_$type": "ed764396-9a64-4823-baa5-0206ff8f2dbf",
          "scriptPath": "../src/container/LootPoint.ts",
          "containerId": "loot_wardrobe",
          "instanceId": "gallery_wardrobe",
          "displayName": "旧木衣柜",
          "contentsJson": "",
          "once": true,
          "destroyAfterOpen": false,
          "visualId": "wardrobe",
          "visualFolder": "loot-points-v2"
        },
        {
          "_$id": "wardrobe_component_2",
          "_$type": "1806c38c-ebc3-45d1-a8a0-322ed94be4cb",
          "scriptPath": "../src/systems/DepthSortable.ts",
          "groundY": 334.6875,
          "blendDistance": 0
        },
        {
          "_$type": "ad602582-0a8d-4d34-8573-3cab8b47a2b0",
          "scriptPath": "../src/systems/ImageDepthOccluder.ts",
          "imageNode": {
            "_$ref": "wardrobe_image"
          }
        }
      ],
      "_$child": [
        {
          "_$id": "wardrobe_image",
          "_$type": "GImage",
          "name": "img",
          "width": 360,
          "height": 360,
          "scaleX": 1,
          "scaleY": 1,
          "src": "res://3318c4dc-4f0c-4505-91cd-99fc154de11f",
          "autoSize": false
        }
      ],
      "x": 238,
      "y": 295.921875,
      "scaleY": 0.55,
      "scaleX": 0.55
    },
    {
      "_$id": "label_wardrobe",
      "_$type": "Text",
      "name": "名称_wardrobe",
      "x": 242,
      "y": 488,
      "width": 195,
      "height": 28,
      "text": "旧木衣柜",
      "fontSize": 17,
      "color": "#eeeeee",
      "align": "center"
    },
    {
      "_$ver": 1,
      "_$id": "loot_refrigerator",
      "_$type": "Sprite",
      "name": "老式冰箱",
      "width": 340,
      "height": 340,
      "_$comp": [
        {
          "_$id": "refrigerator_component_0",
          "_$type": "StaticCollider",
          "shapes": [
            {
              "_$type": "BoxShape2D",
              "x": 34,
              "y": 136,
              "density": 10,
              "restitution": 0,
              "restitutionThreshold": 1,
              "friction": 0.2,
              "isSensor": true,
              "width": 272,
              "height": 204
            }
          ]
        },
        {
          "_$type": "ed764396-9a64-4823-baa5-0206ff8f2dbf",
          "scriptPath": "../src/container/LootPoint.ts",
          "containerId": "loot_refrigerator",
          "instanceId": "gallery_refrigerator",
          "displayName": "老式冰箱",
          "contentsJson": "",
          "once": true,
          "destroyAfterOpen": false,
          "visualId": "refrigerator",
          "visualFolder": "loot-points-v2"
        },
        {
          "_$id": "refrigerator_component_2",
          "_$type": "1806c38c-ebc3-45d1-a8a0-322ed94be4cb",
          "scriptPath": "../src/systems/DepthSortable.ts",
          "groundY": 316.09375,
          "blendDistance": 0
        },
        {
          "_$type": "ad602582-0a8d-4d34-8573-3cab8b47a2b0",
          "scriptPath": "../src/systems/ImageDepthOccluder.ts",
          "imageNode": {
            "_$ref": "refrigerator_image"
          }
        }
      ],
      "_$child": [
        {
          "_$id": "refrigerator_image",
          "_$type": "GImage",
          "name": "img",
          "width": 340,
          "height": 340,
          "scaleX": 1,
          "scaleY": 1,
          "src": "res://08ce90b6-a230-4b44-9082-5ea5a0cd7680",
          "autoSize": false
        }
      ],
      "x": 461.5,
      "y": 306.1484375,
      "scaleY": 0.55,
      "scaleX": 0.55
    },
    {
      "_$id": "label_refrigerator",
      "_$type": "Text",
      "name": "名称_refrigerator",
      "x": 460,
      "y": 488,
      "width": 195,
      "height": 28,
      "text": "老式冰箱",
      "fontSize": 17,
      "color": "#eeeeee",
      "align": "center"
    },
    {
      "_$ver": 1,
      "_$id": "loot_suitcase",
      "_$type": "Sprite",
      "name": "硬壳旅行箱",
      "width": 224,
      "height": 224,
      "_$comp": [
        {
          "_$id": "suitcase_component_0",
          "_$type": "StaticCollider",
          "shapes": [
            {
              "_$type": "BoxShape2D",
              "x": 22.400000000000002,
              "y": 89.60000000000001,
              "density": 10,
              "restitution": 0,
              "restitutionThreshold": 1,
              "friction": 0.2,
              "isSensor": true,
              "width": 179.20000000000002,
              "height": 134.4
            }
          ]
        },
        {
          "_$type": "ed764396-9a64-4823-baa5-0206ff8f2dbf",
          "scriptPath": "../src/container/LootPoint.ts",
          "containerId": "loot_suitcase",
          "instanceId": "gallery_suitcase",
          "displayName": "硬壳旅行箱",
          "contentsJson": "",
          "once": true,
          "destroyAfterOpen": false,
          "visualId": "suitcase",
          "visualFolder": "loot-points-v2"
        },
        {
          "_$id": "suitcase_component_2",
          "_$type": "1806c38c-ebc3-45d1-a8a0-322ed94be4cb",
          "scriptPath": "../src/systems/DepthSortable.ts",
          "groundY": 208.25,
          "blendDistance": 0
        },
        {
          "_$type": "ad602582-0a8d-4d34-8573-3cab8b47a2b0",
          "scriptPath": "../src/systems/ImageDepthOccluder.ts",
          "imageNode": {
            "_$ref": "suitcase_image"
          }
        }
      ],
      "_$child": [
        {
          "_$id": "suitcase_image",
          "_$type": "GImage",
          "name": "img",
          "width": 224,
          "height": 224,
          "scaleX": 1,
          "scaleY": 1,
          "src": "res://f047b190-10ff-41b6-acfd-d68ebecd8716",
          "autoSize": false
        }
      ],
      "x": 711.4,
      "y": 365.4625,
      "scaleY": 0.55,
      "scaleX": 0.55
    },
    {
      "_$id": "label_suitcase",
      "_$type": "Text",
      "name": "名称_suitcase",
      "x": 678,
      "y": 488,
      "width": 195,
      "height": 28,
      "text": "硬壳旅行箱",
      "fontSize": 17,
      "color": "#eeeeee",
      "align": "center"
    },
    {
      "_$ver": 1,
      "_$id": "loot_cash_register",
      "_$type": "Sprite",
      "name": "旧式收银机",
      "width": 192,
      "height": 192,
      "_$comp": [
        {
          "_$id": "cash_register_component_0",
          "_$type": "StaticCollider",
          "shapes": [
            {
              "_$type": "BoxShape2D",
              "x": 19.200000000000003,
              "y": 76.80000000000001,
              "density": 10,
              "restitution": 0,
              "restitutionThreshold": 1,
              "friction": 0.2,
              "isSensor": true,
              "width": 153.60000000000002,
              "height": 115.19999999999999
            }
          ]
        },
        {
          "_$type": "ed764396-9a64-4823-baa5-0206ff8f2dbf",
          "scriptPath": "../src/container/LootPoint.ts",
          "containerId": "loot_cash_register",
          "instanceId": "gallery_cash_register",
          "displayName": "旧式收银机",
          "contentsJson": "",
          "once": true,
          "destroyAfterOpen": false,
          "visualId": "cash_register",
          "visualFolder": "loot-points-v2"
        },
        {
          "_$id": "cash_register_component_2",
          "_$type": "1806c38c-ebc3-45d1-a8a0-322ed94be4cb",
          "scriptPath": "../src/systems/DepthSortable.ts",
          "groundY": 178.5,
          "blendDistance": 0
        },
        {
          "_$type": "ad602582-0a8d-4d34-8573-3cab8b47a2b0",
          "scriptPath": "../src/systems/ImageDepthOccluder.ts",
          "imageNode": {
            "_$ref": "cash_register_image"
          }
        }
      ],
      "_$child": [
        {
          "_$id": "cash_register_image",
          "_$type": "GImage",
          "name": "img",
          "width": 192,
          "height": 192,
          "scaleX": 1,
          "scaleY": 1,
          "src": "res://9ddcea4d-2627-4127-b9ad-9e6c1485c267",
          "autoSize": false
        }
      ],
      "x": 938.2,
      "y": 381.825,
      "scaleY": 0.55,
      "scaleX": 0.55
    },
    {
      "_$id": "label_cash_register",
      "_$type": "Text",
      "name": "名称_cash_register",
      "x": 896,
      "y": 488,
      "width": 195,
      "height": 28,
      "text": "旧式收银机",
      "fontSize": 17,
      "color": "#eeeeee",
      "align": "center"
    },
    {
      "_$ver": 1,
      "_$id": "loot_trash_bin",
      "_$type": "Sprite",
      "name": "翻盖垃圾桶",
      "width": 220,
      "height": 220,
      "_$comp": [
        {
          "_$id": "trash_bin_component_0",
          "_$type": "StaticCollider",
          "shapes": [
            {
              "_$type": "BoxShape2D",
              "x": 22,
              "y": 88,
              "density": 10,
              "restitution": 0,
              "restitutionThreshold": 1,
              "friction": 0.2,
              "isSensor": true,
              "width": 176,
              "height": 132
            }
          ]
        },
        {
          "_$type": "ed764396-9a64-4823-baa5-0206ff8f2dbf",
          "scriptPath": "../src/container/LootPoint.ts",
          "containerId": "loot_trash_bin",
          "instanceId": "gallery_trash_bin",
          "displayName": "翻盖垃圾桶",
          "contentsJson": "",
          "once": true,
          "destroyAfterOpen": false,
          "visualId": "trash_bin",
          "visualFolder": "loot-points-v2"
        },
        {
          "_$id": "trash_bin_component_2",
          "_$type": "1806c38c-ebc3-45d1-a8a0-322ed94be4cb",
          "scriptPath": "../src/systems/DepthSortable.ts",
          "groundY": 204.53125,
          "blendDistance": 0
        },
        {
          "_$type": "ad602582-0a8d-4d34-8573-3cab8b47a2b0",
          "scriptPath": "../src/systems/ImageDepthOccluder.ts",
          "imageNode": {
            "_$ref": "trash_bin_image"
          }
        }
      ],
      "_$child": [
        {
          "_$id": "trash_bin_image",
          "_$type": "GImage",
          "name": "img",
          "width": 220,
          "height": 220,
          "scaleX": 1,
          "scaleY": 1,
          "src": "res://279f46f6-ee31-4276-b3b8-aae96ee410bc",
          "autoSize": false
        }
      ],
      "x": 1148.5,
      "y": 367.5078125,
      "scaleY": 0.55,
      "scaleX": 0.55
    },
    {
      "_$id": "label_trash_bin",
      "_$type": "Text",
      "name": "名称_trash_bin",
      "x": 1114,
      "y": 488,
      "width": 195,
      "height": 28,
      "text": "翻盖垃圾桶",
      "fontSize": 17,
      "color": "#eeeeee",
      "align": "center"
    },
    {
      "_$ver": 1,
      "_$id": "loot_supply_crate",
      "_$type": "Sprite",
      "name": "军用补给箱",
      "width": 300,
      "height": 300,
      "_$comp": [
        {
          "_$id": "supply_crate_component_0",
          "_$type": "StaticCollider",
          "shapes": [
            {
              "_$type": "BoxShape2D",
              "x": 30,
              "y": 120,
              "density": 10,
              "restitution": 0,
              "restitutionThreshold": 1,
              "friction": 0.2,
              "isSensor": true,
              "width": 240,
              "height": 180
            }
          ]
        },
        {
          "_$type": "ed764396-9a64-4823-baa5-0206ff8f2dbf",
          "scriptPath": "../src/container/LootPoint.ts",
          "containerId": "loot_supply_crate",
          "instanceId": "gallery_supply_crate",
          "displayName": "军用补给箱",
          "contentsJson": "",
          "once": true,
          "destroyAfterOpen": false,
          "visualId": "supply_crate",
          "visualFolder": "loot-points-v3"
        },
        {
          "_$id": "supply_crate_component_2",
          "_$type": "1806c38c-ebc3-45d1-a8a0-322ed94be4cb",
          "scriptPath": "../src/systems/DepthSortable.ts",
          "groundY": 278.90625,
          "blendDistance": 0
        },
        {
          "_$type": "ad602582-0a8d-4d34-8573-3cab8b47a2b0",
          "scriptPath": "../src/systems/ImageDepthOccluder.ts",
          "imageNode": {
            "_$ref": "supply_crate_image"
          }
        }
      ],
      "_$child": [
        {
          "_$id": "supply_crate_image",
          "_$type": "GImage",
          "name": "img",
          "width": 300,
          "height": 300,
          "scaleX": 1,
          "scaleY": 1,
          "src": "res://32795755-dfb4-42ab-8fda-34ca4966df45",
          "autoSize": false
        }
      ],
      "x": 36.5,
      "y": 544.6015625,
      "scaleY": 0.55,
      "scaleX": 0.55
    },
    {
      "_$id": "label_supply_crate",
      "_$type": "Text",
      "name": "名称_supply_crate",
      "x": 24,
      "y": 706,
      "width": 195,
      "height": 28,
      "text": "军用补给箱",
      "fontSize": 17,
      "color": "#eeeeee",
      "align": "center"
    },
    {
      "_$ver": 1,
      "_$id": "loot_weapon_locker",
      "_$type": "Sprite",
      "name": "钢制武器柜",
      "width": 360,
      "height": 360,
      "_$comp": [
        {
          "_$id": "weapon_locker_component_0",
          "_$type": "StaticCollider",
          "shapes": [
            {
              "_$type": "BoxShape2D",
              "x": 36,
              "y": 144,
              "density": 10,
              "restitution": 0,
              "restitutionThreshold": 1,
              "friction": 0.2,
              "isSensor": true,
              "width": 288,
              "height": 216
            }
          ]
        },
        {
          "_$type": "ed764396-9a64-4823-baa5-0206ff8f2dbf",
          "scriptPath": "../src/container/LootPoint.ts",
          "containerId": "loot_weapon_locker",
          "instanceId": "gallery_weapon_locker",
          "displayName": "钢制武器柜",
          "contentsJson": "",
          "once": true,
          "destroyAfterOpen": false,
          "visualId": "weapon_locker",
          "visualFolder": "loot-points-v3"
        },
        {
          "_$id": "weapon_locker_component_2",
          "_$type": "1806c38c-ebc3-45d1-a8a0-322ed94be4cb",
          "scriptPath": "../src/systems/DepthSortable.ts",
          "groundY": 334.6875,
          "blendDistance": 0
        },
        {
          "_$type": "ad602582-0a8d-4d34-8573-3cab8b47a2b0",
          "scriptPath": "../src/systems/ImageDepthOccluder.ts",
          "imageNode": {
            "_$ref": "weapon_locker_image"
          }
        }
      ],
      "_$child": [
        {
          "_$id": "weapon_locker_image",
          "_$type": "GImage",
          "name": "img",
          "width": 360,
          "height": 360,
          "scaleX": 1,
          "scaleY": 1,
          "src": "res://202eda80-4730-4312-b32d-7164e25cab11",
          "autoSize": false
        }
      ],
      "x": 238,
      "y": 513.921875,
      "scaleY": 0.55,
      "scaleX": 0.55
    },
    {
      "_$id": "label_weapon_locker",
      "_$type": "Text",
      "name": "名称_weapon_locker",
      "x": 242,
      "y": 706,
      "width": 195,
      "height": 28,
      "text": "钢制武器柜",
      "fontSize": 17,
      "color": "#eeeeee",
      "align": "center"
    },
    {
      "_$ver": 1,
      "_$id": "loot_medical_cabinet",
      "_$type": "Sprite",
      "name": "急救医疗柜",
      "width": 240,
      "height": 240,
      "_$comp": [
        {
          "_$id": "medical_cabinet_component_0",
          "_$type": "StaticCollider",
          "shapes": [
            {
              "_$type": "BoxShape2D",
              "x": 24,
              "y": 96,
              "density": 10,
              "restitution": 0,
              "restitutionThreshold": 1,
              "friction": 0.2,
              "isSensor": true,
              "width": 192,
              "height": 144
            }
          ]
        },
        {
          "_$type": "ed764396-9a64-4823-baa5-0206ff8f2dbf",
          "scriptPath": "../src/container/LootPoint.ts",
          "containerId": "loot_medical_cabinet",
          "instanceId": "gallery_medical_cabinet",
          "displayName": "急救医疗柜",
          "contentsJson": "",
          "once": true,
          "destroyAfterOpen": false,
          "visualId": "medical_cabinet",
          "visualFolder": "loot-points-v3"
        },
        {
          "_$id": "medical_cabinet_component_2",
          "_$type": "1806c38c-ebc3-45d1-a8a0-322ed94be4cb",
          "scriptPath": "../src/systems/DepthSortable.ts",
          "groundY": 223.125,
          "blendDistance": 0
        },
        {
          "_$type": "ad602582-0a8d-4d34-8573-3cab8b47a2b0",
          "scriptPath": "../src/systems/ImageDepthOccluder.ts",
          "imageNode": {
            "_$ref": "medical_cabinet_image"
          }
        }
      ],
      "_$child": [
        {
          "_$id": "medical_cabinet_image",
          "_$type": "GImage",
          "name": "img",
          "width": 240,
          "height": 240,
          "scaleX": 1,
          "scaleY": 1,
          "src": "res://8c678864-d558-4823-b377-5834b3722c0e",
          "autoSize": false
        }
      ],
      "x": 489,
      "y": 575.28125,
      "scaleY": 0.55,
      "scaleX": 0.55
    },
    {
      "_$id": "label_medical_cabinet",
      "_$type": "Text",
      "name": "名称_medical_cabinet",
      "x": 460,
      "y": 706,
      "width": 195,
      "height": 28,
      "text": "急救医疗柜",
      "fontSize": 17,
      "color": "#eeeeee",
      "align": "center"
    },
    {
      "_$ver": 1,
      "_$id": "loot_computer_tower",
      "_$type": "Sprite",
      "name": "旧式电脑主机",
      "width": 216,
      "height": 216,
      "_$comp": [
        {
          "_$id": "computer_tower_component_0",
          "_$type": "StaticCollider",
          "shapes": [
            {
              "_$type": "BoxShape2D",
              "x": 21.6,
              "y": 86.4,
              "density": 10,
              "restitution": 0,
              "restitutionThreshold": 1,
              "friction": 0.2,
              "isSensor": true,
              "width": 172.8,
              "height": 129.6
            }
          ]
        },
        {
          "_$type": "ed764396-9a64-4823-baa5-0206ff8f2dbf",
          "scriptPath": "../src/container/LootPoint.ts",
          "containerId": "loot_computer_tower",
          "instanceId": "gallery_computer_tower",
          "displayName": "旧式电脑主机",
          "contentsJson": "",
          "once": true,
          "destroyAfterOpen": false,
          "visualId": "computer_tower",
          "visualFolder": "loot-points-v3"
        },
        {
          "_$id": "computer_tower_component_2",
          "_$type": "1806c38c-ebc3-45d1-a8a0-322ed94be4cb",
          "scriptPath": "../src/systems/DepthSortable.ts",
          "groundY": 200.8125,
          "blendDistance": 0
        },
        {
          "_$type": "ad602582-0a8d-4d34-8573-3cab8b47a2b0",
          "scriptPath": "../src/systems/ImageDepthOccluder.ts",
          "imageNode": {
            "_$ref": "computer_tower_image"
          }
        }
      ],
      "_$child": [
        {
          "_$id": "computer_tower_image",
          "_$type": "GImage",
          "name": "img",
          "width": 216,
          "height": 216,
          "scaleX": 1,
          "scaleY": 1,
          "src": "res://8895c504-fedc-4d98-aee1-058e0a918d0e",
          "autoSize": false
        }
      ],
      "x": 713.6,
      "y": 587.553125,
      "scaleY": 0.55,
      "scaleX": 0.55
    },
    {
      "_$id": "label_computer_tower",
      "_$type": "Text",
      "name": "名称_computer_tower",
      "x": 678,
      "y": 706,
      "width": 195,
      "height": 28,
      "text": "旧式电脑主机",
      "fontSize": 17,
      "color": "#eeeeee",
      "align": "center"
    },
    {
      "_$ver": 1,
      "_$id": "loot_hanging_jacket",
      "_$type": "Sprite",
      "name": "墙挂工装夹克",
      "width": 236,
      "height": 236,
      "_$comp": [
        {
          "_$id": "hanging_jacket_component_0",
          "_$type": "StaticCollider",
          "shapes": [
            {
              "_$type": "BoxShape2D",
              "x": 23.6,
              "y": 94.4,
              "density": 10,
              "restitution": 0,
              "restitutionThreshold": 1,
              "friction": 0.2,
              "isSensor": true,
              "width": 188.8,
              "height": 141.6
            }
          ]
        },
        {
          "_$type": "ed764396-9a64-4823-baa5-0206ff8f2dbf",
          "scriptPath": "../src/container/LootPoint.ts",
          "containerId": "loot_hanging_jacket",
          "instanceId": "gallery_hanging_jacket",
          "displayName": "墙挂工装夹克",
          "contentsJson": "",
          "once": true,
          "destroyAfterOpen": false,
          "visualId": "hanging_jacket",
          "visualFolder": "loot-points-v3"
        },
        {
          "_$id": "hanging_jacket_component_2",
          "_$type": "1806c38c-ebc3-45d1-a8a0-322ed94be4cb",
          "scriptPath": "../src/systems/DepthSortable.ts",
          "groundY": 219.40625,
          "blendDistance": 0
        },
        {
          "_$type": "ad602582-0a8d-4d34-8573-3cab8b47a2b0",
          "scriptPath": "../src/systems/ImageDepthOccluder.ts",
          "imageNode": {
            "_$ref": "hanging_jacket_image"
          }
        }
      ],
      "_$child": [
        {
          "_$id": "hanging_jacket_image",
          "_$type": "GImage",
          "name": "img",
          "width": 236,
          "height": 236,
          "scaleX": 1,
          "scaleY": 1,
          "src": "res://41a73829-6e85-47bd-8ef6-77e5c1a24b2c",
          "autoSize": false
        }
      ],
      "x": 926.1,
      "y": 577.3265625,
      "scaleY": 0.55,
      "scaleX": 0.55
    },
    {
      "_$id": "label_hanging_jacket",
      "_$type": "Text",
      "name": "名称_hanging_jacket",
      "x": 896,
      "y": 706,
      "width": 195,
      "height": 28,
      "text": "墙挂工装夹克",
      "fontSize": 17,
      "color": "#eeeeee",
      "align": "center"
    },
    {
      "_$ver": 1,
      "_$id": "loot_sports_bag",
      "_$type": "Sprite",
      "name": "拉链运动包",
      "width": 216,
      "height": 216,
      "_$comp": [
        {
          "_$id": "sports_bag_component_0",
          "_$type": "StaticCollider",
          "shapes": [
            {
              "_$type": "BoxShape2D",
              "x": 21.6,
              "y": 86.4,
              "density": 10,
              "restitution": 0,
              "restitutionThreshold": 1,
              "friction": 0.2,
              "isSensor": true,
              "width": 172.8,
              "height": 129.6
            }
          ]
        },
        {
          "_$type": "ed764396-9a64-4823-baa5-0206ff8f2dbf",
          "scriptPath": "../src/container/LootPoint.ts",
          "containerId": "loot_sports_bag",
          "instanceId": "gallery_sports_bag",
          "displayName": "拉链运动包",
          "contentsJson": "",
          "once": true,
          "destroyAfterOpen": false,
          "visualId": "sports_bag",
          "visualFolder": "loot-points-v3"
        },
        {
          "_$id": "sports_bag_component_2",
          "_$type": "1806c38c-ebc3-45d1-a8a0-322ed94be4cb",
          "scriptPath": "../src/systems/DepthSortable.ts",
          "groundY": 200.8125,
          "blendDistance": 0
        },
        {
          "_$type": "ad602582-0a8d-4d34-8573-3cab8b47a2b0",
          "scriptPath": "../src/systems/ImageDepthOccluder.ts",
          "imageNode": {
            "_$ref": "sports_bag_image"
          }
        }
      ],
      "_$child": [
        {
          "_$id": "sports_bag_image",
          "_$type": "GImage",
          "name": "img",
          "width": 216,
          "height": 216,
          "scaleX": 1,
          "scaleY": 1,
          "src": "res://bcd2e465-4d66-4758-947d-e99fc4d4a836",
          "autoSize": false
        }
      ],
      "x": 1149.6,
      "y": 587.553125,
      "scaleY": 0.55,
      "scaleX": 0.55
    },
    {
      "_$id": "label_sports_bag",
      "_$type": "Text",
      "name": "名称_sports_bag",
      "x": 1114,
      "y": 706,
      "width": 195,
      "height": 28,
      "text": "拉链运动包",
      "fontSize": 17,
      "color": "#eeeeee",
      "align": "center"
    }
  ]
}