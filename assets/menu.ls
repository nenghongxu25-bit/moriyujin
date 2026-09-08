{
  "_$ver": 1,
  "_$id": "vl1q2x2w",
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
      "_$id": "tcwmlrnk",
      "_$type": "Sprite",
      "name": "Sprite",
      "width": 1334,
      "height": 750,
      "_gcmds": [
        {
          "_$type": "DrawRectCmd",
          "fillColor": "#171d2b"
        }
      ],
      "_$child": [
        {
          "_$id": "imk44myq",
          "_$type": "Text",
          "name": "Text",
          "x": 498,
          "y": 173,
          "width": 302,
          "height": 111,
          "text": "檀云—青槐记",
          "fontSize": 50,
          "color": "#0e7824",
          "bold": true,
          "align": "center",
          "valign": "middle",
          "leading": 2,
          "letterSpacing": 0
        },
        {
          "_$id": "zg18zpf5",
          "_$type": "GButton",
          "name": "btn",
          "x": 555,
          "y": 405,
          "width": 200,
          "height": 50,
          "background": {
            "_$type": "DrawRectCmd",
            "lineWidth": 2,
            "lineColor": "#000000",
            "fillColor": "#103d1a"
          },
          "controllers": {
            "_$type": "Record",
            "button": {
              "_$type": "Controller",
              "pages": [
                "up",
                "down",
                "over",
                "selectedOver"
              ]
            }
          },
          "_$child": [
            {
              "_$id": "ygmi7p14",
              "_$type": "Text",
              "name": "Text",
              "width": 200,
              "height": 50,
              "text": "开始游戏",
              "fontSize": 30,
              "color": "#000000",
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
}