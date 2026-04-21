"use client";

import { useEffect, useMemo, useState } from "react";

function formatBytes(bytes) {
  if (!bytes) return "0 B";
  const units = ["B", "KB", "MB", "GB", "TB"];
  let value = bytes;
  let unitIndex = 0;
  while (value >= 1024 && unitIndex < units.length - 1) {
    value /= 1024;
    unitIndex += 1;
  }
  return `${value.toFixed(value >= 100 || unitIndex === 0 ? 0 : 1)} ${units[unitIndex]}`;
}

async function api(path, options = {}) {
  const response = await fetch(path, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...(options.headers || {})
    }
  });

  const data = await response.json().catch(() => ({}));
  if (!response.ok) {
    throw new Error(data.error || "Dogodila se greška.");
  }
  return data;
}

function capabilityText(role) {
  if (role === "crew") return "Možeš uploadati ulazne materijale i preuzeti gotove fajlove.";
  if (role === "editor") return "Možeš preuzeti ulazne materijale i uploadati gotove fajlove.";
  return "Admin pristup: upload, download i brisanje svih datoteka.";
}

async function uploadOneFile(file, area, setStatus) {
  const plan = await api("/api/transfer/multipart/start", {
    method: "POST",
    body: JSON.stringify({
      area,
      fileName: file.name,
      fileSize: file.size,
      contentType: file.type || "application/octet-stream"
    })
  });

  const parts = [];
  for (let index = 0; index < plan.urls.length; index += 1) {
    const part = plan.urls[index];
    const start = index * plan.partSize;
    const end = Math.min(file.size, start + plan.partSize);
    const chunk = file.slice(start, end);

    const response = await fetch(part.url, {
      method: "PUT",
      body: chunk
    });

    if (!response.ok) {
      throw new Error(`Upload dijela ${part.partNumber} nije uspio.`);
    }

    const etag = response.headers.get("etag") || response.headers.get("ETag");
    if (!etag) {
      throw new Error("Nedostaje ETag za završetak multiparta.");
    }

    parts.push({ PartNumber: part.partNumber, ETag: etag });
    setStatus(Math.round(((index + 1) / plan.urls.length) * 100));
  }

  await api("/api/transfer/multipart/complete", {
    method: "POST",
    body: JSON.stringify({
      area,
      key: plan.key,
      uploadId: plan.uploadId,
      parts
    })
  });
}

function FileBlock({ title, area, files, canUpload, canDownload, canDelete, onRefresh }) {
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState({});
  const [error, setError] = useState("");

  const totalSize = useMemo(
    () => files.reduce((sum, file) => sum + (file.size || 0), 0),
    [files]
  );

  async function handleUpload(event) {
    const selected = Array.from(event.target.files || []);
    if (!selected.length) return;

    setUploading(true);
    setError("");
    const progressMap = {};

    try {
      for (const file of selected) {
        progressMap[file.name] = 0;
        setUploadProgress({ ...progressMap });

        await uploadOneFile(file, area, (value) => {
          progressMap[file.name] = value;
          setUploadProgress({ ...progressMap });
        });
      }

      await onRefresh();
      setUploadProgress({});
      event.target.value = "";
    } catch (err) {
      setError(err.message || "Upload nije uspio.");
    } finally {
      setUploading(false);
    }
  }

  async function handleDownload(file) {
    try {
      const data = await api("/api/transfer/download", {
        method: "POST",
        body: JSON.stringify({ area, key: file.key })
      });
      window.open(data.url, "_blank", "noopener,noreferrer");
    } catch (err) {
      setError(err.message || "Download nije uspio.");
    }
  }

  async function handleDelete(file) {
    const ok = window.confirm(`Obrisati ${file.name}?`);
    if (!ok) return;

    try {
      await api("/api/transfer/delete", {
        method: "POST",
        body: JSON.stringify({ area, key: file.key })
      });
      await onRefresh();
    } catch (err) {
      setError(err.message || "Brisanje nije uspjelo.");
    }
  }

  return (
    <div className="transfer-card">
      <div className="transfer-card-head">
        <div>
          <h3>{title}</h3>
          <p>{files.length} datoteka · {formatBytes(totalSize)}</p>
        </div>

        {canUpload ? (
          <label className={`transfer-upload ${uploading ? "is-busy" : ""}`}>
            <input
              type="file"
              multiple
              onChange={handleUpload}
              disabled={uploading}
            />
            {uploading ? "Upload u tijeku..." : "Dodaj datoteke"}
          </label>
        ) : null}
      </div>

      {Object.keys(uploadProgress).length ? (
        <div className="transfer-progress-list">
          {Object.entries(uploadProgress).map(([name, progress]) => (
            <div key={name} className="transfer-progress-item">
              <div className="transfer-progress-label">
                <span>{name}</span>
                <strong>{progress}%</strong>
              </div>
              <div className="transfer-progress-bar">
                <span style={{ width: `${progress}%` }} />
              </div>
            </div>
          ))}
        </div>
      ) : null}

      {error ? <p className="transfer-error">{error}</p> : null}

      {files.length ? (
        <div className="transfer-file-list">
          {files.map((file) => (
            <div key={file.key} className="transfer-file-item">
              <div>
                <strong>{file.name}</strong>
                <p>
                  {formatBytes(file.size)}
                  {file.lastModified ? ` · ${new Date(file.lastModified).toLocaleString("hr-HR")}` : ""}
                </p>
              </div>
              <div className="transfer-file-actions">
                {canDownload ? (
                  <button type="button" className="btn btn-secondary" onClick={() => handleDownload(file)}>
                    Preuzmi
                  </button>
                ) : null}
                {canDelete ? (
                  <button type="button" className="btn btn-ghost-danger" onClick={() => handleDelete(file)}>
                    Obriši
                  </button>
                ) : null}
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="transfer-empty">Još nema datoteka u ovoj sekciji.</div>
      )}
    </div>
  );
}

export default function TransferPortalClient() {
  const [projectCode, setProjectCode] = useState("");
  const [pin, setPin] = useState("");
  const [session, setSession] = useState(null);
  const [files, setFiles] = useState({ raw: [], final: [] });
  const [loading, setLoading] = useState(true);
  const [loginBusy, setLoginBusy] = useState(false);
  const [error, setError] = useState("");

  async function refreshFiles() {
    const data = await api("/api/transfer/list", { method: "GET" });
    setFiles(data);
  }

  async function refreshSession() {
    try {
      const currentSession = await api("/api/transfer/session", { method: "GET" });
      setSession(currentSession);
      await refreshFiles();
    } catch {
      setSession(null);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const presetProject = params.get("project") || "";
    if (presetProject) setProjectCode(presetProject);
    refreshSession();
  }, []);

  async function handleLogin(event) {
    event.preventDefault();
    setLoginBusy(true);
    setError("");

    try {
      const data = await api("/api/transfer/auth", {
        method: "POST",
        body: JSON.stringify({ projectCode, pin })
      });
      setSession(data);
      setPin("");
      await refreshFiles();
    } catch (err) {
      setError(err.message || "Prijava nije uspjela.");
    } finally {
      setLoginBusy(false);
    }
  }

  async function handleLogout() {
    await api("/api/transfer/logout", { method: "POST" });
    setSession(null);
    setFiles({ raw: [], final: [] });
  }

  if (loading) {
    return <div className="transfer-loading">Učitavanje portala...</div>;
  }

  if (!session) {
    return (
      <div className="transfer-shell">
        <div className="transfer-login-card">
          <p className="section-kicker">B2 WEDDING TRANSFER</p>
          <h1>Privremeni portal za razmjenu svadbenih materijala</h1>
          <p>
            Browser-only pristup. Nema instalacije, nema stalnih računa. Upišeš šifru svadbe i PIN, odradiš transfer i kasnije sve pobrišeš.
          </p>

          <form className="transfer-login-form" onSubmit={handleLogin}>
            <label>
              Šifra svadbe
              <input
                value={projectCode}
                onChange={(event) => setProjectCode(event.target.value)}
                placeholder="npr. iva-marko-2026"
                autoComplete="off"
              />
            </label>
            <label>
              PIN
              <input
                type="password"
                inputMode="numeric"
                value={pin}
                onChange={(event) => setPin(event.target.value)}
                placeholder="****"
              />
            </label>
            {error ? <p className="transfer-error">{error}</p> : null}
            <button type="submit" className="btn btn-primary" disabled={loginBusy}>
              {loginBusy ? "Provjera..." : "Uđi u portal"}
            </button>
          </form>

          <div className="transfer-note">
            <strong>Kako radi:</strong> snimatelj ulazi crew PIN-om i ubacuje raw. Montažer ulazi editor PIN-om, skida raw i vraća gotove materijale. Admin PIN vidi i briše sve.
          </div>
        </div>
      </div>
    );
  }

  const isCrew = session.role === "crew";
  const isEditor = session.role === "editor";
  const isAdmin = session.role === "admin";

  return (
    <div className="transfer-shell">
      <div className="transfer-topbar">
        <div>
          <p className="section-kicker">AKTIVNA SVADBA</p>
          <h1>{session.projectLabel}</h1>
          <p>{session.projectCode} · {capabilityText(session.role)}</p>
        </div>
        <button type="button" className="btn btn-secondary" onClick={handleLogout}>
          Odjava
        </button>
      </div>

      <div className="transfer-grid">
        <FileBlock
          title="Ulazni materijali"
          area="raw"
          files={files.raw}
          canUpload={isCrew || isAdmin}
          canDownload={isEditor || isAdmin}
          canDelete={isAdmin}
          onRefresh={refreshFiles}
        />

        <FileBlock
          title="Gotovi materijali"
          area="final"
          files={files.final}
          canUpload={isEditor || isAdmin}
          canDownload={isCrew || isAdmin}
          canDelete={isAdmin}
          onRefresh={refreshFiles}
        />
      </div>
    </div>
  );
}
