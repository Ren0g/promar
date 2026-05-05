import { getTransferSession } from "./transfer-auth";
import { canDelete, canDownload, canManageFolders, canUpload, getProjectConfig } from "./transfer-config";

export function jsonError(message, status = 400) {
  return Response.json({ error: message }, { status });
}

export async function requireTransferSession() {
  const session = await getTransferSession();
  if (!session) {
    return { error: jsonError("Sesija je istekla. Prijavi se ponovno.", 401) };
  }
  return { session };
}

export async function requireSuperAdminSession() {
  const { session, error } = await requireTransferSession();
  if (error) return { error };
  if (session.role !== "superadmin") {
    return { error: jsonError("Ova akcija je dopuštena samo admin ulazu.", 403) };
  }
  return { session };
}

export async function resolveProjectAccess(projectCodeFromRequest) {
  const { session, error } = await requireTransferSession();
  if (error) return { error };

  const requestedProjectCode = String(projectCodeFromRequest || "").trim();

  if (session.role === "superadmin") {
    if (!requestedProjectCode) return { error: jsonError("Nedostaje projekt.", 400) };
    const project = await getProjectConfig(requestedProjectCode);
    if (!project) return { error: jsonError("Projekt nije pronađen.", 404) };
    return {
      session: {
        role: "admin",
        projectCode: project.code,
        projectLabel: project.label,
        isSuperAdminView: true
      }
    };
  }

  if (!session.projectCode) return { error: jsonError("Nedostaje projekt u sesiji.", 400) };
  return { session };
}

export function assertUpload(role) {
  if (!canUpload(role)) throw new Error("Nemaš pravo uploada u ovaj projekt.");
}

export function assertDownload(role) {
  if (!canDownload(role)) throw new Error("Nemaš pravo preuzimanja iz ovog projekta.");
}

export function assertDelete(role) {
  if (!canDelete(role)) throw new Error("Brisanje je dopušteno samo admin pristupu.");
}

export function assertFolderManage(role) {
  if (!canManageFolders(role)) throw new Error("Rad s folderima je dopušten samo admin pristupu.");
}
