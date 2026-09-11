"use client";

import { useEffect, useRef, useState } from "react";

const RETRY_DELAYS_MS = [0, 1000, 2000, 4000, 8000, 15000];

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function isAbortError(error) {
  return error?.name === "AbortError";
}

async function getDestinationFile(rootHandle, savePath) {
  const parts = String(savePath || "download")
    .split("/")
    .map((part) => part.trim())
    .filter(Boolean);

  const fileName = parts.pop() || "download";
  let directory = rootHandle;

  for (const part of parts) {
    directory = await directory.getDirectoryHandle(part, { create: true });
  }

  return directory.getFileHandle(fileName, { create: true });
}

async function isAlreadyComplete(fileHandle, expectedSize) {
  if (!expectedSize) return false;
  try {
    const localFile = await fileHandle.getFile();
    return localFile.size === expectedSize;
  } catch {
    return false;
  }
}

async function fetchSignedUrl(projectCode, key) {
  const response = await fetch("/api/transfer/download", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ projectCode, key })
  });

  const data = await response.json().catch(() => ({}));
  if (!response.ok || !data.url) {
    throw new Error(data.error || "Ne mogu pripremiti poveznicu za preuzimanje.");
  }
  return data.url;
}

async function downloadOneFile({ projectCode, item, directoryHandle, onBytes }) {
  const fileHandle = await getDestinationFile(directoryHandle, item.savePath);
  const expectedSize = Number(item.size || 0);

  if (await isAlreadyComplete(fileHandle, expectedSize)) {
    onBytes(expectedSize);
    return { skipped: true };
  }

  let lastError = null;

  for (let attempt = 0; attempt < RETRY_DELAYS_MS.length; attempt += 1) {
    if (RETRY_DELAYS_MS[attempt]) await sleep(RETRY_DELAYS_MS[attempt]);

    let writable = null;
    let written = 0;

    try {
      const url = await fetchSignedUrl(projectCode, item.key);
      const response = await fetch(url, { method: "GET", cache: "no-store" });
      if (!response.ok) {
        throw new Error(`Server je vratio grešku ${response.status}.`);
      }
      if (!response.body) {
        throw new Error("Preglednik nije otvorio tok za preuzimanje datoteke.");
      }

      writable = await fileHandle.createWritable();
      const reader = response.body.getReader();

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        await writable.write(value);
        written += value.byteLength;
        onBytes(value.byteLength);
      }

      await writable.close();
      writable = null;

      const completedFile = await fileHandle.getFile();
      if (expectedSize > 0 && completedFile.size !== expectedSize) {
        throw new Error(
          `Datoteka nije preuzeta u cijelosti (${completedFile.size} od ${expectedSize} B).`
        );
      }

      return { skipped: false };
    } catch (error) {
      lastError = error;
      if (writable) {
        try {
          await writable.abort();
        } catch {}
      }

      if (written > 0) onBytes(-written);
    }
  }

  throw lastError || new Error("Preuzimanje nije uspjelo nakon više pokušaja.");
}

export default function TransferDownloadAllButton({ projectCode, path, disabled }) {
  const [running, setRunning] = useState(false);
  const [status, setStatus] = useState("");
  const directoryHandleRef = useRef(null);

  useEffect(() => {
    if (!running) return undefined;

    const warn = (event) => {
      event.preventDefault();
      event.returnValue = "";
    };

    window.addEventListener("beforeunload", warn);
    return () => window.removeEventListener("beforeunload", warn);
  }, [running]);

  async function loadManifest() {
    const response = await fetch(
      `/api/transfer/download-manifest?projectCode=${encodeURIComponent(projectCode)}&path=${encodeURIComponent(path || "")}`,
      { method: "GET", cache: "no-store" }
    );
    const data = await response.json().catch(() => ({}));
    if (!response.ok) {
      throw new Error(data.error || "Ne mogu pripremiti datoteke za preuzimanje.");
    }
    return data.items || [];
  }

  async function runBatch(items, directoryHandle) {
    const failures = [];
    let completed = 0;
    let downloadedBytes = 0;

    for (const item of items) {
      setStatus(`Preuzimanje ${completed + 1}/${items.length}: ${item.savePath}`);
      try {
        await downloadOneFile({
          projectCode,
          item,
          directoryHandle,
          onBytes: (delta) => {
            downloadedBytes = Math.max(0, downloadedBytes + delta);
          }
        });
      } catch (error) {
        failures.push({ item, error });
      }
      completed += 1;
      setStatus(`Preuzeto ${completed}/${items.length}`);
    }

    return failures;
  }

  async function handleDownloadAll() {
    if (running || disabled) return;

    if (typeof window.showDirectoryPicker !== "function") {
      window.alert(
        "Za preuzimanje svih datoteka odjednom otvorite ovu stranicu u pregledniku Google Chrome ili Microsoft Edge na računalu."
      );
      return;
    }

    setRunning(true);
    setStatus("Priprema datoteka...");

    try {
      const directoryHandle = await window.showDirectoryPicker({ mode: "readwrite" });
      directoryHandleRef.current = directoryHandle;

      const items = await loadManifest();
      if (!items.length) {
        window.alert("U ovom folderu nema datoteka za preuzimanje.");
        return;
      }

      let pending = items;

      while (pending.length) {
        const failures = await runBatch(pending, directoryHandle);
        if (!failures.length) {
          window.alert("Preuzimanje je završeno. Sve datoteke spremljene su na računalo.");
          pending = [];
          break;
        }

        const retry = window.confirm(
          `${failures.length} ${failures.length === 1 ? "datoteka nije preuzeta" : "datoteka nisu preuzete"}. Želite li odmah pokušati ponovno samo s tim datotekama?`
        );

        if (!retry) {
          window.alert(
            `Preuzimanje je završeno, ali ${failures.length} ${failures.length === 1 ? "datoteka nije preuzeta" : "datoteka nisu preuzete"}. Možete ponovno kliknuti „Preuzmi sve datoteke”; već potpuno preuzete datoteke bit će preskočene.`
          );
          break;
        }

        pending = failures.map(({ item }) => item);
      }
    } catch (error) {
      if (!isAbortError(error)) {
        window.alert(error?.message || "Preuzimanje nije uspjelo.");
      }
    } finally {
      setRunning(false);
      setStatus("");
    }
  }

  return (
    <button
      type="button"
      className="btn btn-secondary"
      onClick={handleDownloadAll}
      disabled={disabled || running}
      title={running ? status : "Preuzmi sve datoteke iz ovog foldera i podfoldera"}
    >
      {running ? status || "Preuzimanje..." : "Preuzmi sve datoteke"}
    </button>
  );
}
