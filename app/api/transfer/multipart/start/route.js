export const runtime = "nodejs";

import { startLargeFile } from "@/lib/b2-native";
import { assertUpload, jsonError, requireTransferSession } from "@/lib/transfer-helpers";

export async function POST(request) {
  const { session, error } = await requireTransferSession();
  if (error) return error;

  try {
    const body = await request.json();
    const area = String(body.area || "");
    const fileName = String(body.fileName || "");
    const contentType = String(body.contentType || "b2/x-auto");
    const fileSize = Number(body.fileSize || 0);

    assertUpload(session.role, area);

    if (!fileName || !fileSize) {
      return jsonError("Nedostaju podaci o datoteci.");
    }

    const plan = await startLargeFile({
      projectCode: session.projectCode,
      area,
      fileName,
      contentType
    });

    return Response.json(plan);
  } catch (err) {
    return jsonError(err.message || "Ne mogu pripremiti upload.", 500);
  }
}
