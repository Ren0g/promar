export const runtime = 'nodejs';

import { startMultipartUpload } from '@/lib/b2-s3';
import { assertUpload, jsonError, resolveProjectAccess } from '@/lib/transfer-helpers';

export async function POST(request) {
  const body = await request.json().catch(() => ({}));
  const { session, error } = await resolveProjectAccess(body.projectCode);
  if (error) return error;

  try {
    const fileName = String(body.fileName || '');
    const contentType = String(body.contentType || 'application/octet-stream');
    const fileSize = Number(body.fileSize || 0);
    const folderPath = String(body.path || '');

    assertUpload(session.role);
    if (!fileName || !fileSize) return jsonError('Nedostaju podaci o datoteci.');

    const plan = await startMultipartUpload({
      projectCode: session.projectCode,
      folderPath,
      fileName,
      contentType
    });

    return Response.json(plan);
  } catch (err) {
    return jsonError(err.message || 'Ne mogu pripremiti upload.', 500);
  }
}
