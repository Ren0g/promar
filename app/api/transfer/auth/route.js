export const runtime = "nodejs";

import { setTransferSession, readInviteToken } from "@/lib/transfer-auth";
import { getProjectConfig, isAdminPin, resolveRoleForPin } from "@/lib/transfer-config";
import { jsonError } from "@/lib/transfer-helpers";

export async function POST(request) {
  try {
    const body = await request.json();
    const pin = String(body.pin || body.adminPin || "").trim();

    if (body.mode === "admin") {
      if (!pin) return jsonError("Upiši admin PIN.");
      if (!isAdminPin(pin)) return jsonError("Neispravan admin PIN.", 401);

      await setTransferSession({ role: "superadmin", projectCode: null, projectLabel: "Admin" });
      return Response.json({ ok: true, role: "superadmin", projectLabel: "Admin" });
    }

    const inviteToken = String(body.inviteToken || "").trim();
    if (!inviteToken || !pin) {
      return jsonError("Nedostaje link ili PIN za pristup.");
    }

    const invite = readInviteToken(inviteToken);
    if (!invite?.projectCode || !invite?.role) {
      return jsonError("Pozivnica nije valjana ili je istekla.", 401);
    }

    const project = await getProjectConfig(invite.projectCode);
    if (!project) return jsonError("Svadba nije pronađena.", 404);
    if (project.expiresAt && new Date(project.expiresAt).getTime() < Date.now()) {
      return jsonError("Ovaj projekt je istekao.", 403);
    }

    const role = resolveRoleForPin(project, pin);
    if (!role || role !== invite.role) {
      return jsonError("Neispravan PIN za ovaj pristup.", 401);
    }

    await setTransferSession({
      projectCode: invite.projectCode,
      projectLabel: project.label,
      role
    });

    return Response.json({ ok: true, projectCode: invite.projectCode, projectLabel: project.label, role });
  } catch (error) {
    return jsonError(error.message || "Greška kod prijave.", 500);
  }
}
