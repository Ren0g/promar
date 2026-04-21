export const runtime = "nodejs";

import { listAreaFiles } from "@/lib/b2";
import { requireTransferSession, jsonError } from "@/lib/transfer-helpers";

export async function GET() {
  const { session, error } = await requireTransferSession();
  if (error) return error;

  try {
    const [raw, final] = await Promise.all([
      listAreaFiles(session.projectCode, "raw"),
      listAreaFiles(session.projectCode, "final")
    ]);

    return Response.json({ raw, final });
  } catch (err) {
    return jsonError(err.message || "Ne mogu dohvatiti datoteke.", 500);
  }
}
