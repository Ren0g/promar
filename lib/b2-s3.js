import { S3Client, CreateMultipartUploadCommand, UploadPartCommand, CompleteMultipartUploadCommand, ListPartsCommand } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import { buildObjectKey } from './b2';

function required(name) {
  const value = process.env[name];
  if (!value) throw new Error(`Missing ${name} environment variable.`);
  return value;
}

function endpointUrl() {
  const endpoint = required('B2_ENDPOINT');
  return endpoint.startsWith('http') ? endpoint : `https://${endpoint}`;
}

function getClient() {
  return new S3Client({
    region: required('B2_REGION'),
    endpoint: endpointUrl(),
    forcePathStyle: true,
    credentials: {
      accessKeyId: required('B2_KEY_ID'),
      secretAccessKey: required('B2_APPLICATION_KEY')
    }
  });
}

export async function startMultipartUpload({ projectCode, folderPath, fileName, contentType }) {
  const Key = buildObjectKey(projectCode, folderPath, fileName);
  const Bucket = required('B2_BUCKET_NAME');
  const client = getClient();
  const command = new CreateMultipartUploadCommand({
    Bucket,
    Key,
    ContentType: contentType || 'application/octet-stream'
  });
  const data = await client.send(command);
  return {
    bucket: Bucket,
    key: Key,
    uploadId: data.UploadId,
    partSize: 100 * 1024 * 1024
  };
}

export async function getSignedPartUrl({ key, uploadId, partNumber }) {
  const client = getClient();
  const command = new UploadPartCommand({
    Bucket: required('B2_BUCKET_NAME'),
    Key: key,
    UploadId: uploadId,
    PartNumber: partNumber
  });
  const url = await getSignedUrl(client, command, { expiresIn: 3600 });
  return { url };
}

export async function completeMultipartUpload({ key, uploadId }) {
  const client = getClient();
  const Bucket = required('B2_BUCKET_NAME');

  const listed = await client.send(new ListPartsCommand({ Bucket, Key: key, UploadId: uploadId }));
  const parts = (listed.Parts || []).map((part) => ({ ETag: part.ETag, PartNumber: part.PartNumber }));
  if (!parts.length) throw new Error('Nijedan dio nije uploadan.');

  await client.send(new CompleteMultipartUploadCommand({
    Bucket,
    Key: key,
    UploadId: uploadId,
    MultipartUpload: { Parts: parts }
  }));

  return { ok: true };
}
