export const runtime = "nodejs";

import { finishLargeFile } from "@/lib/b2-native";
import { assertUpload, jsonError, requireTransferSession } from "@/lib/transfer-helpers";

export async function POST(request) {
  const { session, error } = await requireTransferSession();
  if (error) return error;

  try {
    const body = await request.json();
    assertUpload(session.role, body.area);

    const fileId = String(body.fileId || "");
    const partSha1Array = Array.isArray(body.partSha1Array) ? body.partSha1Array : [];

    if (!fileId || !partSha1Array.length) {
      return jsonError("Nedostaju podaci za završetak uploada.");
    }

    await finishLargeFile({ fileId, partSha1Array });

    return Response.json({ ok: true });
  } catch (err) {
    return jsonError(err.message || "Ne mogu završiti upload.", 500);
  }
}
