{
  "_$ver": 1,
  "_$id": "k3k6atvy",
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
      "_$id": "whxv89m6",
      "_$type": "Area2D",
      "name": "Area2D",
      "width": 1334,
      "height": 750,
      "_$child": [
        {
          "_$id": "0exeucxe",
          "_$type": "Sprite",
          "name": "Sprite",
          "width": 1334,
          "height": 750,
          "_gcmds": [
            {
              "_$type": "DrawRectCmd",
              "lineWidth": 4,
              "lineColor": "#000000",
              "fillColor": "#101d34"
            }
          ],
          "_$child": [
            {
              "_$id": "iv8dlixm",
              "_$type": "GList",
              "name": "list",
              "x": 180,
              "y": 150,
              "width": 1044,
              "height": 542,
              "alpha": 0.865,
              "background": {
                "_$type": "DrawRectCmd",
                "lineWidth": 5,
                "lineColor": "#000000",
                "fillColor": "#08083a"
              },
              "layout": {
                "type": 3,
                "rowGap": 50,
                "columnGap": 50,
                "padding": [
                  20,
                  0,
                  0,
                  10
                ],
                "align": 1
              },
              "scroller": {
                "_$type": "Scroller",
                "barDisplay": 1
              },
              "_templateNode": {
                "_$ref": "ow7sf9fd",
                "_$tmpl": "itemTemplate"
              },
              "_initItemNum": 9,
              "_$child": [
                {
                  "_$id": "ow7sf9fd",
                  "_$prefab": "14568d0b-a72e-4169-a1e4-910921ca5696",
                  "name": "Sprite",
                  "active": true,
                  "x": 0,
                  "y": 0,
                  "visible": true,
                  "alpha": 1,
                  "_$child": [
                    {
                      "_$override": "gredvxjv",
                      "_gcmds": [
                        {
                          "_$type": "DrawRoundRectCmd",
                          "lt": 30,
                          "rt": 30,
                          "lb": 30,
                          "rb": 30,
                          "lineWidth": 5,
                          "lineColor": "#000000",
                          "fillColor": "#00ac94"
                        },
                        {
                          "_$type": "DrawRoundRectCmd",
                          "x": 0.05,
                          "y": 0.05,
                          "width": 0.9,
                          "height": 0.9,
                          "lt": 20,
                          "rt": 20,
                          "lb": 20,
                          "rb": 20,
                          "lineWidth": 5,
                          "lineColor": "#000000",
                          "fillColor": "#294e83"
                        }
                      ],
                      "alpha": 0.8
                    }
                  ]
                }
              ]
            }
          ]
        },
        {
          "_$id": "bt0nopbk",
          "_$type": "Text",
          "name": "Text",
          "x": 541,
          "y": 34,
          "width": 243,
          "height": 82,
          "text": "檀云界",
          "fontSize": 50,
          "color": "#29548a",
          "align": "center",
          "valign": "middle",
          "leading": 2,
          "letterSpacing": 0
        }
      ]
    }
  ]
}