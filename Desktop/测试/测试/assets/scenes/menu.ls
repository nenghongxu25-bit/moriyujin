{
  "_$ver": 1,
  "_$id": "tqrhxsos",
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
      "_$id": "qjbatchd",
      "_$type": "GImage",
      "name": "img_2",
      "width": 1334,
      "height": 751,
      "src": "res://c1618f32-9761-497a-a056-db3f87d39cb9"
    },
    {
      "_$id": "chyzfowj",
      "_$prefab": "23b9adb8-6418-49ed-a4d7-98cf6c7624b8",
      "name": "JumpToScene",
      "active": true,
      "x": 580,
      "y": 370,
      "width": 200,
      "height": 98,
      "visible": true,
      "_$comp": [
        {
          "_$override": "efc1b234-4347-4332-bdef-e97122381b78",
          "sceneUrl": "scenes/cunzhuang.ls"
        }
      ],
      "_$child": [
        {
          "_$override": "2kur2vy4",
          "text": "开始游戏"
        }
      ]
    },
    {
      "_$id": "zrmf9ykc",
      "_$type": "GImage",
      "name": "img_1",
      "x": 297,
      "y": -1,
      "width": 800,
      "height": 400,
      "src": "res://30a71faa-9af6-4d77-9fc9-a92919d65510"
    },
    {
      "_$id": "0ry0hecu",
      "_$prefab": "e5f6cdc4-8abc-4212-b51b-3127183b1042",
      "name": "OpenSprite",
      "active": true,
      "x": 578,
      "y": 439,
      "visible": true,
      "_$comp": [
        {
          "_$override": "2938a217-4272-4f6d-aaf2-984b61320b26",
          "targetNode": {
            "_$ref": "xka3q9s3"
          }
        }
      ],
      "_$child": [
        {
          "_$override": "6k3sv098",
          "text": "登录"
        }
      ]
    },
    {
      "_$id": "m3j59qo1",
      "_$prefab": "e5f6cdc4-8abc-4212-b51b-3127183b1042",
      "name": "OpenSprite_2",
      "active": true,
      "x": 578,
      "y": 505,
      "visible": true,
      "_$child": [
        {
          "_$override": "6k3sv098",
          "text": "设置"
        }
      ]
    },
    {
      "_$id": "xka3q9s3",
      "_$prefab": "38ed0335-cd16-49c0-87de-4176bd27e1ca",
      "name": "card",
      "active": true,
      "x": 961,
      "y": 223,
      "scaleX": 2,
      "scaleY": 2,
      "visible": false
    }
  ]
}