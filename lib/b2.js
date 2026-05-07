import {
  CompleteMultipartUploadCommand,
  CopyObjectCommand,
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
const FOLDER_MARKER = ".promar-folder";

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

function normalizeNameSegment(input, fallback = "folder") {
  return String(input || fallback)
    .trim()
    .replace(/[\\/:*?"<>|]/g, "-")
    .replace(/\s+/g, " ")
    .replace(/\.+$/g, "")
    .trim() || fallback;
}

export function normalizeFolderPath(input = "") {
  return String(input || "")
    .split("/")
    .map((part) => normalizeNameSegment(part, ""))
    .filter(Boolean)
    .join("/");
}

export function buildObjectKey(projectCode, folderPath, fileName) {
  const safeName = normalizeNameSegment(fileName, "file").replace(/\s+/g, "-");
  const folderPrefix = getFolderPrefix(projectCode, folderPath);
  return `${folderPrefix}${Date.now()}-${safeName}`;
}

export function getProjectPrefix(projectCode) {
  return `${getBasePrefix()}${projectCode}/`;
}

export function getFolderPrefix(projectCode, folderPath = "") {
  const normalized = normalizeFolderPath(folderPath);
  const projectPrefix = getProjectPrefix(projectCode);
  return normalized ? `${projectPrefix}${normalized}/` : projectPrefix;
}

export function ensureProjectKey(projectCode, key) {
  const expectedPrefix = getProjectPrefix(projectCode);
  if (!String(key || "").startsWith(expectedPrefix)) {
    throw new Error("Nevažeća putanja datoteke za ovaj projekt.");
  }
}

function getFileNameFromKey(key) {
  const rawName = String(key || "").split("/").pop() || "download";
  return rawName.replace(/[\r\n"]/g, "-");
}

function displayNameFromStoredName(name) {
  return String(name || "").replace(/^\d+-/, "");
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

export async function createFolder(projectCode, parentPath, folderName) {
  const prefix = getFolderPrefix(projectCode, [normalizeFolderPath(parentPath), normalizeFolderPath(folderName)].filter(Boolean).join("/"));
  await putFolderMarker(prefix);
  return { path: prefix.replace(getProjectPrefix(projectCode), "").replace(/\/$/, "") };
}

export async function renameFolder(projectCode, folderPath, newName) {
  const normalizedOld = normalizeFolderPath(folderPath);
  if (!normalizedOld) throw new Error("Folder nije valjan.");

  const parts = normalizedOld.split("/");
  parts[parts.length - 1] = normalizeNameSegment(newName, "folder");
  const normalizedNew = parts.join("/");
  if (normalizedOld === normalizedNew) return { path: normalizedNew };

  const oldPrefix = getFolderPrefix(projectCode, normalizedOld);
  const newPrefix = getFolderPrefix(projectCode, normalizedNew);
  const keys = await listAllKeys(oldPrefix);
  const Bucket = getBucketName();
  const s3 = getB2Client();

  for (const key of keys) {
    const newKey = `${newPrefix}${key.slice(oldPrefix.length)}`;
    await s3.send(new CopyObjectCommand({ Bucket, CopySource: `/${Bucket}/${key}`, Key: newKey }));
  }
  for (const key of keys) {
    await deleteObject(key);
  }

  return { path: normalizedNew };
}

export async function deleteFolder(projectCode, folderPath) {
  const prefix = getFolderPrefix(projectCode, folderPath);
  return deletePrefix(prefix);
}

async function putFolderMarker(prefix) {
  const s3 = getB2Client();
  await s3.send(
    new PutObjectCommand({
      Bucket: getBucketName(),
      Key: `${prefix}${FOLDER_MARKER}`,
      Body: "",
      ContentType: "application/x-directory"
    })
  );
}

export async function listFolderEntries(projectCode, folderPath = "") {
  const s3 = getB2Client();
  const Bucket = getBucketName();
  const Prefix = getFolderPrefix(projectCode, folderPath);

  const response = await s3.send(new ListObjectsV2Command({ Bucket, Prefix, Delimiter: "/" }));

  const folders = (response.CommonPrefixes || [])
    .map((item) => {
      const fullPrefix = item.Prefix || "";
      const relativePath = fullPrefix.slice(getProjectPrefix(projectCode).length).replace(/\/$/, "");
      const name = relativePath.split("/").pop() || relativePath;
      return { name, path: relativePath, type: "folder" };
    })
    .sort((a, b) => a.name.localeCompare(b.name, "hr"));

  const files = (response.Contents || [])
    .filter((item) => item.Key && item.Key !== Prefix + FOLDER_MARKER && !item.Key.endsWith("/"))
    .map((item) => ({
      key: item.Key,
      name: displayNameFromStoredName(item.Key.replace(Prefix, "")),
      size: item.Size || 0,
      lastModified: item.LastModified ? item.LastModified.toISOString() : null,
      type: "file"
    }))
    .sort((a, b) => new Date(b.lastModified || 0) - new Date(a.lastModified || 0));

  return {
    currentPath: normalizeFolderPath(folderPath),
    folders,
    files
  };
}



export async function listLegacyAreaFiles(projectCode, area) {
  const normalizedArea = normalizeFolderPath(area);
  if (!normalizedArea) {
    return { currentPath: "", folders: [], files: [] };
  }

  const s3 = getB2Client();
  const Bucket = getBucketName();
  const Prefix = `${getProjectPrefix(projectCode)}${normalizedArea}/`;

  const response = await s3.send(new ListObjectsV2Command({ Bucket, Prefix }));

  const files = (response.Contents || [])
    .filter((item) => item.Key && !item.Key.endsWith("/") && item.Key !== `${Prefix}${FOLDER_MARKER}`)
    .map((item) => ({
      key: item.Key,
      name: displayNameFromStoredName(item.Key.replace(Prefix, "")),
      size: item.Size || 0,
      lastModified: item.LastModified ? item.LastModified.toISOString() : null,
      type: "file"
    }))
    .sort((a, b) => new Date(b.lastModified || 0) - new Date(a.lastModified || 0));

  return {
    currentPath: normalizedArea,
    folders: [],
    files
  };
}

export function pickPartSize(fileSize) {
  const min = 100 * 1024 * 1024;
  const maxParts = 10000;
  return Math.max(min, Math.ceil(fileSize / maxParts));
}

export async function createMultipartPlan({ projectCode, folderPath, fileName, contentType, fileSize }) {
  const s3 = getB2Client();
  const Bucket = getBucketName();
  const Key = buildObjectKey(projectCode, folderPath, fileName);
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



export async function getObjectDownloadStream(key) {
  const s3 = getB2Client();
  const response = await s3.send(
    new GetObjectCommand({
      Bucket: getBucketName(),
      Key: key,
      ResponseContentType: "application/octet-stream"
    })
  );

  return {
    body: response.Body,
    fileName: getFileNameFromKey(key),
    contentLength: Number(response.ContentLength || 0)
  };
}

export async function createDownloadUrl(key) {
  const s3 = getB2Client();
  const fileName = getFileNameFromKey(key);

  return getSignedUrl(
    s3,
    new GetObjectCommand({
      Bucket: getBucketName(),
      Key: key,
      ResponseContentDisposition: `attachment; filename="${fileName}"`,
      ResponseContentType: "application/octet-stream"
    }),
    {
      expiresIn: 60 * 30
    }
  );
}

export async function deleteObject(key) {
  const s3 = getB2Client();
  return s3.send(new DeleteObjectCommand({ Bucket: getBucketName(), Key: key }));
}
