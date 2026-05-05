export const runtime = "nodejs";

import { deleteFolder } from "@/lib/b2";
import { assertFolderManage, jsonError, resolveProjectAccess } from "@/lib/transfer-helpers";

export async function POST(request) {
  const body = await request.json().catch(() => ({}));
  const { session, error } = await resolveProjectAccess(body.projectCode);
  if (error) return error;

  try {
    assertFolderManage(session.role);
    const deleted = await deleteFolder(session.projectCode, body.path || "");
    return Response.json({ ok: true, deleted });
  } catch (err) {
    return jsonError(err.message || "Ne mogu obrisati folder.", 500);
  }
}
