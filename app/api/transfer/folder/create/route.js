export const runtime = "nodejs";

import { createFolder } from "@/lib/b2";
import { assertFolderManage, jsonError, resolveProjectAccess } from "@/lib/transfer-helpers";

export async function POST(request) {
  const body = await request.json().catch(() => ({}));
  const { session, error } = await resolveProjectAccess(body.projectCode);
  if (error) return error;

  try {
    assertFolderManage(session.role);
    const folder = await createFolder(session.projectCode, body.path || "", body.name || "");
    return Response.json({ ok: true, folder });
  } catch (err) {
    return jsonError(err.message || "Ne mogu napraviti folder.", 500);
  }
}
