export const runtime = "nodejs";

import { createDownloadUrl, ensureProjectKey } from "@/lib/b2";
import { assertDownload, jsonError, resolveProjectAccess } from "@/lib/transfer-helpers";

export async function POST(request) {
  const body = await request.json().catch(() => ({}));
  const { session, error } = await resolveProjectAccess(body.projectCode);
  if (error) return error;

  try {
    assertDownload(session.role);
    ensureProjectKey(session.projectCode, body.key);
    const url = await createDownloadUrl(body.key);
    return Response.json({ url });
  } catch (err) {
    return jsonError(err.message || "Ne mogu pripremiti download link.", 500);
  }
}
