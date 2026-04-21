export const runtime = 'nodejs';

import { completeMultipartUpload } from '@/lib/b2-s3';
import { assertUpload, jsonError, requireTransferSession } from '@/lib/transfer-helpers';

export async function POST(request) {
  const { session, error } = await requireTransferSession();
  if (error) return error;

  try {
    const body = await request.json();
    const area = String(body.area || '');
    const key = String(body.key || '');
    const uploadId = String(body.uploadId || '');

    assertUpload(session.role, area);
    if (!key || !uploadId) return jsonError('Nedostaju podaci za završetak uploada.');

    const data = await completeMultipartUpload({ key, uploadId });
    return Response.json(data);
  } catch (err) {
    return jsonError(err.message || 'Ne mogu završiti upload.', 500);
  }
}
