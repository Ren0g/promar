export const runtime = "nodejs";

import { getUploadPartUrl } from "@/lib/b2-native";
import { assertUpload, jsonError, requireTransferSession } from "@/lib/transfer-helpers";

export async function POST(request) {
  const { session, error } = await requireTransferSession();
  if (error) return error;

  try {
    const body = await request.json();
    const area = String(body.area || "");
    const fileId = String(body.fileId || "");

    assertUpload(session.role, area);
    if (!fileId) return jsonError("Nedostaje fileId.");

    const data = await getUploadPartUrl(fileId);
    return Response.json({ uploadUrl: data.uploadUrl, authorizationToken: data.authorizationToken });
  } catch (err) {
    return jsonError(err.message || "Ne mogu pripremiti upload dijela.", 500);
  }
}
