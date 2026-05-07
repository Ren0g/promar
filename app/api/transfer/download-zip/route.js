export const runtime = "nodejs";

import { ensureProjectKey, getObjectDownloadStream } from "@/lib/b2";
import { assertDownload, jsonError, resolveProjectAccess } from "@/lib/transfer-helpers";

const encoder = new TextEncoder();

function dosDateTime(date = new Date()) {
  const year = Math.max(1980, date.getFullYear());
  const dosTime =
    ((date.getHours() & 0x1f) << 11) |
    ((date.getMinutes() & 0x3f) << 5) |
    ((Math.floor(date.getSeconds() / 2)) & 0x1f);
  const dosDate =
    (((year - 1980) & 0x7f) << 9) |
    (((date.getMonth() + 1) & 0x0f) << 5) |
    (date.getDate() & 0x1f);
  return { dosTime, dosDate };
}

const crcTable = new Uint32Array(256).map((_, n) => {
  let c = n;
  for (let k = 0; k < 8; k += 1) c = (c & 1) ? (0xedb88320 ^ (c >>> 1)) : (c >>> 1);
  return c >>> 0;
});

function crc32Update(crc, chunk) {
  let c = crc ^ 0xffffffff;
  for (let i = 0; i < chunk.length; i += 1) {
    c = crcTable[(c ^ chunk[i]) & 0xff] ^ (c >>> 8);
  }
  return c ^ 0xffffffff;
}

function u16(value) {
  const out = new Uint8Array(2);
  const view = new DataView(out.buffer);
  view.setUint16(0, value & 0xffff, true);
  return out;
}

function u32(value) {
  const out = new Uint8Array(4);
  const view = new DataView(out.buffer);
  view.setUint32(0, value >>> 0, true);
  return out;
}

function concatChunks(chunks) {
  const size = chunks.reduce((sum, item) => sum + item.length, 0);
  const out = new Uint8Array(size);
  let offset = 0;
  for (const item of chunks) {
    out.set(item, offset);
    offset += item.length;
  }
  return out;
}

function localHeader(nameBytes, dateInfo) {
  return concatChunks([
    u32(0x04034b50),
    u16(20),
    u16(0x0008),
    u16(0),
    u16(dateInfo.dosTime),
    u16(dateInfo.dosDate),
    u32(0),
    u32(0),
    u32(0),
    u16(nameBytes.length),
    u16(0),
    nameBytes
  ]);
}

function dataDescriptor(crc, size) {
  return concatChunks([
    u32(0x08074b50),
    u32(crc >>> 0),
    u32(size >>> 0),
    u32(size >>> 0)
  ]);
}

function centralHeader(nameBytes, dateInfo, crc, size, offset) {
  return concatChunks([
    u32(0x02014b50),
    u16(20),
    u16(20),
    u16(0x0008),
    u16(0),
    u16(dateInfo.dosTime),
    u16(dateInfo.dosDate),
    u32(crc >>> 0),
    u32(size >>> 0),
    u32(size >>> 0),
    u16(nameBytes.length),
    u16(0),
    u16(0),
    u16(0),
    u16(0),
    u32(0),
    u32(offset >>> 0),
    nameBytes
  ]);
}

function endOfCentralDirectory(count, size, offset) {
  return concatChunks([
    u32(0x06054b50),
    u16(0),
    u16(0),
    u16(count),
    u16(count),
    u32(size >>> 0),
    u32(offset >>> 0),
    u16(0)
  ]);
}

function sanitizeZipName(input, fallback = "datoteka") {
  return String(input || fallback)
    .replace(/[\\:*?"<>|]/g, "-")
    .replace(/\//g, "-")
    .trim() || fallback;
}

async function* bodyToAsyncIterable(body) {
  if (!body) return;
  if (typeof body[Symbol.asyncIterator] === "function") {
    for await (const chunk of body) {
      yield chunk instanceof Uint8Array ? chunk : new Uint8Array(chunk);
    }
    return;
  }
  const reader = body.getReader();
  try {
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      yield value instanceof Uint8Array ? value : new Uint8Array(value);
    }
  } finally {
    reader.releaseLock();
  }
}

export async function POST(request) {
  const body = await request.json().catch(() => ({}));
  const { session, error } = await resolveProjectAccess(body.projectCode);
  if (error) return error;

  try {
    assertDownload(session.role);

    const files = Array.isArray(body.files) ? body.files : [];
    if (!files.length) {
      return jsonError("Nema datoteka za preuzimanje.", 400);
    }

    const items = files.map((file) => {
      ensureProjectKey(session.projectCode, file.key);
      return {
        key: file.key,
        name: sanitizeZipName(file.name)
      };
    });

    const archiveName = sanitizeZipName(body.archiveName || `${session.projectLabel || "projekt"}.zip`)
      .replace(/\.zip$/i, "") + ".zip";

    const now = dosDateTime(new Date());

    const stream = new ReadableStream({
      async start(controller) {
        const centralRecords = [];
        let offset = 0;

        try {
          for (const item of items) {
            const nameBytes = encoder.encode(item.name);
            const header = localHeader(nameBytes, now);
            controller.enqueue(header);
            const localOffset = offset;
            offset += header.length;

            const objectData = await getObjectDownloadStream(item.key);

            let crc = 0;
            let size = 0;

            for await (const chunk of bodyToAsyncIterable(objectData.body)) {
              crc = crc32Update(crc, chunk);
              size += chunk.length;
              controller.enqueue(chunk);
              offset += chunk.length;
            }

            const descriptor = dataDescriptor(crc >>> 0, size >>> 0);
            controller.enqueue(descriptor);
            offset += descriptor.length;

            centralRecords.push(
              centralHeader(nameBytes, now, crc >>> 0, size >>> 0, localOffset >>> 0)
            );
          }

          const centralOffset = offset;
          let centralSize = 0;

          for (const record of centralRecords) {
            controller.enqueue(record);
            offset += record.length;
            centralSize += record.length;
          }

          const eocd = endOfCentralDirectory(centralRecords.length, centralSize, centralOffset);
          controller.enqueue(eocd);
          controller.close();
        } catch (err) {
          controller.error(err);
        }
      }
    });

    return new Response(stream, {
      headers: {
        "Content-Type": "application/zip",
        "Content-Disposition": `attachment; filename="${archiveName}"`,
        "Cache-Control": "no-store"
      }
    });
  } catch (err) {
    return jsonError(err.message || "Ne mogu pripremiti ZIP.", 500);
  }
}
