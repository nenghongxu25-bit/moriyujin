const fs = require("fs/promises");
const path = require("path");
const https = require("https");
const crypto = require("crypto");

const DATA_DIR = process.env.LOGIN_DATA_DIR || path.join(__dirname, ".data");
const USERS_FILE = path.join(DATA_DIR, "users.json");
const SESSION_TTL_MS = 1000 * 60 * 60 * 24 * 30;
const CODE2SESSION_URL = "https://developer.toutiao.com/api/apps/v2/jscode2session";

async function readJsonFile(filePath, fallback) {
    try {
        const raw = await fs.readFile(filePath, "utf8");
        return JSON.parse(raw);
    } catch {
        return fallback;
    }
}

async function writeJsonFile(filePath, data) {
    await fs.mkdir(path.dirname(filePath), { recursive: true });
    await fs.writeFile(filePath, JSON.stringify(data, null, 2), "utf8");
}

function requestJson(url, body) {
    return new Promise((resolve, reject) => {
        const payload = JSON.stringify(body);
        const req = https.request(url, {
            method: "POST",
            headers: {
                "content-type": "application/json",
                "content-length": Buffer.byteLength(payload),
            },
        }, (res) => {
            let raw = "";
            res.on("data", (chunk) => {
                raw += chunk;
            });
            res.on("end", () => {
                try {
                    resolve({
                        statusCode: res.statusCode || 0,
                        body: raw ? JSON.parse(raw) : {},
                    });
                } catch (error) {
                    reject(error);
                }
            });
        });

        req.on("error", reject);
        req.write(payload);
        req.end();
    });
}

function randomToken() {
    if (typeof crypto.randomUUID === "function") {
        return crypto.randomUUID().replace(/-/g, "");
    }
    return crypto.randomBytes(24).toString("hex");
}

async function exchangeCode(params) {
    const appid = String(params.appid || process.env.DOUYIN_APP_ID || process.env.APP_ID || "").trim();
    const secret = String(params.secret || process.env.DOUYIN_APP_SECRET || process.env.APP_SECRET || "").trim();
    const code = String(params.code || "").trim();

    if (!appid) {
        throw new Error("missing appid");
    }
    if (!secret) {
        throw new Error("missing secret");
    }
    if (!code) {
        throw new Error("missing code");
    }

    const response = await requestJson(CODE2SESSION_URL, {
        appid,
        secret,
        code,
        refresh: false,
    });

    const body = response.body || {};
    if (Number(body.err_no) !== 0) {
        throw new Error(body.err_tips || body.err_msg || body.message || `code2session failed: ${response.statusCode}`);
    }

    const data = body.data || {};
    if (!data.openid) {
        throw new Error("code2session returned empty openid");
    }

    return {
        openid: String(data.openid),
        unionid: String(data.unionid || ""),
        sessionKey: String(data.session_key || ""),
    };
}

module.exports = async function login(params, context) {
    try {
        const loginData = await exchangeCode(params || {});
        const now = Date.now();
        const db = await readJsonFile(USERS_FILE, {
            users: {},
            sessions: {},
        });

        db.users = db.users || {};
        db.sessions = db.sessions || {};

        const existing = db.users[loginData.openid];
        const created = !existing;
        const user = existing || {
            openid: loginData.openid,
            createdAt: now,
        };

        user.openid = loginData.openid;
        user.unionid = loginData.unionid || user.unionid || "";
        user.lastLoginAt = now;
        user.updatedAt = now;
        db.users[loginData.openid] = user;

        const token = randomToken();
        db.sessions[token] = {
            openid: loginData.openid,
            createdAt: now,
            expiresAt: now + SESSION_TTL_MS,
        };

        await writeJsonFile(USERS_FILE, db);

        if (context && typeof context.log === "function") {
            context.log(`login success: ${loginData.openid}, created=${created}`);
        }

        return {
            err_no: 0,
            err_msg: "ok",
            data: {
                token,
                created,
                createdAt: user.createdAt,
                lastLoginAt: user.lastLoginAt,
                openid: loginData.openid,
                unionid: loginData.unionid || "",
                user: {
                    openid: loginData.openid,
                    unionid: loginData.unionid || "",
                    createdAt: user.createdAt,
                    lastLoginAt: user.lastLoginAt,
                },
            },
        };
    } catch (error) {
        const message = error instanceof Error ? error.message : String(error || "login failed");
        if (context && typeof context.log === "function") {
            context.log(`login error: ${message}`);
        }

        return {
            err_no: 1,
            err_msg: message,
            data: null,
        };
    }
};

module.exports.default = module.exports;
