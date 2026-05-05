export const runtime = "nodejs";

import { listFolderEntries, listLegacyAreaFiles } from "@/lib/b2";
import { getProjectConfig } from "@/lib/transfer-config";
import { jsonError, resolveProjectAccess } from "@/lib/transfer-helpers";

function legacyRootEntries() {
  return {
    currentPath: "",
    folders: [
      { name: "Ulazni materijali", path: "raw", type: "folder" },
      { name: "Gotovi materijali", path: "final", type: "folder" }
    ],
    files: []
  };
}

export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const projectCode = searchParams.get("projectCode") || "";
  const path = searchParams.get("path") || "";
  const { session, error } = await resolveProjectAccess(projectCode);
  if (error) return error;

  try {
    const project = await getProjectConfig(session.projectCode);
    const shouldUseLegacyView =
      project?.mode === "legacy" && (session.role === "crew" || session.role === "editor");

    if (shouldUseLegacyView) {
      const normalizedPath = String(path || "").trim();
      const entries = !normalizedPath
        ? legacyRootEntries()
        : await listLegacyAreaFiles(session.projectCode, normalizedPath);

      return Response.json({
        ...entries,
        projectCode: session.projectCode,
        projectLabel: session.projectLabel,
        role: session.role,
        mode: "legacy"
      });
    }

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
