import { dySDK } from "@open-dy/node-server-sdk";
import { getOrCreatePlayer } from "./playerAccountService";
import { getProfile, updateProfile } from "./profileService";
import { loadSave, saveGame } from "./saveService";
import { getServerTime } from "./timeService";

export default async function (params: any, context: any) {
  const action = String((params && params.action) || "login");
  const serviceContext = dySDK.context(context);
  const userInfo = serviceContext.getContext();
  const openId = String(userInfo.openId || "");
  const anonymousOpenId = String(userInfo.anonymousOpenid || "");

  console.log("[cloud] userInfo:", userInfo);
  console.log("[cloud] openId:", openId);
  console.log("[cloud] anonymousOpenId:", anonymousOpenId);
  console.log("[cloud] action:", action);

  if (!openId && !anonymousOpenId) {
    return {
      code: 401,
      message: "player identity is unavailable"
    };
  }

  try {
    const player = await getOrCreatePlayer(
      openId,
      anonymousOpenId
    );

    if (action === "login") {
      return {
        code: 0,
        message: "login success",
        data: {
          playerId: player.playerId,
          displayId: player.displayId || 0,
          isFormalAccount: !!openId,
          profile: player.profile || null
        }
      };
    }

    if (action === "getServerTime") {
      return getServerTime();
    }

    if (action === "getProfile") {
      return getProfile(player.playerId);
    }

    if (action === "updateProfile") {
      return updateProfile(
        player.playerId,
        player.displayId,
        openId,
        anonymousOpenId,
        params && params.profile
      );
    }

    if (action === "loadSave") {
      return loadSave(player.playerId);
    }

    if (action === "saveGame") {
      return saveGame(
        player.playerId,
        params && params.saveData
      );
    }

    return {
      code: 400,
      message: `unknown action: ${action}`
    };
  } catch (error) {
    console.error("[cloud] error:", error);

    return {
      code: -1,
      message:
        error instanceof Error
          ? error.message
          : String(error)
    };
  }
}
