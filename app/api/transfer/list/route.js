export const runtime = "nodejs";

import { listFolderEntries, listLegacyAreaFiles } from "@/lib/b2";
import { getProjectConfig } from "@/lib/transfer-config";
import { jsonError, resolveProjectAccess } from "@/lib/transfer-helpers";

export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const projectCode = searchParams.get("projectCode") || "";
  const path = searchParams.get("path") || "";
  const { session, error } = await resolveProjectAccess(projectCode);
  if (error) return error;

  try {
    const project = await getProjectConfig(session.projectCode);
    if (!project) return jsonError("Projekt nije pronađen.", 404);

    if (project.mode === "legacy") {
      const [raw, final] = await Promise.all([
        listLegacyAreaFiles(session.projectCode, "raw"),
        listLegacyAreaFiles(session.projectCode, "final")
      ]);

      return Response.json({
        mode: "legacy",
        raw,
        final,
        projectCode: session.projectCode,
        projectLabel: session.projectLabel,
        role: session.role
      });
    }

    const entries = await listFolderEntries(session.projectCode, path);
    return Response.json({
      mode: "modern",
      ...entries,
      projectCode: session.projectCode,
      projectLabel: session.projectLabel,
      role: session.role
    });
  } catch (err) {
    return jsonError(err.message || "Ne mogu dohvatiti datoteke.", 500);
  }
}
