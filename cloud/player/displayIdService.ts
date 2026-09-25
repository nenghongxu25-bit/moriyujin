import { dySDK } from "@open-dy/node-server-sdk";
import { tryGetDocument } from "./dbUtils";

const DISPLAY_ID_START = 10000000;
const COUNTER_COLLECTION = "counters";
const PLAYER_DISPLAY_COUNTER_ID = "player_display_id";

export async function ensureDisplayId(playerRow: any): Promise<number> {
  const existing = Number(playerRow && playerRow.displayId);
  if (Number.isFinite(existing) && existing > 0) {
    return Math.floor(existing);
  }

  return createDisplayId();
}

export async function createDisplayId(): Promise<number> {
  const db = dySDK.database();
  const counters = db.collection(COUNTER_COLLECTION);
  const counterDoc = counters.doc(PLAYER_DISPLAY_COUNTER_ID);
  const command = (db as any).command;

  try {
    await counterDoc.update({
      nextDisplayId: command.inc(1),
      updatedAt: Date.now()
    });
  } catch (error) {
    await counterDoc.set({
      nextDisplayId: DISPLAY_ID_START + 1,
      updatedAt: Date.now()
    });

    return DISPLAY_ID_START + 1;
  }

  const row = await tryGetDocument(
    counters,
    PLAYER_DISPLAY_COUNTER_ID
  );
  const nextDisplayId = Number(row && row.nextDisplayId);

  if (!Number.isFinite(nextDisplayId) || nextDisplayId <= DISPLAY_ID_START) {
    return DISPLAY_ID_START + 1;
  }

  return Math.floor(nextDisplayId);
}
