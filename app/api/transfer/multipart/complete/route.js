export const runtime = 'nodejs';

import { completeMultipartUpload } from '@/lib/b2-s3';
import { assertUpload, jsonError, resolveProjectAccess } from '@/lib/transfer-helpers';

export async function POST(request) {
  const body = await request.json().catch(() => ({}));
  const { session, error } = await resolveProjectAccess(body.projectCode);
  if (error) return error;

  try {
    const key = String(body.key || '');
    const uploadId = String(body.uploadId || '');

    assertUpload(session.role);
    if (!key || !uploadId) return jsonError('Nedostaju podaci za završetak uploada.');

    const data = await completeMultipartUpload({ key, uploadId });
    return Response.json(data);
  } catch (err) {
    return jsonError(err.message || 'Ne mogu završiti upload.', 500);
  }
}
