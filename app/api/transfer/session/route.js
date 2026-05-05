export const runtime = "nodejs";

import { requireTransferSession } from "@/lib/transfer-helpers";
import { getProjectConfig } from "@/lib/transfer-config";

export async function GET() {
  const { session, error } = await requireTransferSession();
  if (error) return error;

  const payload = {
    projectCode: session.projectCode,
    projectLabel: session.projectLabel,
    role: session.role,
    mode: session.role === "superadmin" ? "superadmin" : "modern"
  };

  if (session.projectCode) {
    const project = await getProjectConfig(session.projectCode);
    if (project) payload.mode = project.mode;
  }

  return Response.json(payload);
}
