const API_VERSION = 'v4';
let authCache = null;
let bucketCache = null;

function required(name) {
  const value = process.env[name];
  if (!value) throw new Error(`Missing ${name} environment variable.`);
  return value;
}

function basicAuth() {
  const keyId = required('B2_KEY_ID');
  const key = required('B2_APPLICATION_KEY');
  return Buffer.from(`${keyId}:${key}`).toString('base64');
}

async function b2Fetch(url, options = {}) {
  const response = await fetch(url, options);
  const data = await response.json().catch(() => ({}));
  if (!response.ok) {
    const message = data?.message || data?.code || `Backblaze request failed (${response.status}).`;
    throw new Error(message);
  }
  return data;
}

export async function authorizeB2() {
  if (authCache && authCache.expiresAt > Date.now() + 60_000) return authCache.data;

  const data = await b2Fetch(`https://api.backblazeb2.com/${API_VERSION}/b2_authorize_account`, {
    method: 'GET',
    headers: {
      Authorization: `Basic ${basicAuth()}`
    },
    cache: 'no-store'
  });

  authCache = {
    data,
    expiresAt: Date.now() + 1000 * 60 * 60
  };

  return data;
}

export async function getBucketId() {
  if (bucketCache) return bucketCache;
  const auth = await authorizeB2();
  const data = await b2Fetch(`${auth.apiInfo.storageApi.apiUrl}/${API_VERSION}/b2_list_buckets`, {
    method: 'POST',
    headers: {
      Authorization: auth.authorizationToken,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({ accountId: auth.accountId, bucketName: required('B2_BUCKET_NAME') }),
    cache: 'no-store'
  });

  const bucket = (data.buckets || []).find((item) => item.bucketName === required('B2_BUCKET_NAME'));
  if (!bucket?.bucketId) throw new Error('Bucket nije pronađen na Backblaze računu.');
  bucketCache = bucket.bucketId;
  return bucket.bucketId;
}

export function buildObjectKey(projectCode, area, fileName) {
  const safeName = String(fileName || 'file')
    .replace(/[^a-zA-Z0-9._ -]/g, '-')
    .replace(/\s+/g, '-');
  const prefix = (process.env.B2_BASE_PREFIX || 'weddings').replace(/^\/+|\/+$/g, '');
  return `${prefix}/${projectCode}/${area}/${Date.now()}-${safeName}`;
}

export async function startLargeFile({ projectCode, area, fileName, contentType }) {
  const auth = await authorizeB2();
  const bucketId = await getBucketId();
  const fileKey = buildObjectKey(projectCode, area, fileName);
  const data = await b2Fetch(`${auth.apiInfo.storageApi.apiUrl}/${API_VERSION}/b2_start_large_file`, {
    method: 'POST',
    headers: {
      Authorization: auth.authorizationToken,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      bucketId,
      fileName: fileKey,
      contentType: contentType || 'b2/x-auto'
    }),
    cache: 'no-store'
  });

  return {
    fileId: data.fileId,
    key: fileKey,
    partSize: auth.apiInfo.storageApi.recommendedPartSize,
    absoluteMinimumPartSize: auth.apiInfo.storageApi.absoluteMinimumPartSize
  };
}

export async function getUploadPartUrl(fileId) {
  const auth = await authorizeB2();
  return b2Fetch(`${auth.apiInfo.storageApi.apiUrl}/${API_VERSION}/b2_get_upload_part_url`, {
    method: 'POST',
    headers: {
      Authorization: auth.authorizationToken,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({ fileId }),
    cache: 'no-store'
  });
}

export async function finishLargeFile({ fileId, partSha1Array }) {
  const auth = await authorizeB2();
  return b2Fetch(`${auth.apiInfo.storageApi.apiUrl}/${API_VERSION}/b2_finish_large_file`, {
    method: 'POST',
    headers: {
      Authorization: auth.authorizationToken,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({ fileId, partSha1Array }),
    cache: 'no-store'
  });
}
