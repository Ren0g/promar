export const runtime = 'nodejs';

import { abortMultipartUpload } from '@/lib/b2-s3';
import { assertUpload, jsonError, resolveProjectAccess } from '@/lib/transfer-helpers';

export async function POST(request) {
  const body = await request.json().catch(() => ({}));
  const { session, error } = await resolveProjectAccess(body.projectCode);
  if (error) return error;

  try {
    const key = String(body.key || '');
    const uploadId = String(body.uploadId || '');

    assertUpload(session.role);
    if (!key || !uploadId) return jsonError('Nedostaju podaci za prekid uploada.');

    return Response.json(await abortMultipartUpload({ key, uploadId }));
  } catch (err) {
    return jsonError(err.message || 'Ne mogu prekinuti nedovršeni upload.', 500);
  }
}
