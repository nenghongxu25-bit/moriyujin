import { dySDK } from "@open-dy/node-server-sdk";
import {
  normalizeDocId,
  stripDocumentId,
  tryGetDocument
} from "./dbUtils";

export async function migrateLegacySaveIfNeeded(
  playerId: string,
  openId: string,
  anonymousOpenId: string
) {
  const db = dySDK.database();
  const saves = db.collection("player_saves");
  const newDocId = normalizeDocId(playerId);
  const current = await tryGetDocument(saves, newDocId);

  if (current) {
    return;
  }

  const legacyIds: string[] = [];

  if (openId) {
    legacyIds.push(normalizeDocId(openId));
  }

  if (anonymousOpenId) {
    legacyIds.push(normalizeDocId(anonymousOpenId));
  }

  for (const legacyId of legacyIds) {
    if (!legacyId || legacyId === newDocId) {
      continue;
    }

    const legacySave = await tryGetDocument(saves, legacyId);
    if (!legacySave) {
      continue;
    }

    console.log(
      "[migration] migrate legacy save:",
      legacyId,
      "->",
      newDocId
    );

    await saves.doc(newDocId).set({
      ...stripDocumentId(legacySave),
      playerId,
      migratedFrom: legacyId,
      migratedAt: Date.now()
    });

    return;
  }
}

export async function loadSave(playerId: string) {
  const docId = normalizeDocId(playerId);
  const db = dySDK.database();
  const row = await tryGetDocument(
    db.collection("player_saves"),
    docId
  );

  return {
    code: 0,
    message: row
      ? "load save success"
      : "no save data",
    data: {
      saveData:
        row && row.saveData
          ? row.saveData
          : null
    }
  };
}

export async function saveGame(
  playerId: string,
  saveData: any
) {
  if (!isValidSaveData(saveData)) {
    return {
      code: 400,
      message: "save data is invalid"
    };
  }

  const updatedAt = Date.now();
  const docId = normalizeDocId(playerId);
  const db = dySDK.database();

  await db
    .collection("player_saves")
    .doc(docId)
    .set({
      playerId,
      saveData: {
        version:
          Number(saveData.version) || 1,
        updatedAt,
        records: saveData.records
      },
      updatedAt
    });

  return {
    code: 0,
    message: "save game success",
    data: {
      updatedAt
    }
  };
}

function isValidSaveData(saveData: any): boolean {
  return (
    !!saveData &&
    typeof saveData === "object" &&
    !!saveData.records &&
    typeof saveData.records === "object"
  );
}
