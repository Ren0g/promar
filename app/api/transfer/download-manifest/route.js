export const runtime = "nodejs";

import { ensureProjectKey, getFolderPrefix, listAllKeys, getFileSize } from "@/lib/b2";
import { assertDownload, jsonError, resolveProjectAccess } from "@/lib/transfer-helpers";

function stripTimestamp(name) {
  return String(name || "download").replace(/^\d+-/, "");
}

async function mapWithConcurrency(items, limit, worker) {
  const results = new Array(items.length);
  let nextIndex = 0;

  async function run() {
    while (true) {
      const index = nextIndex;
      nextIndex += 1;
      if (index >= items.length) return;
      results[index] = await worker(items[index], index);
    }
  }

  await Promise.all(Array.from({ length: Math.min(limit, items.length) }, () => run()));
  return results;
}

export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const projectCode = searchParams.get("projectCode") || "";
  const folderPath = searchParams.get("path") || "";
  const { session, error } = await resolveProjectAccess(projectCode);
  if (error) return error;

  try {
    assertDownload(session.role);

    const prefix = getFolderPrefix(session.projectCode, folderPath);
    const keys = await listAllKeys(prefix);
    const fileKeys = keys.filter(
      (key) => key && !key.endsWith("/") && !key.endsWith(".promar-folder")
    );

    if (!fileKeys.length) {
      return jsonError("U ovom folderu nema datoteka za preuzimanje.", 400);
    }

    const items = await mapWithConcurrency(fileKeys, 8, async (key) => {
      ensureProjectKey(session.projectCode, key);
      const size = await getFileSize(key);
      const relative = key.slice(prefix.length);
      const parts = relative.split("/");
      const fileName = stripTimestamp(parts.pop() || "download");
      const savePath = [...parts, fileName].filter(Boolean).join("/");
      return { key, savePath, size };
    });

    return Response.json(
      {
        items,
        totalFiles: items.length,
        totalBytes: items.reduce((sum, item) => sum + Number(item.size || 0), 0)
      },
      { headers: { "Cache-Control": "no-store" } }
    );
  } catch (err) {
    return jsonError(err.message || "Ne mogu pripremiti popis datoteka za preuzimanje.", 500);
  }
}
