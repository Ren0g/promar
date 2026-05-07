export const runtime = "nodejs";

import { createDownloadUrl, ensureProjectKey, getFolderPrefix, listAllKeys, getFileSize } from "@/lib/b2";
import { assertDownload, jsonError, resolveProjectAccess } from "@/lib/transfer-helpers";

function stripTimestamp(name) {
  return String(name || "download").replace(/^\d+-/, "");
}

function esc(value) {
  return String(value || "")
    .replace(/'/g, "''")
    .replace(/\r?\n/g, " ");
}

export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const projectCode = searchParams.get("projectCode") || "";
  const folderPath = searchParams.get("path") || "";
  const { session, error } = await resolveProjectAccess(projectCode);
  if (error) return error;

  try {
    assertDownload(session.role);

    const prefix = getFolderPrefix(session.projectCode, folderPath);
    const keys = await listAllKeys(prefix);

    const fileKeys = keys.filter(
      (key) => key && !key.endsWith("/") && !key.endsWith(".promar-folder")
    );

    if (!fileKeys.length) {
      return jsonError("U ovom folderu nema datoteka za preuzimanje.", 400);
    }

    const items = [];
    for (const key of fileKeys) {
      ensureProjectKey(session.projectCode, key);
      const url = await createDownloadUrl(key, 60 * 60 * 24);
      const size = await getFileSize(key);
      const relative = key.slice(prefix.length);
      const parts = relative.split("/");
      const fileName = stripTimestamp(parts.pop() || "download");
      const savePath = [...parts, fileName].filter(Boolean).join("\\");
      items.push({ savePath, url, size });
    }

    const lines = [
      "$ErrorActionPreference = 'Stop'",
      "$ProgressPreference = 'SilentlyContinue'",
      "",
      "$baseDir = Join-Path (Get-Location) 'Promar Download'",
      "New-Item -ItemType Directory -Force -Path $baseDir | Out-Null",
      "",
      "$files = @("
    ];

    for (const item of items) {
      lines.push(
        `  [PSCustomObject]@{ Path='${esc(item.savePath)}'; Url='${esc(item.url)}'; Size=${Number(item.size || 0)} }`
      );
    }

    lines.push(
      ")",
      "",
      "$totalBytes = ($files | Measure-Object -Property Size -Sum).Sum",
      "$downloadedBytes = 0",
      "$startTime = Get-Date",
      "",
      "foreach ($file in $files) {",
      "  $destination = Join-Path $baseDir $file.Path",
      "  $folder = Split-Path -Parent $destination",
      "  if ($folder) { New-Item -ItemType Directory -Force -Path $folder | Out-Null }",
      "",
      "  if (Test-Path $destination) {",
      "    $existingSize = (Get-Item $destination).Length",
      "    if ($existingSize -eq $file.Size -and $file.Size -gt 0) {",
      "      $downloadedBytes += $file.Size",
      "      Write-Host ('Preskacem postojeći file: ' + $file.Path)",
      "      continue",
      "    }",
      "  }",
      "",
      "  Write-Host ('Skidam: ' + $file.Path)",
      "  Invoke-WebRequest -Uri $file.Url -OutFile $destination",
      "",
      "  if (Test-Path $destination) {",
      "    $actualSize = (Get-Item $destination).Length",
      "    $downloadedBytes += $actualSize",
      "  }",
      "",
      "  if ($totalBytes -gt 0) {",
      "    $percent = [math]::Round(($downloadedBytes / $totalBytes) * 100, 2)",
      "    $elapsed = ((Get-Date) - $startTime).TotalSeconds",
      "    if ($elapsed -gt 0) {",
      "      $speed = $downloadedBytes / $elapsed",
      "      $speedMb = [math]::Round($speed / 1MB, 2)",
      "      Write-Host ('Napredak: ' + $percent + '% | Brzina: ' + $speedMb + ' MB/s')",
      "    } else {",
      "      Write-Host ('Napredak: ' + $percent + '%')",
      "    }",
      "  }",
      "}",
      "",
      "$elapsed = ((Get-Date) - $startTime).TotalSeconds",
      "$avgSpeed = 0",
      "if ($elapsed -gt 0) {",
      "  $avgSpeed = [math]::Round(($downloadedBytes / $elapsed) / 1MB, 2)",
      "}",
      "",
      "Write-Host ''",
      "Write-Host 'Preuzimanje je završeno.'",
      "Write-Host ('Ukupno skinuto: ' + [math]::Round($downloadedBytes / 1GB, 2) + ' GB')",
      "Write-Host ('Prosječna brzina: ' + $avgSpeed + ' MB/s')",
      "Write-Host ('Lokacija: ' + $baseDir)"
    );

    return new Response(lines.join("\r\n"), {
      headers: {
        "Content-Type": "application/octet-stream; charset=utf-8",
        "Content-Disposition": 'attachment; filename="promar-download.ps1"',
        "Cache-Control": "no-store"
      }
    });
  } catch (err) {
    return jsonError(err.message || "Ne mogu pripremiti PowerShell downloader.", 500);
  }
}
