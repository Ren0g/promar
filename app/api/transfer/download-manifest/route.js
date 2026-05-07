export const runtime = "nodejs";

import { createDownloadUrl, listFilesRecursively } from "@/lib/b2";
import { assertDownload, jsonError, resolveProjectAccess } from "@/lib/transfer-helpers";

function safeSegment(input, fallback = "download") {
  return String(input || fallback)
    .trim()
    .replace(/[\\/:*?"<>|]/g, "-")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "") || fallback;
}

function buildScript({ destinationName, manifestBase64 }) {
  return `param([string]$Destination = "")

$ErrorActionPreference = "Stop"
[Console]::OutputEncoding = [System.Text.UTF8Encoding]::UTF8

$manifestBase64 = "${manifestBase64}"
$json = [System.Text.Encoding]::UTF8.GetString([System.Convert]::FromBase64String($manifestBase64))
$items = $json | ConvertFrom-Json

if (-not $Destination) {
  $Destination = Join-Path (Get-Location) "${destinationName}"
}

New-Item -ItemType Directory -Force -Path $Destination | Out-Null

$total = @($items).Count
$index = 0

foreach ($item in $items) {
  $index++
  $targetPath = Join-Path $Destination $item.path
  $targetDir = Split-Path -Parent $targetPath

  if ($targetDir) {
    New-Item -ItemType Directory -Force -Path $targetDir | Out-Null
  }

  if (Test-Path $targetPath) {
    try {
      $existingSize = (Get-Item $targetPath).Length
      if ($item.size -and $existingSize -eq [int64]$item.size) {
        Write-Host "[$index/$total] Preskačem: $($item.path)"
        continue
      }
    } catch {}
  }

  Write-Host "[$index/$total] Skidam: $($item.path)"
  Invoke-WebRequest -Uri $item.url -OutFile $targetPath -UseBasicParsing
}

Write-Host "Gotovo. Datoteke su spremljene u: $Destination"
`;
}

export async function POST(request) {
  const body = await request.json().catch(() => ({}));
  const { session, error } = await resolveProjectAccess(body.projectCode);
  if (error) return error;

  try {
    assertDownload(session.role);

    const folderPath = String(body.path || "").trim();
    const files = await listFilesRecursively(session.projectCode, folderPath);

    if (!files.length) {
      return jsonError("U ovom folderu nema datoteka za preuzimanje.", 400);
    }

    const manifest = await Promise.all(
      files.map(async (file) => ({
        path: file.path,
        size: body.includeSizes === false ? null : null,
        url: await createDownloadUrl(file.key, 60 * 60 * 24 * 3)
      }))
    );

    const destinationName = safeSegment(`${session.projectLabel}${folderPath ? `-${folderPath}` : ""}`);
    const manifestBase64 = Buffer.from(JSON.stringify(manifest), "utf8").toString("base64");
    const script = buildScript({ destinationName, manifestBase64 });
    const fileName = `${destinationName || "promar-transfer"}-download.ps1`;

    return new Response(script, {
      status: 200,
      headers: {
        "Content-Type": "text/plain; charset=utf-8",
        "Content-Disposition": `attachment; filename="${fileName}"`,
        "Cache-Control": "no-store"
      }
    });
  } catch (err) {
    return jsonError(err.message || "Ne mogu pripremiti downloader.", 500);
  }
}
