export function normalizeDocId(value: string): string {
  return String(value || "")
    .trim()
    .replace(/[^\w-]/g, "_")
    .slice(0, 120);
}

export async function tryGetDocument(
  collection: any,
  docId: string
): Promise<any | null> {
  try {
    const result = await collection.doc(docId).get();
    return getFirstRow(result);
  } catch (error) {
    console.log(
      "[db] document not found or get failed:",
      docId
    );

    return null;
  }
}

export function getFirstRow(result: any): any | null {
  if (!result) {
    return null;
  }

  if (
    Array.isArray(result.data) &&
    result.data.length > 0
  ) {
    return result.data[0];
  }

  if (
    result.data &&
    typeof result.data === "object" &&
    !Array.isArray(result.data)
  ) {
    return result.data;
  }

  return null;
}

export function stripDocumentId(value: any): any {
  if (!value || typeof value !== "object") {
    return {};
  }

  const { _id, ...rest } = value;
  return rest;
}

export function optionalString(value: unknown): string | undefined {
  const text = String(value || "").trim();
  return text || undefined;
}

export function optionalNumber(value: unknown): number | undefined {
  const num = Number(value);
  return Number.isFinite(num) ? num : undefined;
}
