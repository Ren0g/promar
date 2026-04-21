export const runtime = 'nodejs';

import { getSignedPartUrl } from '@/lib/b2-s3';
import { assertUpload, jsonError, requireTransferSession } from '@/lib/transfer-helpers';

export async function POST(request) {
  const { session, error } = await requireTransferSession();
  if (error) return error;

  try {
    const body = await request.json();
    const area = String(body.area || '');
    const key = String(body.key || '');
    const uploadId = String(body.uploadId || '');
    const partNumber = Number(body.partNumber || 0);

    assertUpload(session.role, area);
    if (!key || !uploadId || !partNumber) return jsonError('Nedostaju podaci za upload dijela.');

    const data = await getSignedPartUrl({ key, uploadId, partNumber });
    return Response.json(data);
  } catch (err) {
    return jsonError(err.message || 'Ne mogu pripremiti upload dijela.', 500);
  }
}
