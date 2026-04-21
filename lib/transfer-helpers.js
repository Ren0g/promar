import { getTransferSession } from "./transfer-auth";
import { canDelete, canDownload, canUpload } from "./transfer-config";

export function jsonError(message, status = 400) {
  return Response.json({ error: message }, { status });
}

export async function requireTransferSession() {
  const session = await getTransferSession();
  if (!session) {
    return { error: jsonError("Sesija je istekla. Ponovno upiši PIN.", 401) };
  }
  return { session };
}

export function assertUpload(role, area) {
  if (!canUpload(role, area)) {
    throw new Error("Nemaš pravo uploada u ovu sekciju.");
  }
}

export function assertDownload(role, area) {
  if (!canDownload(role, area)) {
    throw new Error("Nemaš pravo preuzimanja iz ove sekcije.");
  }
}

export function assertDelete(role) {
  if (!canDelete(role)) {
    throw new Error("Brisanje je dopušteno samo admin PIN-u.");
  }
}
