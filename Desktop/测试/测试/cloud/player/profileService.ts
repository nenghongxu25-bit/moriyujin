import { dySDK } from "@open-dy/node-server-sdk";
import {
  optionalNumber,
  optionalString,
  stripDocumentId,
  tryGetDocument
} from "./dbUtils";
import { getPlayerById, getPlayerDocIds } from "./playerAccountService";
import type { PlayerProfile } from "./types";

export async function getProfile(playerId: string) {
  const player = await getPlayerById(playerId);

  return {
    code: 0,
    message: "get profile success",
    data: {
      playerId,
      displayId: Number(player && player.displayId) || 0,
      profile: player && player.profile
        ? player.profile
        : null
    }
  };
}

export async function updateProfile(
  playerId: string,
  displayId: number,
  openId: string,
  anonymousOpenId: string,
  rawProfile: any
) {
  const profile = normalizeProfile(rawProfile);
  if (!profile) {
    return {
      code: 400,
      message: "profile data is invalid"
    };
  }

  const db = dySDK.database();
  const players = db.collection("players");
  const docIds = getPlayerDocIds(openId, anonymousOpenId);

  for (const docId of docIds) {
    const oldRow = await tryGetDocument(players, docId);
    await players.doc(docId).set({
      ...stripDocumentId(oldRow),
      playerId,
      displayId,
      openId,
      anonymousOpenId,
      profile,
      updatedAt: Date.now(),
      lastLoginAt: Date.now()
    });
  }

  return {
    code: 0,
    message: "update profile success",
    data: {
      displayId,
      profile
    }
  };
}

function normalizeProfile(value: any): PlayerProfile | null {
  if (!value || typeof value !== "object") {
    return null;
  }

  const nickName = String(value.nickName || value.nickname || "").trim();
  const avatarUrl = String(value.avatarUrl || value.avatar || "").trim();

  if (!nickName && !avatarUrl) {
    return null;
  }

  return {
    nickName,
    avatarUrl,
    gender: optionalNumber(value.gender),
    city: optionalString(value.city),
    province: optionalString(value.province),
    country: optionalString(value.country),
    language: optionalString(value.language),
    updatedAt: Number(value.updatedAt) || Date.now()
  };
}
