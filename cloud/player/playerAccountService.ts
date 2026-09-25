import { dySDK } from "@open-dy/node-server-sdk";
import {
  normalizeDocId,
  stripDocumentId,
  tryGetDocument
} from "./dbUtils";
import { createDisplayId, ensureDisplayId } from "./displayIdService";
import { migrateLegacySaveIfNeeded } from "./saveService";
import type { PlayerRecord } from "./types";

export async function getOrCreatePlayer(
  openId: string,
  anonymousOpenId: string
): Promise<PlayerRecord> {
  const db = dySDK.database();
  const players = db.collection("players");

  if (openId) {
    const formalDocId = normalizeDocId("open_" + openId);
    const formalPlayer = await tryGetDocument(players, formalDocId);

    if (formalPlayer?.playerId) {
      const displayId = await ensureDisplayId(formalPlayer);
      const nextPlayer = {
        ...stripDocumentId(formalPlayer),
        displayId,
        openId,
        anonymousOpenId:
          anonymousOpenId ||
          formalPlayer.anonymousOpenId ||
          "",
        lastLoginAt: Date.now()
      };

      await players.doc(formalDocId).set(nextPlayer);
      return toPlayerRecord(nextPlayer);
    }
  }

  if (anonymousOpenId) {
    const anonymousDocId = normalizeDocId(
      "anonymous_" + anonymousOpenId
    );
    const anonymousPlayer = await tryGetDocument(
      players,
      anonymousDocId
    );

    if (anonymousPlayer?.playerId) {
      const playerId = String(anonymousPlayer.playerId);
      const displayId = await ensureDisplayId(anonymousPlayer);

      if (openId) {
        const formalDocId = normalizeDocId("open_" + openId);
        await players.doc(formalDocId).set({
          playerId,
          displayId,
          openId,
          anonymousOpenId,
          profile: anonymousPlayer.profile || null,
          createdAt:
            Number(anonymousPlayer.createdAt) ||
            Date.now(),
          lastLoginAt: Date.now()
        });
      }

      const nextPlayer = {
        ...stripDocumentId(anonymousPlayer),
        displayId,
        openId:
          openId ||
          anonymousPlayer.openId ||
          "",
        anonymousOpenId,
        lastLoginAt: Date.now()
      };

      await players.doc(anonymousDocId).set(nextPlayer);
      return toPlayerRecord(nextPlayer);
    }
  }

  return createNewPlayer(openId, anonymousOpenId);
}

export async function getPlayerById(playerId: string): Promise<any | null> {
  const db = dySDK.database();
  const players = db.collection("players");

  const queryResult = await players
    .where({
      playerId
    })
    .get();

  return queryResult &&
    Array.isArray(queryResult.data) &&
    queryResult.data.length > 0
    ? queryResult.data[0]
    : null;
}

export function getPlayerDocIds(
  openId: string,
  anonymousOpenId: string
): string[] {
  const ids: string[] = [];

  if (openId) {
    ids.push(normalizeDocId("open_" + openId));
  }

  if (anonymousOpenId) {
    ids.push(normalizeDocId("anonymous_" + anonymousOpenId));
  }

  return ids;
}

async function createNewPlayer(
  openId: string,
  anonymousOpenId: string
): Promise<PlayerRecord> {
  const db = dySDK.database();
  const players = db.collection("players");
  const playerId = createPlayerId();
  const displayId = await createDisplayId();
  const now = Date.now();
  const player: PlayerRecord = {
    playerId,
    displayId,
    openId,
    anonymousOpenId,
    profile: null,
    createdAt: now,
    lastLoginAt: now
  };

  if (anonymousOpenId) {
    await players
      .doc(normalizeDocId("anonymous_" + anonymousOpenId))
      .set(player);
  }

  if (openId) {
    await players
      .doc(normalizeDocId("open_" + openId))
      .set(player);
  }

  await migrateLegacySaveIfNeeded(
    playerId,
    openId,
    anonymousOpenId
  );

  return player;
}

function createPlayerId(): string {
  return (
    "player_" +
    Date.now().toString(36) +
    "_" +
    Math.random()
      .toString(36)
      .slice(2, 10)
  );
}

function toPlayerRecord(row: any): PlayerRecord {
  return {
    playerId: String(row.playerId || ""),
    displayId: Number(row.displayId) || 0,
    openId: String(row.openId || ""),
    anonymousOpenId: String(row.anonymousOpenId || ""),
    profile: row.profile || null,
    createdAt: Number(row.createdAt) || undefined,
    lastLoginAt: Number(row.lastLoginAt) || undefined
  };
}
