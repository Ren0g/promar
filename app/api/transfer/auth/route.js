export const runtime = "nodejs";

import { setTransferSession } from "@/lib/transfer-auth";
import {
  getProjectConfig,
  normalizeProjectCode,
  resolveRoleForPin
} from "@/lib/transfer-config";
import { jsonError } from "@/lib/transfer-helpers";

export async function POST(request) {
  try {
    const body = await request.json();
    const projectCode = normalizeProjectCode(body.projectCode);
    const pin = String(body.pin || "").trim();

    if (!projectCode || !pin) {
      return jsonError("Upiši šifru svadbe i PIN.");
    }

    const project = getProjectConfig(projectCode);
    if (!project) {
      return jsonError("Projekt nije pronađen.", 404);
    }

    if (project.expiresAt && new Date(project.expiresAt).getTime() < Date.now()) {
      return jsonError("Ovaj projekt je istekao.", 403);
    }

    const role = resolveRoleForPin(project, pin);
    if (!role) {
      return jsonError("Neispravan PIN.", 401);
    }

    await setTransferSession({
      projectCode,
      projectLabel: project.label,
      role
    });

    return Response.json({
      ok: true,
      projectCode,
      projectLabel: project.label,
      role
    });
  } catch (error) {
    return jsonError(error.message || "Greška kod prijave.", 500);
  }
}
