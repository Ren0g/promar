export const runtime = "nodejs";

import { listFolderEntries } from "@/lib/b2";
import { jsonError, resolveProjectAccess } from "@/lib/transfer-helpers";

export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const projectCode = searchParams.get("projectCode") || "";
  const path = searchParams.get("path") || "";
  const { session, error } = await resolveProjectAccess(projectCode);
  if (error) return error;

  try {
    const entries = await listFolderEntries(session.projectCode, path);
    return Response.json({
      ...entries,
      projectCode: session.projectCode,
      projectLabel: session.projectLabel,
      role: session.role,
      mode: "modern"
    });
  } catch (err) {
    return jsonError(err.message || "Ne mogu dohvatiti datoteke.", 500);
  }
}
