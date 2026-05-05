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

function uploadErrorText(error) {
  const message = String(error?.message || "Upload nije uspio.");
  if (message.includes("Failed to fetch")) {
    return "Upload nije uspio. Otvori DevTools > Network i pogledaj stvarnu grešku requesta.";
  }
  return message;
}

function capabilityText(role) {
  if (role === "admin") return "Možeš dodavati, preuzimati, brisati i uređivati foldere i datoteke.";
  if (role === "editor") return "Možeš pregledati ulazne i gotove materijale te uploadati montirani sadržaj.";
  if (role === "crew") return "Možeš pregledati ulazne i gotove materijale te dodavati materijale.";
  if (role === "user") return "Možeš ulaziti u foldere, preuzimati i dodavati datoteke.";
  return "Admin pristup za izradu i gašenje svadbi.";
}

async function uploadOneFile(file, projectCode, path, setStatus) {
  const plan = await api("/api/transfer/multipart/start", {
    method: "POST",
    body: JSON.stringify({
      projectCode,
      path,
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
      body: JSON.stringify({ projectCode, key: plan.key, uploadId: plan.uploadId, partNumber: index + 1 })
    });

    const response = await fetch(partAuth.url, {
      method: "PUT",
      headers: { "Content-Type": file.type || "application/octet-stream" },
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
    body: JSON.stringify({ projectCode, key: plan.key, uploadId: plan.uploadId })
  });
}

function triggerBrowserDownload(url, filename) {
  const link = document.createElement("a");
  link.href = url;
  if (filename) link.download = filename;
  link.style.display = "none";
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

function breadcrumbParts(path) {
  if (!path) return [];
  const parts = path.split("/").filter(Boolean);
  return parts.map((part, index) => ({
    name: part,
    path: parts.slice(0, index + 1).join("/")
  }));
}

function CopyButton({ value, label = "Kopiraj link" }) {
  const [done, setDone] = useState(false);
  const disabled = !value;

  async function copy() {
    if (!value) return;
    const fullUrl = String(value).startsWith("http") ? value : `${window.location.origin}${value}`;
    await navigator.clipboard.writeText(fullUrl);
    setDone(true);
    setTimeout(() => setDone(false), 1500);
  }

  return (
    <button type="button" className="btn btn-secondary" onClick={copy} disabled={disabled} title={disabled ? "Link nije dostupan." : ""}>
      {done ? "Kopirano" : label}
    </button>
  );
}

function LegacySection({ title, areaKey, files, projectCode, canUpload, canDownload, canDelete, onRefresh }) {
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState({});
  const [busy, setBusy] = useState(false);
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
        await uploadOneFile(file, projectCode, areaKey, (value) => {
          progressMap[file.name] = value;
          setUploadProgress({ ...progressMap });
        });
      }
      event.target.value = "";
      setUploadProgress({});
      await onRefresh();
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
        body: JSON.stringify({ projectCode, key: file.key })
      });
      triggerBrowserDownload(data.url, file.name);
    } catch (err) {
      setError(err.message || "Download nije uspio.");
    }
  }

  async function handleDownloadAll() {
    if (!files.length) return;
    setBusy(true);
    setError("");
    try {
      const downloads = await Promise.all(
        files.map((file) =>
          api("/api/transfer/download", {
            method: "POST",
            body: JSON.stringify({ projectCode, key: file.key })
          }).then((data) => ({ url: data.url, name: file.name }))
        )
      );
      downloads.forEach((item, index) => {
        setTimeout(() => triggerBrowserDownload(item.url, item.name), index * 250);
      });
    } catch (err) {
      setError(err.message || "Skidanje svih datoteka nije uspjelo.");
    } finally {
      setTimeout(() => setBusy(false), files.length * 250 + 500);
    }
  }

  async function handleDelete(file) {
    if (!window.confirm(`Obrisati ${file.name}?`)) return;
    try {
      await api("/api/transfer/delete", {
        method: "POST",
        body: JSON.stringify({ projectCode, key: file.key })
      });
      await onRefresh();
    } catch (err) {
      setError(err.message || "Brisanje nije uspjelo.");
    }
  }

  async function handleDeleteAll() {
    if (!files.length) return;
    if (!window.confirm(`Obrisati sve datoteke iz sekcije \"${title}\"?`)) return;
    setBusy(true);
    setError("");
    try {
      for (const file of files) {
        await api("/api/transfer/delete", {
          method: "POST",
          body: JSON.stringify({ projectCode, key: file.key })
        });
      }
      await onRefresh();
    } catch (err) {
      setError(err.message || "Brisanje svih datoteka nije uspjelo.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="transfer-card">
      <div className="transfer-card-head">
        <div>
          <h3>{title}</h3>
          <p>{files.length} datoteka · {formatBytes(totalSize)}</p>
        </div>
        <div style={{ display: "flex", gap: 12, flexWrap: "wrap", justifyContent: "flex-end" }}>
          {canDownload && files.length ? <button type="button" className="btn btn-secondary" onClick={handleDownloadAll} disabled={busy}>{busy ? "Skidanje..." : "Preuzmi sve"}</button> : null}
          {canDelete && files.length ? <button type="button" className="btn btn-ghost-danger" onClick={handleDeleteAll} disabled={busy}>{busy ? "Brisanje..." : "Obriši sve"}</button> : null}
          {canUpload ? (
            <label className={`transfer-upload ${uploading ? "is-busy" : ""}`}>
              <input type="file" multiple onChange={handleUpload} disabled={uploading} />
              {uploading ? "Upload u tijeku..." : "Dodaj datoteke"}
            </label>
          ) : null}
        </div>
      </div>

      {Object.keys(uploadProgress).length ? (
        <div className="transfer-progress-list">
          {Object.entries(uploadProgress).map(([name, progress]) => (
            <div key={name} className="transfer-progress-item">
              <div className="transfer-progress-label"><span>{name}</span><strong>{progress}%</strong></div>
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
      ) : <div className="transfer-empty">U ovoj sekciji još nema datoteka.</div>}
    </div>
  );
}

function LegacyProjectView({ session, onLogout, onBackToProjects }) {
  const [raw, setRaw] = useState([]);
  const [finalFiles, setFinalFiles] = useState([]);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);

  async function refresh() {
    setLoading(true);
    try {
      const data = await api(`/api/transfer/list?projectCode=${encodeURIComponent(session.projectCode)}`);
      setRaw(data.raw || []);
      setFinalFiles(data.final || []);
      setError("");
    } catch (err) {
      setError(err.message || "Ne mogu dohvatiti sadržaj.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { refresh(); }, [session.projectCode]);

  const canUploadRaw = session.role === "crew" || session.role === "admin";
  const canUploadFinal = session.role === "editor" || session.role === "admin";
  const canDownloadRaw = session.role === "editor" || session.role === "admin";
  const canDownloadFinal = session.role === "crew" || session.role === "admin";
  const canDelete = session.role === "admin";

  return (
    <div className="transfer-shell">
      <div className="transfer-topbar">
        <div>
          <p className="section-kicker">PROMAR TRANSFER</p>
          <h1>{session.projectLabel}</h1>
          <p>{capabilityText(session.role)}</p>
        </div>
        <div style={{ display: "flex", gap: 12, flexWrap: "wrap", justifyContent: "flex-end" }}>
          {session.role === "admin" && onBackToProjects ? <button type="button" className="btn btn-secondary" onClick={onBackToProjects}>Natrag na svadbe</button> : null}
          <button type="button" className="btn btn-secondary" onClick={onLogout}>Odjava</button>
        </div>
      </div>

      {error ? <p className="transfer-error">{error}</p> : null}
      {loading ? <div className="transfer-card"><div className="transfer-empty">Učitavanje...</div></div> : null}

      <div className="transfer-grid">
        <LegacySection title="Ulazni materijali" areaKey="raw" files={raw} projectCode={session.projectCode} canUpload={canUploadRaw} canDownload={canDownloadRaw} canDelete={canDelete} onRefresh={refresh} />
        <LegacySection title="Gotovi materijali" areaKey="final" files={finalFiles} projectCode={session.projectCode} canUpload={canUploadFinal} canDownload={canDownloadFinal} canDelete={canDelete} onRefresh={refresh} />
      </div>
    </div>
  );
}

function ProjectBrowser({ session, onBackToProjects, onLogout }) {
  const [path, setPath] = useState("");
  const [folders, setFolders] = useState([]);
  const [files, setFiles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState({});
  const [busy, setBusy] = useState(false);

  const isAdmin = session.role === "admin";

  async function refresh() {
    setLoading(true);
    try {
      const data = await api(`/api/transfer/list?projectCode=${encodeURIComponent(session.projectCode)}&path=${encodeURIComponent(path)}`);
      setFolders(data.folders || []);
      setFiles(data.files || []);
      setError("");
    } catch (err) {
      setError(err.message || "Ne mogu dohvatiti sadržaj.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { refresh(); }, [path, session.projectCode]);

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
        await uploadOneFile(file, session.projectCode, path, (value) => {
          progressMap[file.name] = value;
          setUploadProgress({ ...progressMap });
        });
      }
      setUploadProgress({});
      event.target.value = "";
      await refresh();
    } catch (err) {
      setError(uploadErrorText(err));
    } finally {
      setUploading(false);
    }
  }

  async function handleDownload(file) {
    try {
      const data = await api("/api/transfer/download", { method: "POST", body: JSON.stringify({ projectCode: session.projectCode, key: file.key }) });
      triggerBrowserDownload(data.url, file.name);
    } catch (err) {
      setError(err.message || "Download nije uspio.");
    }
  }

  async function handleDownloadAll() {
    if (!files.length) return;
    setBusy(true);
    setError("");
    try {
      const downloads = await Promise.all(files.map((file) => api("/api/transfer/download", { method: "POST", body: JSON.stringify({ projectCode: session.projectCode, key: file.key }) }).then((data) => ({ url: data.url, name: file.name }))));
      downloads.forEach((item, index) => setTimeout(() => triggerBrowserDownload(item.url, item.name), index * 250));
    } catch (err) {
      setError(err.message || "Skidanje svih datoteka nije uspjelo.");
    } finally {
      setTimeout(() => setBusy(false), files.length * 250 + 500);
    }
  }

  async function handleDeleteFile(file) {
    if (!window.confirm(`Obrisati ${file.name}?`)) return;
    try {
      await api("/api/transfer/delete", { method: "POST", body: JSON.stringify({ projectCode: session.projectCode, key: file.key }) });
      await refresh();
    } catch (err) {
      setError(err.message || "Brisanje nije uspjelo.");
    }
  }

  async function handleCreateFolder() {
    const name = window.prompt("Naziv novog foldera");
    if (!name) return;
    try {
      await api("/api/transfer/folder/create", { method: "POST", body: JSON.stringify({ projectCode: session.projectCode, path, name }) });
      await refresh();
    } catch (err) {
      setError(err.message || "Ne mogu napraviti folder.");
    }
  }

  async function handleRenameFolder(folder) {
    const name = window.prompt("Novi naziv foldera", folder.name);
    if (!name || name === folder.name) return;
    try {
      await api("/api/transfer/folder/rename", { method: "POST", body: JSON.stringify({ projectCode: session.projectCode, path: folder.path, name }) });
      await refresh();
    } catch (err) {
      setError(err.message || "Ne mogu preimenovati folder.");
    }
  }

  async function handleDeleteFolder(folder) {
    if (!window.confirm(`Obrisati folder ${folder.name} i sve unutar njega?`)) return;
    try {
      await api("/api/transfer/folder/delete", { method: "POST", body: JSON.stringify({ projectCode: session.projectCode, path: folder.path }) });
      await refresh();
    } catch (err) {
      setError(err.message || "Ne mogu obrisati folder.");
    }
  }

  const breadcrumbs = breadcrumbParts(path);
  const totalFileSize = useMemo(() => files.reduce((sum, file) => sum + (file.size || 0), 0), [files]);

  return (
    <div className="transfer-shell">
      <div className="transfer-topbar">
        <div>
          <p className="section-kicker">PROMAR TRANSFER</p>
          <h1>{session.projectLabel}</h1>
          <p>{capabilityText(session.role)}</p>
        </div>
        <div style={{ display: "flex", gap: 12, flexWrap: "wrap", justifyContent: "flex-end" }}>
          {session.role === "admin" && onBackToProjects ? <button type="button" className="btn btn-secondary" onClick={onBackToProjects}>Natrag na svadbe</button> : null}
          <button type="button" className="btn btn-secondary" onClick={onLogout}>Odjava</button>
        </div>
      </div>

      <div className="transfer-card" style={{ marginBottom: 24 }}>
        <div style={{ display: "flex", justifyContent: "space-between", gap: 16, flexWrap: "wrap", alignItems: "center" }}>
          <div>
            <h3>Folderi i datoteke</h3>
            <p>{files.length} datoteka u ovom folderu · {formatBytes(totalFileSize)}</p>
          </div>
          <div style={{ display: "flex", gap: 12, flexWrap: "wrap", justifyContent: "flex-end" }}>
            {files.length ? <button type="button" className="btn btn-secondary" onClick={handleDownloadAll} disabled={busy}>{busy ? "Skidanje..." : "Preuzmi sve"}</button> : null}
            {isAdmin ? <button type="button" className="btn btn-secondary" onClick={handleCreateFolder}>Napravi novi folder</button> : null}
            <label className={`transfer-upload ${uploading ? "is-busy" : ""}`}>
              <input type="file" multiple onChange={handleUpload} disabled={uploading} />
              {uploading ? "Upload u tijeku..." : "Dodaj datoteke"}
            </label>
          </div>
        </div>

        <div style={{ marginTop: 16, display: "flex", gap: 8, flexWrap: "wrap", alignItems: "center" }}>
          <button type="button" className="btn btn-secondary" onClick={() => setPath("")}>Root</button>
          {breadcrumbs.map((crumb) => (
            <button key={crumb.path} type="button" className="btn btn-secondary" onClick={() => setPath(crumb.path)}>{crumb.name}</button>
          ))}
        </div>
      </div>

      {Object.keys(uploadProgress).length ? (
        <div className="transfer-card" style={{ marginBottom: 24 }}>
          <div className="transfer-progress-list">
            {Object.entries(uploadProgress).map(([name, progress]) => (
              <div key={name} className="transfer-progress-item">
                <div className="transfer-progress-label"><span>{name}</span><strong>{progress}%</strong></div>
                <div className="transfer-progress-bar"><span style={{ width: `${progress}%` }} /></div>
              </div>
            ))}
          </div>
        </div>
      ) : null}

      {error ? <p className="transfer-error">{error}</p> : null}

      <div className="transfer-card" style={{ marginBottom: 24 }}>
        <h3>Folderi</h3>
        {loading ? <div className="transfer-empty">Učitavanje...</div> : folders.length ? (
          <div className="transfer-file-list">
            {folders.map((folder) => (
              <div key={folder.path} className="transfer-file-item">
                <div><strong>📁 {folder.name}</strong><p>{folder.path}</p></div>
                <div className="transfer-file-actions">
                  <button type="button" className="btn btn-secondary" onClick={() => setPath(folder.path)}>Otvori</button>
                  {isAdmin ? <button type="button" className="btn btn-secondary" onClick={() => handleRenameFolder(folder)}>Preimenuj</button> : null}
                  {isAdmin ? <button type="button" className="btn btn-ghost-danger" onClick={() => handleDeleteFolder(folder)}>Obriši</button> : null}
                </div>
              </div>
            ))}
          </div>
        ) : <div className="transfer-empty">U ovom folderu još nema podfoldera.</div>}
      </div>

      <div className="transfer-card">
        <h3>Datoteke</h3>
        {loading ? <div className="transfer-empty">Učitavanje...</div> : files.length ? (
          <div className="transfer-file-list">
            {files.map((file) => (
              <div key={file.key} className="transfer-file-item">
                <div><strong>{file.name}</strong><p>{formatBytes(file.size)}{file.lastModified ? ` · ${new Date(file.lastModified).toLocaleString("hr-HR")}` : ""}</p></div>
                <div className="transfer-file-actions">
                  <button type="button" className="btn btn-secondary" onClick={() => handleDownload(file)}>Preuzmi</button>
                  {isAdmin ? <button type="button" className="btn btn-ghost-danger" onClick={() => handleDeleteFile(file)}>Obriši</button> : null}
                </div>
              </div>
            ))}
          </div>
        ) : <div className="transfer-empty">U ovom folderu još nema datoteka.</div>}
      </div>
    </div>
  );
}

function AdminDashboard({ onLogout }) {
  const [projects, setProjects] = useState([]);
  const [label, setLabel] = useState("");
  const [expiresAt, setExpiresAt] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  const [openedProject, setOpenedProject] = useState(null);

  async function loadProjects() {
    const data = await api("/api/transfer/projects");
    setProjects(data.projects || []);
  }

  useEffect(() => { loadProjects().catch((err) => setError(err.message)); }, []);

  async function create(event) {
    event.preventDefault();
    setBusy(true);
    setError("");
    try {
      await api("/api/transfer/projects", {
        method: "POST",
        body: JSON.stringify({ label, expiresAt: expiresAt ? new Date(`${expiresAt}T23:59:59.999`).toISOString() : null })
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
    if (!window.confirm(`Obrisati svadbu \"${labelText}\" i sve datoteke?`)) return;
    try {
      await api("/api/transfer/projects/delete", { method: "POST", body: JSON.stringify({ projectCode }) });
      if (openedProject?.code === projectCode) setOpenedProject(null);
      await loadProjects();
    } catch (err) {
      setError(err.message || "Ne mogu obrisati svadbu.");
    }
  }

  if (openedProject) {
    return (
      <ProjectBrowser
        session={{ role: "admin", projectCode: openedProject.code, projectLabel: openedProject.label, mode: "modern" }}
        onBackToProjects={() => setOpenedProject(null)}
        onLogout={onLogout}
      />
    );
  }

  return (
    <div className="transfer-shell">
      <div className="transfer-topbar">
        <div>
          <p className="section-kicker">PROMAR TRANSFER ADMIN</p>
          <h1>Privremene svadbe i pristupi</h1>
          <p>Za nove svadbe koristiš jedan PIN za suradnike. Stare svadbe i dalje ostaju dostupne preko starih PIN-ova dok se posao ne dovrši.</p>
        </div>
        <button type="button" className="btn btn-secondary" onClick={onLogout}>Odjava</button>
      </div>

      <div className="transfer-card transfer-create-card">
        <h3>Nova svadba</h3>
        <form className="transfer-admin-form" onSubmit={create}>
          <label>
            Naziv svadbe
            <input value={label} onChange={(e) => setLabel(e.target.value)} placeholder="npr. Iva i Marko" />
          </label>
          <label>
            Istek pristupa
            <input type="date" value={expiresAt} onChange={(e) => setExpiresAt(e.target.value)} />
          </label>
          <button type="submit" className="btn btn-primary" disabled={busy}>{busy ? "Spremam..." : "Kreiraj svadbu"}</button>
        </form>
        {error ? <p className="transfer-error">{error}</p> : null}
      </div>

      <div className="transfer-admin-list">
        {projects.map((project) => (
          <div key={project.code} className="transfer-card">
            <div className="transfer-project-head">
              <div>
                <h3>{project.label}</h3>
                <p>{project.expiresAt ? `Istječe: ${new Date(project.expiresAt).toLocaleDateString("hr-HR")}` : "Bez roka isteka"}</p>
              </div>
              <div style={{ display: "flex", gap: 12, flexWrap: "wrap", justifyContent: "flex-end" }}>
                <button type="button" className="btn btn-secondary" onClick={() => setOpenedProject(project)}>Otvori kao admin</button>
                <button type="button" className="btn btn-ghost-danger" onClick={() => remove(project.code, project.label)}>Obriši svadbu</button>
              </div>
            </div>

            <div className="transfer-role-grid">
              {project.mode === "legacy" ? (
                <>
                  <div className="transfer-role-card">
                    <strong>Snimatelj</strong>
                    <p>PIN: {project.crewPin || "-"}</p>
                    <CopyButton value={project.links?.crew} label="Kopiraj crew link" />
                  </div>
                  <div className="transfer-role-card">
                    <strong>Montažer</strong>
                    <p>PIN: {project.editorPin || "-"}</p>
                    <CopyButton value={project.links?.editor} label="Kopiraj editor link" />
                  </div>
                  <div className="transfer-role-card">
                    <strong>Admin za staru svadbu</strong>
                    <p>PIN: {project.adminPin || "-"}</p>
                    <CopyButton value={project.links?.admin} label="Kopiraj admin link" />
                  </div>
                </>
              ) : (
                <div className="transfer-role-card">
                  <strong>Pristup za suradnike</strong>
                  <p>PIN: {project.accessPin}</p>
                  <CopyButton value={project.links?.access} label="Kopiraj link za pristup" />
                </div>
              )}
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
  const [loading, setLoading] = useState(true);
  const [pin, setPin] = useState("");
  const [inviteToken, setInviteToken] = useState("");
  const [mode, setMode] = useState("admin");
  const [loginBusy, setLoginBusy] = useState(false);
  const [error, setError] = useState("");

  async function refreshSession({ tokenPresent }) {
    try {
      const currentSession = await api("/api/transfer/session", { method: "GET" });
      if (!tokenPresent && currentSession.role !== "superadmin") {
        await api("/api/transfer/logout", { method: "POST" });
        setSession(null);
        return;
      }
      setSession(currentSession);
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
    refreshSession({ tokenPresent: Boolean(token) });
  }, []);

  async function handleLogin(event) {
    event.preventDefault();
    setLoginBusy(true);
    setError("");
    try {
      const data = await api("/api/transfer/auth", {
        method: "POST",
        body: JSON.stringify(mode === "admin" ? { mode: "admin", adminPin: pin } : { inviteToken, pin })
      });
      setSession(data);
      setPin("");
    } catch (err) {
      setError(err.message || "Prijava nije uspjela.");
    } finally {
      setLoginBusy(false);
    }
  }

  async function handleLogout() {
    await api("/api/transfer/logout", { method: "POST" });
    setSession(null);
    setPin("");
    setInviteToken("");
    const cleanUrl = `${window.location.origin}${window.location.pathname}`;
    window.history.replaceState({}, "", cleanUrl);
    setMode("admin");
  }

  if (loading) return <div className="transfer-loading">Učitavanje portala...</div>;

  if (!session) {
    return (
      <div className="transfer-shell">
        <div className="transfer-login-card">
          <p className="section-kicker">PROMAR TRANSFER</p>
          <h1>{mode === "admin" ? "Admin ulaz" : "Pristup datotekama"}</h1>
          <p>{mode === "admin" ? "Ovdje kao admin kreiraš svadbe i upravljaš folderima i sadržajem." : "Otvoren je pristup za ovu svadbu. Upiši PIN koji si dobio."}</p>
          <form className="transfer-login-form" onSubmit={handleLogin}>
            <label>
              PIN
              <input type="password" inputMode="numeric" value={pin} onChange={(e) => setPin(e.target.value)} placeholder="****" />
            </label>
            {error ? <p className="transfer-error">{error}</p> : null}
            <button type="submit" className="btn btn-primary" disabled={loginBusy}>{loginBusy ? "Provjera..." : "Uđi u portal"}</button>
          </form>
        </div>
      </div>
    );
  }

  if (session.role === "superadmin") {
    return <AdminDashboard onLogout={handleLogout} />;
  }

  if (session.role === "crew" || session.role === "editor") {
    return <LegacyProjectView session={session} onLogout={handleLogout} />;
  }

  return <ProjectBrowser session={{ ...session, mode: "modern" }} onLogout={handleLogout} />;
}
