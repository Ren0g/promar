export const runtime = "nodejs";

import { createProject, listProjectsForAdmin } from "@/lib/transfer-config";
import { jsonError, requireSuperAdminSession } from "@/lib/transfer-helpers";

export async function GET() {
  const { error } = await requireSuperAdminSession();
  if (error) return error;

  try {
    const projects = await listProjectsForAdmin();
    return Response.json({ projects });
  } catch (error) {
    return jsonError(error.message || "Ne mogu dohvatiti svadbe.", 500);
  }
}

export async function POST(request) {
  const { error } = await requireSuperAdminSession();
  if (error) return error;

  try {
    const body = await request.json();
    const project = await createProject({ label: body.label, expiresAt: body.expiresAt || null });
    return Response.json({ project });
  } catch (error) {
    return jsonError(error.message || "Ne mogu napraviti svadbu.", 500);
  }
}
