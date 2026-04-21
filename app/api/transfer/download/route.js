export const runtime = "nodejs";

import { createDownloadUrl, ensureProjectAreaKey } from "@/lib/b2";
import { assertDownload, jsonError, requireTransferSession } from "@/lib/transfer-helpers";

export async function POST(request) {
  const { session, error } = await requireTransferSession();
  if (error) return error;

  try {
    const body = await request.json();
    assertDownload(session.role, body.area);
    ensureProjectAreaKey(session.projectCode, body.area, body.key);
    const url = await createDownloadUrl(body.key);
    return Response.json({ url });
  } catch (err) {
    return jsonError(err.message || "Ne mogu pripremiti download link.", 500);
  }
}
