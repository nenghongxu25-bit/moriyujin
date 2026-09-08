export type MapNode = {
    id: string;
    name: string;
    level: number;
    type: "world" | "region" | "location" | "special" | "faction" | "placeholder";
    image?: string;
    enabled: boolean;
    children?: MapNode[];
};

export const TANYUN_WORLD_MAP: MapNode = {
    id: "tanyunjie",
    name: "檀云界",
    level: 1,
    type: "world",
    enabled: true,
    children: [
        {
            id: "qinghuaidao",
            name: "青槐道",
            level: 2,
            type: "region",
            image: "res://be2776de-2c74-472f-baaa-6bdfa3dbf02a",
            enabled: true,
            children: [
                {
                    id: "fengqiaozhen",
                    name: "枫桥镇",
                    level: 3,
                    type: "location",
                    image: "res://48bfa3d5-0acd-4eb9-a324-0f98c635869c",
                    enabled: true,
                },
                {
                    id: "huangtuji",
                    name: "黄土集",
                    level: 3,
                    type: "location",
                    image: "res://afcefcd1-5268-4932-95ea-61364f1d39b6",
                    enabled: true,
                },
                {
                    id: "liujindu",
                    name: "柳津渡",
                    level: 3,
                    type: "location",
                    image: "res://e23613c3-336e-449e-895a-5ca0bf3ef582",
                    enabled: true,
                },
                {
                    id: "qinghuaizong",
                    name: "青槐宗",
                    level: 3,
                    type: "location",
                    image: "res://9f0d29a9-d0ee-47d2-aa62-765dec35239e",
                    enabled: true,
                },
                {
                    id: "qingpingshan",
                    name: "青屏山",
                    level: 3,
                    type: "location",
                    image: "res://ab8cd922-78b5-4f3b-839d-8bc8f5af5e1e",
                    enabled: true,
                },
                {
                    id: "zhaoyangfu",
                    name: "昭阳府",
                    level: 3,
                    type: "location",
                    image: "res://8420113d-8ca8-40f5-a7da-b0ed5e55ed9c",
                    enabled: true,
                },
            ],
        },
        {
            id: "yunlandao",
            name: "云岚道",
            level: 2,
            type: "region",
            enabled: true,
            children: [
                {
                    id: "baiyangzhuang",
                    name: "杨家庄",
                    level: 3,
                    type: "location",
                    image: "res://0c077e70-1eae-4a99-841a-346a3d60d01d",
                    enabled: true,
                },
                {
                    id: "beifenggu",
                    name: "北风谷",
                    level: 3,
                    type: "location",
                    enabled: true,
                },
                {
                    id: "badaomen",
                    name: "霸刀门",
                    level: 3,
                    type: "location",
                    enabled: true,
                },
                {
                    id: "yanhuishan",
                    name: "雁回山",
                    level: 3,
                    type: "location",
                    enabled: true,
                },
                {
                    id: "beijing",
                    name: "北境",
                    level: 3,
                    type: "location",
                    enabled: true,
                },
            ],
        },
        {
            id: "xuanjiadao",
            name: "玄甲道",
            level: 2,
            type: "region",
            enabled: true,
            children: [
                {
                    id: "zhongyuecheng",
                    name: "重岳城",
                    level: 3,
                    type: "location",
                    enabled: true,
                },
                {
                    id: "heishicun",
                    name: "黑石村",
                    level: 3,
                    type: "location",
                    enabled: true,
                },
                {
                    id: "chentiehu",
                    name: "沉铁湖",
                    level: 3,
                    type: "location",
                    enabled: true,
                },
                {
                    id: "guixiangling",
                    name: "归乡陵",
                    level: 3,
                    type: "location",
                    enabled: true,
                },
                {
                    id: "xuanjiawei",
                    name: "玄甲卫",
                    level: 3,
                    type: "location",
                    enabled: true,
                },
                {
                    id: "zhenyuezong",
                    name: "镇岳宗",
                    level: 3,
                    type: "location",
                    enabled: true,
                },
            ],
        },
        {
            id: "chirangdao",
            name: "赤壤道",
            level: 2,
            type: "region",
            enabled: true,
            children: [
                {
                    id: "jiaotupo",
                    name: "焦土坡",
                    level: 3,
                    type: "location",
                    enabled: true,
                },
                {
                    id: "liaoyuangu",
                    name: "燎原谷",
                    level: 3,
                    type: "location",
                    enabled: true,
                },
                {
                    id: "kaiyangzong",
                    name: "开阳宗",
                    level: 3,
                    type: "location",
                    enabled: true,
                },
            ],
        },
        {
            id: "chaoyindao",
            name: "潮音道",
            level: 2,
            type: "region",
            enabled: true,
            children: [
                {
                    id: "canglangzong",
                    name: "沧浪宗",
                    level: 3,
                    type: "location",
                    enabled: true,
                },
                {
                    id: "yewai",
                    name: "野外",
                    level: 3,
                    type: "location",
                    enabled: true,
                },
            ],
        },
        {
            id: "cangwudao",
            name: "苍梧道",
            level: 2,
            type: "region",
            enabled: true,
            children: [
                {
                    id: "cangshan",
                    name: "苍山",
                    level: 3,
                    type: "location",
                    enabled: true,
                },
                {
                    id: "guixugong",
                    name: "归墟宫",
                    level: 3,
                    type: "location",
                    enabled: true,
                },
            ],
        },
        {
            id: "special_region",
            name: "特规区域",
            level: 2,
            type: "special",
            enabled: true,
        },
        {
            id: "foreign_forces",
            name: "外族势力",
            level: 2,
            type: "faction",
            enabled: true,
        },
        {
            id: "unknown_region_08",
            name: "未命名区域",
            level: 2,
            type: "placeholder",
            enabled: false,
        },
    ],
};

export const TANYUN_REGIONS = TANYUN_WORLD_MAP.children ?? [];
