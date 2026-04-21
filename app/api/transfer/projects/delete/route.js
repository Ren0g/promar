export const runtime = "nodejs";

import { deleteProjectCompletely } from "@/lib/transfer-config";
import { jsonError, requireSuperAdminSession } from "@/lib/transfer-helpers";

export async function POST(request) {
  const { error } = await requireSuperAdminSession();
  if (error) return error;

  try {
    const body = await request.json();
    await deleteProjectCompletely(String(body.projectCode || ""));
    return Response.json({ ok: true });
  } catch (error) {
    return jsonError(error.message || "Ne mogu obrisati svadbu.", 500);
  }
}
