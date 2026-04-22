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
  if (!response.ok) throw new Error(data.error || "Dogodila se greška.");
  return data;
}

function capabilityText(role) {
  if (role === "crew") return "Uploadaš ulazne materijale.";
  if (role === "editor") return "Preuzimaš ulazne materijale i vraćaš gotove.";
  if (role === "admin") return "Vidiš i upravljaš svim datotekama za ovu svadbu.";
  return "Admin pristup za izradu i gašenje svadbi.";
}

function uploadErrorText(error) {
  const message = String(error?.message || "Upload nije uspio.");
  if (message.includes("Failed to fetch")) {
    return "Upload nije uspio. Otvori DevTools > Network i pogledaj stvarnu grešku requesta.";
  }
  return message;
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

  const partCount = Math.max(1, Math.ceil(file.size / plan.partSize));

  for (let index = 0; index < partCount; index += 1) {
    const start = index * plan.partSize;
    const end = Math.min(file.size, start + plan.partSize);
    const chunk = file.slice(start, end);

    const partAuth = await api("/api/transfer/multipart/part-url", {
      method: "POST",
      body: JSON.stringify({ area, key: plan.key, uploadId: plan.uploadId, partNumber: index + 1 })
    });

    const response = await fetch(partAuth.url, {
      method: "PUT",
      headers: {
        "Content-Type": file.type || "application/octet-stream"
      },
      body: chunk
    });

    if (!response.ok) {
      const details = await response.text().catch(() => "");
      throw new Error(details || `Upload dijela ${index + 1} nije uspio.`);
    }

    setStatus(Math.round(((index + 1) / partCount) * 100));
  }

  await api("/api/transfer/multipart/complete", {
    method: "POST",
    body: JSON.stringify({ area, key: plan.key, uploadId: plan.uploadId })
  });
}

function FileBlock({ title, area, files, canUpload, canDownload, canDelete, onRefresh }) {
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState({});
  const [error, setError] = useState("");

  const totalSize = useMemo(() => files.reduce((sum, file) => sum + (file.size || 0), 0), [files]);

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
      setError(uploadErrorText(err));
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
    if (!window.confirm(`Obrisati ${file.name}?`)) return;
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
            <input type="file" multiple onChange={handleUpload} disabled={uploading} />
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
              <div className="transfer-progress-bar"><span style={{ width: `${progress}%` }} /></div>
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
                <p>{formatBytes(file.size)}{file.lastModified ? ` · ${new Date(file.lastModified).toLocaleString("hr-HR")}` : ""}</p>
              </div>
              <div className="transfer-file-actions">
                {canDownload ? <button type="button" className="btn btn-secondary" onClick={() => handleDownload(file)}>Preuzmi</button> : null}
                {canDelete ? <button type="button" className="btn btn-ghost-danger" onClick={() => handleDelete(file)}>Obriši</button> : null}
              </div>
            </div>
          ))}
        </div>
      ) : <div className="transfer-empty">Još nema datoteka u ovoj sekciji.</div>}
    </div>
  );
}

function CopyButton({ value, label = "Kopiraj link" }) {
  const [done, setDone] = useState(false);

  async function copy() {
    await navigator.clipboard.writeText(`${window.location.origin}${value}`);
    setDone(true);
    setTimeout(() => setDone(false), 1500);
  }

  return (
    <button type="button" className="btn btn-secondary" onClick={copy}>
      {done ? "Kopirano" : label}
    </button>
  );
}

function AdminDashboard({ onLogout }) {
  const [projects, setProjects] = useState([]);
  const [label, setLabel] = useState("");
  const [expiresAt, setExpiresAt] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  async function loadProjects() {
    const data = await api("/api/transfer/projects");
    setProjects(data.projects || []);
  }

  useEffect(() => {
    loadProjects().catch((err) => setError(err.message));
  }, []);

  async function create(event) {
    event.preventDefault();
    setBusy(true);
    setError("");

    try {
      await api("/api/transfer/projects", {
        method: "POST",
        body: JSON.stringify({
          label,
          expiresAt: expiresAt ? new Date(`${expiresAt}T23:59:59.999`).toISOString() : null
        })
      });
      setLabel("");
      setExpiresAt("");
      await loadProjects();
    } catch (err) {
      setError(err.message || "Ne mogu napraviti svadbu.");
    } finally {
      setBusy(false);
    }
  }

  async function remove(projectCode, labelText) {
    if (!window.confirm(`Obrisati svadbu "${labelText}" i sve datoteke?`)) return;

    try {
      await api("/api/transfer/projects/delete", {
        method: "POST",
        body: JSON.stringify({ projectCode })
      });
      await loadProjects();
    } catch (err) {
      setError(err.message || "Ne mogu obrisati svadbu.");
    }
  }

  return (
    <div className="transfer-shell">
      <div className="transfer-topbar">
        <div>
          <p className="section-kicker">PROMAR TRANSFER ADMIN</p>
          <h1>Privremene svadbe i pristupi</h1>
          <p>Ovdje kreiraš svadbu, dobiješ linkove za snimatelja i montažera, a na kraju sve obrišeš.</p>
        </div>
        <button type="button" className="btn btn-secondary" onClick={onLogout}>Odjava</button>
      </div>

      <div className="transfer-card transfer-create-card">
        <h3>Nova svadba</h3>
        <form className="transfer-admin-form" onSubmit={create}>
          <label>
            Naziv svadbe
            <input
              value={label}
              onChange={(e) => setLabel(e.target.value)}
              placeholder="npr. Iva i Marko"
            />
          </label>
          <label>
            Istek pristupa
            <input
              type="date"
              value={expiresAt}
              onChange={(e) => setExpiresAt(e.target.value)}
            />
          </label>
          <button type="submit" className="btn btn-primary" disabled={busy}>
            {busy ? "Spremam..." : "Kreiraj svadbu"}
          </button>
        </form>
        {error ? <p className="transfer-error">{error}</p> : null}
      </div>

      <div className="transfer-admin-list">
        {projects.map((project) => (
          <div key={project.code} className="transfer-card">
            <div className="transfer-project-head">
              <div>
                <h3>{project.label}</h3>
                <p>
                  {project.expiresAt
                    ? `Istječe: ${new Date(project.expiresAt).toLocaleDateString("hr-HR")}`
                    : "Bez roka isteka"}
                </p>
              </div>
              <button
                type="button"
                className="btn btn-ghost-danger"
                onClick={() => remove(project.code, project.label)}
              >
                Obriši svadbu
              </button>
            </div>

            <div className="transfer-role-grid">
              <div className="transfer-role-card">
                <strong>Snimatelj</strong>
                <p>PIN: {project.crewPin}</p>
                <CopyButton value={project.links.crew} label="Kopiraj crew link" />
              </div>
              <div className="transfer-role-card">
                <strong>Montažer</strong>
                <p>PIN: {project.editorPin}</p>
                <CopyButton value={project.links.editor} label="Kopiraj editor link" />
              </div>
              <div className="transfer-role-card">
                <strong>Admin za tu svadbu</strong>
                <p>PIN: {project.adminPin}</p>
                <CopyButton value={project.links.admin} label="Kopiraj admin link" />
              </div>
            </div>
          </div>
        ))}
        {!projects.length ? <div className="transfer-empty">Još nema kreiranih svadbi.</div> : null}
      </div>
    </div>
  );
}

export default function TransferPortalClient() {
  const [session, setSession] = useState(null);
  const [files, setFiles] = useState({ raw: [], final: [] });
  const [loading, setLoading] = useState(true);
  const [pin, setPin] = useState("");
  const [inviteToken, setInviteToken] = useState("");
  const [mode, setMode] = useState("admin");
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
      if (currentSession.role !== "superadmin") {
        await refreshFiles();
      }
    } catch {
      setSession(null);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const token = params.get("t") || "";
    if (token) {
      setInviteToken(token);
      setMode("invite");
    }
    refreshSession();
  }, []);

  async function handleLogin(event) {
    event.preventDefault();
    setLoginBusy(true);
    setError("");

    try {
      const data = await api("/api/transfer/auth", {
        method: "POST",
        body: JSON.stringify(
          mode === "admin"
            ? { mode: "admin", adminPin: pin }
            : { inviteToken, pin }
        )
      });
      setSession(data);
      setPin("");
      if (data.role !== "superadmin") await refreshFiles();
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

  if (loading) return <div className="transfer-loading">Učitavanje portala...</div>;

  if (!session) {
    return (
      <div className="transfer-shell">
        <div className="transfer-login-card">
          <p className="section-kicker">PROMAR TRANSFER</p>
          <h1>{mode === "admin" ? "Admin ulaz" : "Pristup datotekama"}</h1>
          <p>
            {mode === "admin"
              ? "Ovdje kao admin kreiraš novu svadbu, dobiješ link za snimatelja i link za montažera te kasnije sve obrišeš."
              : "Otvoren je direktni pristup za ovu svadbu. Upiši samo PIN koji si dobio."}
          </p>

          <form className="transfer-login-form" onSubmit={handleLogin}>
            <label>
              PIN
              <input
                type="password"
                inputMode="numeric"
                value={pin}
                onChange={(e) => setPin(e.target.value)}
                placeholder="****"
              />
            </label>
            {error ? <p className="transfer-error">{error}</p> : null}
            <button type="submit" className="btn btn-primary" disabled={loginBusy}>
              {loginBusy ? "Provjera..." : "Uđi u portal"}
            </button>
          </form>
        </div>
      </div>
    );
  }

  if (session.role === "superadmin") {
    return <AdminDashboard onLogout={handleLogout} />;
  }

  const isCrew = session.role === "crew";
  const isEditor = session.role === "editor";
  const isAdmin = session.role === "admin";

  return (
    <div className="transfer-shell">
      <div className="transfer-topbar">
        <div>
          <p className="section-kicker">PROMAR TRANSFER</p>
          <h1>{session.projectLabel}</h1>
          <p>{capabilityText(session.role)}</p>
        </div>
        <button type="button" className="btn btn-secondary" onClick={handleLogout}>Odjava</button>
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
