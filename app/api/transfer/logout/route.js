export const runtime = "nodejs";

import { clearTransferSession } from "@/lib/transfer-auth";

export async function POST() {
  await clearTransferSession();
  return Response.json({ ok: true });
}
