export const runtime = "nodejs";

import { deleteObject, ensureProjectKey } from "@/lib/b2";
import { assertDelete, jsonError, resolveProjectAccess } from "@/lib/transfer-helpers";

export async function POST(request) {
  const body = await request.json().catch(() => ({}));
  const { session, error } = await resolveProjectAccess(body.projectCode);
  if (error) return error;

  try {
    assertDelete(session.role);
    ensureProjectKey(session.projectCode, body.key);
    await deleteObject(body.key);
    return Response.json({ ok: true });
  } catch (err) {
    return jsonError(err.message || "Ne mogu obrisati datoteku.", 500);
  }
}
