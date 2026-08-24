import { dySDK } from "@open-dy/node-server-sdk";

export default async function (params: any, context: any) {
    const action = String(params && params.action || "login");

    const serviceContext = dySDK.context(context);

    const userInfo = serviceContext.getContext();

    const openId = String(userInfo.openId || "");
    const anonymousOpenId = String(userInfo.anonymousOpenid || "");
    const playerId = openId || anonymousOpenId;
    const loginCode = String(params && params.loginCode || "");
    const anonymousCode = String(params && params.anonymousCode || "");

    console.log("userInfo:", userInfo);
    console.log("openId:", openId);
    console.log("anonymousOpenId:", anonymousOpenId);
    console.log("action:", action);
    console.log("hasLoginCode:", !!loginCode);
    console.log("hasAnonymousCode:", !!anonymousCode);

    if (!playerId) {
        return {
            code: 401,
            message: "没有获取到玩家身份，请确认前端使用 cloud.callFunction 调用函数服务，或在云端配置匿名 code 换 openid 的兜底逻辑"
        };
    }

    if (action === "login") {
        return {
            code: 0,
            message: "免登录成功",
            data: {
                playerId
            }
        };
    }

    if (action === "getServerTime") {
        return getServerTime();
    }

    if (action === "loadSave") {
        return loadSave(playerId);
    }

    if (action === "saveGame") {
        return saveGame(playerId, params && params.saveData);
    }

    return {
        code: 400,
        message: `未知动作: ${action}`
    };
}

function getServerTime() {
    const serverTimeMs = Date.now();
    return {
        code: 0,
        message: "get server time success",
        data: {
            serverTimeMs,
            iso: new Date(serverTimeMs).toISOString()
        }
    };
}

async function loadSave(playerId: string) {
    const docId = normalizeDocId(playerId);
    const db = dySDK.database();
    const result = await db.collection("player_saves").doc(docId).get();
    const row = Array.isArray(result.data) && result.data.length > 0
        ? result.data[0]
        : null;

    return {
        code: 0,
        message: "读取存档成功",
        data: {
            saveData: row && row.saveData ? row.saveData : null
        }
    };
}

async function saveGame(playerId: string, saveData: any) {
    if (!isValidSaveData(saveData)) {
        return {
            code: 400,
            message: "存档数据无效"
        };
    }

    const updatedAt = Date.now();
    const docId = normalizeDocId(playerId);
    const db = dySDK.database();
    await db.collection("player_saves").doc(docId).set({
        playerId,
        saveData: {
            version: Number(saveData.version) || 1,
            updatedAt,
            records: saveData.records
        },
        updatedAt
    });

    return {
        code: 0,
        message: "保存存档成功",
        data: {
            updatedAt
        }
    };
}

function isValidSaveData(saveData: any): boolean {
    return !!saveData &&
        typeof saveData === "object" &&
        !!saveData.records &&
        typeof saveData.records === "object";
}

function normalizeDocId(playerId: string): string {
    return String(playerId || "")
        .trim()
        .replace(/[^\w-]/g, "_")
        .slice(0, 120);
}
