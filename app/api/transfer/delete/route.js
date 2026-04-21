export const runtime = "nodejs";

import { deleteObject, ensureProjectAreaKey } from "@/lib/b2";
import { assertDelete, jsonError, requireTransferSession } from "@/lib/transfer-helpers";

export async function POST(request) {
  const { session, error } = await requireTransferSession();
  if (error) return error;

  try {
    const body = await request.json();
    assertDelete(session.role);
    const area = String(body.area || "");
    ensureProjectAreaKey(session.projectCode, area, body.key);
    await deleteObject(body.key);
    return Response.json({ ok: true });
  } catch (err) {
    return jsonError(err.message || "Ne mogu obrisati datoteku.", 500);
  }
}
