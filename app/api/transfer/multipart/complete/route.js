export const runtime = "nodejs";

import { completeMultipartUpload, ensureProjectAreaKey } from "@/lib/b2";
import { assertUpload, jsonError, requireTransferSession } from "@/lib/transfer-helpers";

export async function POST(request) {
  const { session, error } = await requireTransferSession();
  if (error) return error;

  try {
    const body = await request.json();
    assertUpload(session.role, body.area);
    ensureProjectAreaKey(session.projectCode, body.area, body.key);

    await completeMultipartUpload({
      key: body.key,
      uploadId: body.uploadId,
      parts: body.parts || []
    });

    return Response.json({ ok: true });
  } catch (err) {
    return jsonError(err.message || "Ne mogu završiti upload.", 500);
  }
}
