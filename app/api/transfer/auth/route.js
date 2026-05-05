export const runtime = "nodejs";

import { setTransferSession, readInviteToken } from "@/lib/transfer-auth";
import { getProjectConfig, isAdminPin } from "@/lib/transfer-config";
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
    if (!project) {
      return jsonError("Projekt nije pronađen.", 404);
    }

    if (project.expiresAt && new Date(project.expiresAt) < new Date()) {
      return jsonError("Ovaj projekt je istekao.", 403);
    }

    if (String(project.accessPin || "") !== pin) {
      return jsonError("Neispravan PIN.", 401);
    }

    const role = invite.role === "admin" ? "admin" : "user";

    await setTransferSession({
      role,
      projectCode: project.code,
      projectLabel: project.label
    });

    return Response.json({
      ok: true,
      role,
      projectCode: project.code,
      projectLabel: project.label,
      mode: "modern"
    });
  } catch (error) {
    return jsonError(error.message || "Ne mogu prijaviti korisnika.", 500);
  }
}
