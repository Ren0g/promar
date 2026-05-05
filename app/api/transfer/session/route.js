export const runtime = "nodejs";

import { requireTransferSession } from "@/lib/transfer-helpers";

export async function GET() {
  const { session, error } = await requireTransferSession();
  if (error) return error;

  return Response.json({
    projectCode: session.projectCode,
    projectLabel: session.projectLabel,
    role: session.role
  });
}
