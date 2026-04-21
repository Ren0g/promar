import {
  CompleteMultipartUploadCommand,
  CreateMultipartUploadCommand,
  DeleteObjectCommand,
  GetObjectCommand,
  ListObjectsV2Command,
  PutObjectCommand,
  S3Client,
  UploadPartCommand
} from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";

let client;

function required(name) {
  const value = process.env[name];
  if (!value) throw new Error(`Missing ${name} environment variable.`);
  return value;
}

export function getB2Client() {
  if (client) return client;

  client = new S3Client({
    region: required("B2_REGION"),
    endpoint: required("B2_ENDPOINT"),
    forcePathStyle: true,
    credentials: {
      accessKeyId: required("B2_KEY_ID"),
      secretAccessKey: required("B2_APPLICATION_KEY")
    }
  });

  return client;
}

export function getBucketName() {
  return required("B2_BUCKET_NAME");
}

export function getBasePrefix() {
  return (process.env.B2_BASE_PREFIX || "weddings/").replace(/^\/+|\/+$/g, "") + "/";
}

export function getPortalManifestKey() {
  return `${getBasePrefix()}_portal/projects.json`;
}

export function buildObjectKey(projectCode, area, fileName) {
  const safeName = String(fileName || "file")
    .replace(/[^a-zA-Z0-9._ -]/g, "-")
    .replace(/\s+/g, "-");

  return `${getBasePrefix()}${projectCode}/${area}/${Date.now()}-${safeName}`;
}

export function getAreaPrefix(projectCode, area) {
  return `${getBasePrefix()}${projectCode}/${area}/`;
}

export function ensureProjectAreaKey(projectCode, area, key) {
  const expectedPrefix = getAreaPrefix(projectCode, area);
  if (!String(key || "").startsWith(expectedPrefix)) {
    throw new Error("Nevažeća putanja datoteke za ovaj projekt.");
  }
}

async function streamToString(stream) {
  return await new Response(stream).text();
}

export async function readJsonObject(key) {
  const s3 = getB2Client();
  try {
    const response = await s3.send(new GetObjectCommand({ Bucket: getBucketName(), Key: key }));
    const text = await streamToString(response.Body);
    return JSON.parse(text);
  } catch (error) {
    const code = error?.name || error?.Code || error?.code;
    if (code === "NoSuchKey" || error?.$metadata?.httpStatusCode === 404) return null;
    throw error;
  }
}

export async function writeJsonObject(key, value) {
  const s3 = getB2Client();
  await s3.send(
    new PutObjectCommand({
      Bucket: getBucketName(),
      Key: key,
      Body: JSON.stringify(value, null, 2),
      ContentType: "application/json"
    })
  );
}

export async function listAllKeys(prefix) {
  const s3 = getB2Client();
  const Bucket = getBucketName();
  const keys = [];
  let ContinuationToken;

  do {
    const response = await s3.send(
      new ListObjectsV2Command({ Bucket, Prefix: prefix, ContinuationToken })
    );
    for (const item of response.Contents || []) {
      if (item.Key) keys.push(item.Key);
    }
    ContinuationToken = response.NextContinuationToken;
  } while (ContinuationToken);

  return keys;
}

export async function deletePrefix(prefix) {
  const keys = await listAllKeys(prefix);
  for (const key of keys) {
    await deleteObject(key);
  }
  return keys.length;
}

export async function listAreaFiles(projectCode, area) {
  const s3 = getB2Client();
  const Bucket = getBucketName();
  const Prefix = getAreaPrefix(projectCode, area);

  const response = await s3.send(new ListObjectsV2Command({ Bucket, Prefix }));

  return (response.Contents || [])
    .filter((item) => item.Key && !item.Key.endsWith("/"))
    .map((item) => ({
      key: item.Key,
      name: item.Key.replace(Prefix, ""),
      size: item.Size || 0,
      lastModified: item.LastModified ? item.LastModified.toISOString() : null,
      area
    }))
    .sort((a, b) => new Date(b.lastModified || 0) - new Date(a.lastModified || 0));
}

export function pickPartSize(fileSize) {
  const min = 100 * 1024 * 1024;
  const maxParts = 10000;
  return Math.max(min, Math.ceil(fileSize / maxParts));
}

export async function createMultipartPlan({ projectCode, area, fileName, contentType, fileSize }) {
  const s3 = getB2Client();
  const Bucket = getBucketName();
  const Key = buildObjectKey(projectCode, area, fileName);
  const partSize = pickPartSize(fileSize);
  const partCount = Math.ceil(fileSize / partSize);

  const start = await s3.send(
    new CreateMultipartUploadCommand({
      Bucket,
      Key,
      ContentType: contentType || "application/octet-stream"
    })
  );

  const uploadId = start.UploadId;
  if (!uploadId) throw new Error("Ne mogu otvoriti upload na Backblazeu.");

  const parts = [];
  for (let index = 1; index <= partCount; index += 1) {
    const url = await getSignedUrl(
      s3,
      new UploadPartCommand({ Bucket, Key, UploadId: uploadId, PartNumber: index }),
      { expiresIn: 60 * 60 * 2 }
    );
    parts.push({ partNumber: index, url });
  }

  return { uploadId, key: Key, partSize, partCount, urls: parts };
}

export async function completeMultipartUpload({ key, uploadId, parts }) {
  const s3 = getB2Client();
  const Bucket = getBucketName();

  return s3.send(
    new CompleteMultipartUploadCommand({
      Bucket,
      Key: key,
      UploadId: uploadId,
      MultipartUpload: {
        Parts: parts
          .slice()
          .sort((a, b) => a.PartNumber - b.PartNumber)
          .map((part) => ({ ETag: part.ETag, PartNumber: part.PartNumber }))
      }
    })
  );
}

export async function createDownloadUrl(key) {
  const s3 = getB2Client();
  return getSignedUrl(s3, new GetObjectCommand({ Bucket: getBucketName(), Key: key }), {
    expiresIn: 60 * 30
  });
}

export async function deleteObject(key) {
  const s3 = getB2Client();
  return s3.send(new DeleteObjectCommand({ Bucket: getBucketName(), Key: key }));
}
