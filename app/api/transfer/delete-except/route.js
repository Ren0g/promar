export const runtime = "nodejs";

import { deleteObjects, ensureProjectKey, listFolderEntries } from "@/lib/b2";
import { assertDelete, jsonError, resolveProjectAccess } from "@/lib/transfer-helpers";

export async function POST(request) {
  const body = await request.json().catch(() => ({}));
  const projectCode = String(body.projectCode || "");
  const path = String(body.path || "");
  const keepKeys = Array.isArray(body.keepKeys) ? body.keepKeys.filter(Boolean) : [];
  const execute = body.execute === true;
  const expectedDeleteCount = Number(body.expectedDeleteCount);

  const { session, error } = await resolveProjectAccess(projectCode);
  if (error) return error;

  try {
    assertDelete(session.role);

    const entries = await listFolderEntries(session.projectCode, path);
    const currentFiles = entries.files || [];
    const currentKeySet = new Set(currentFiles.map((file) => file.key));

    for (const key of keepKeys) {
      ensureProjectKey(session.projectCode, key);
      if (!currentKeySet.has(key)) {
        return jsonError("Odabrana datoteka više nije u ovom folderu. Osvježite popis i pokušajte ponovno.", 409);
      }
    }

    const keepSet = new Set(keepKeys);
    const deleteKeys = currentFiles
      .map((file) => file.key)
      .filter((key) => !keepSet.has(key));

    const summary = {
      totalCount: currentFiles.length,
      keepCount: keepKeys.length,
      deleteCount: deleteKeys.length
    };

    if (!execute) {
      return Response.json({ ok: true, preview: true, ...summary });
    }

    if (!Number.isFinite(expectedDeleteCount) || expectedDeleteCount !== deleteKeys.length) {
      return jsonError(
        "Broj datoteka u folderu promijenio se nakon potvrde. Ništa nije obrisano. Osvježite popis i pokušajte ponovno.",
        409
      );
    }

    const result = await deleteObjects(deleteKeys);

    if (result.errors.length) {
      return Response.json(
        {
          ok: false,
          ...summary,
          deletedCount: result.deletedCount,
          errors: result.errors
        },
        { status: 207 }
      );
    }

    return Response.json({
      ok: true,
      ...summary,
      deletedCount: result.deletedCount
    });
  } catch (err) {
    return jsonError(err.message || "Ne mogu obrisati odabrane datoteke.", 500);
  }
}
