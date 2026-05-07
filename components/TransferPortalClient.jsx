"use client";

import { useEffect, useMemo, useRef, useState } from "react";

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
  if (role === "admin") {
    return "Administracija foldera, datoteka i pristupa za ovu svadbu.";
  }
  return "Pregled foldera, upload i preuzimanje datoteka za ovu svadbu.";
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
      body: JSON.stringify({
        projectCode,
        key: plan.key,
        uploadId: plan.uploadId,
        partNumber: index + 1
      })
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
    body: JSON.stringify({
      projectCode,
      key: plan.key,
      uploadId: plan.uploadId
    })
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

function triggerBlobDownload(blob, filename) {
  const objectUrl = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = objectUrl;
  link.download = filename || "preuzimanje.zip";
  link.style.display = "none";
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  setTimeout(() => URL.revokeObjectURL(objectUrl), 1500);
}

function breadcrumbParts(path) {
  if (!path) return [];
  const parts = path.split("/").filter(Boolean);
  return parts.map((part, index) => ({
    name: part,
    path: parts.slice(0, index + 1).join("/")
  }));
}

function ProjectLinkButton({ value, label = "Kopiraj link za pristup" }) {
  const [done, setDone] = useState(false);
  const disabled = !value;

  async function copy() {
    if (!value) return;

    const fullUrl = String(value).startsWith("http")
      ? value
      : `${window.location.origin}${value}`;

    try {
      if (navigator.clipboard && window.isSecureContext) {
        await navigator.clipboard.writeText(fullUrl);
      } else {
        const textarea = document.createElement("textarea");
        textarea.value = fullUrl;
        textarea.setAttribute("readonly", "");
        textarea.style.position = "fixed";
        textarea.style.opacity = "0";
        document.body.appendChild(textarea);
        textarea.focus();
        textarea.select();
        document.execCommand("copy");
        document.body.removeChild(textarea);
      }
      setDone(true);
      setTimeout(() => setDone(false), 1500);
    } catch {
      window.prompt("Kopirajte ovaj link:", fullUrl);
    }
  }

  return (
    <button
      type="button"
      className="btn btn-secondary transfer-project-link-btn"
      onClick={copy}
      disabled={disabled}
    >
      {done ? "Kopirano" : label}
    </button>
  );
}

function TransferHeader({ title, subtitle, actions }) {
  return (
    <div className="transfer-masthead">
      <div className="transfer-masthead-brand">
        <img src="/images/transfer-logo.png" alt="Promar" className="transfer-brand-logo" />
        <div>
          <p className="transfer-brand-overline">Promar - digitalna rješenja</p>
          <h1>{title}</h1>
          <p>{subtitle}</p>
        </div>
      </div>
      <div className="transfer-masthead-actions">{actions}</div>
    </div>
  );
}

function FolderUploadButton({ disabled, onFiles }) {
  const inputRef = useRef(null);
  return (
    <>
      <input
        ref={inputRef}
        type="file"
        multiple
        style={{ display: "none" }}
        onChange={(event) => onFiles(Array.from(event.target.files || []), event)}
        disabled={disabled}
      />
      <button
        type="button"
        className="btn btn-secondary"
        onClick={() => inputRef.current?.click()}
        disabled={disabled}
      >
        {disabled ? "Upload..." : "Dodaj datoteke"}
      </button>
    </>
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
  const breadcrumbs = breadcrumbParts(path);
  const totalFileSize = useMemo(
    () => files.reduce((sum, file) => sum + (file.size || 0), 0),
    [files]
  );

  async function refresh() {
    setLoading(true);
    try {
      const data = await api(
        `/api/transfer/list?projectCode=${encodeURIComponent(session.projectCode)}&path=${encodeURIComponent(path)}`
      );
      setFolders(data.folders || []);
      setFiles(data.files || []);
      setError("");
    } catch (err) {
      setError(err.message || "Ne mogu dohvatiti sadržaj.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    refresh();
  }, [path, session.projectCode]);

  async function handleUploadFiles(selectedFiles, targetPath) {
    if (!selectedFiles.length) return;

    setUploading(true);
    setError("");
    const progressMap = {};

    try {
      for (const file of selectedFiles) {
        progressMap[file.name] = 0;
        setUploadProgress({ ...progressMap });
        await uploadOneFile(file, session.projectCode, targetPath, (value) => {
          progressMap[file.name] = value;
          setUploadProgress({ ...progressMap });
        });
      }
      setUploadProgress({});
      await refresh();
    } catch (err) {
      setError(uploadErrorText(err));
    } finally {
      setUploading(false);
    }
  }

  async function handleFolderInputChange(selectedFiles, event, targetPath) {
    await handleUploadFiles(selectedFiles, targetPath);
    if (event?.target) event.target.value = "";
  }

  async function handleDownload(file) {
    try {
      const data = await api("/api/transfer/download", {
        method: "POST",
        body: JSON.stringify({ projectCode: session.projectCode, key: file.key })
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
      const response = await fetch("/api/transfer/download-zip", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          projectCode: session.projectCode,
          path,
          archiveName: `${session.projectLabel || "projekt"}${path ? ` - ${path.split("/").pop()}` : ""}.zip`,
          files: files.map((file) => ({
            key: file.key,
            name: file.name
          }))
        })
      });

      if (!response.ok) {
        const data = await response.json().catch(() => ({}));
        throw new Error(data.error || "ZIP preuzimanje nije uspjelo.");
      }

      const blob = await response.blob();
      triggerBlobDownload(
        blob,
        `${session.projectLabel || "projekt"}${path ? ` - ${path.split("/").pop()}` : ""}.zip`
      );
    } catch (err) {
      setError(err.message || "Skidanje svih datoteka nije uspjelo.");
    } finally {
      setBusy(false);
    }
  }

  async function handleDeleteFile(file) {
    if (!window.confirm(`Obrisati ${file.name}?`)) return;
    try {
      await api("/api/transfer/delete", {
        method: "POST",
        body: JSON.stringify({ projectCode: session.projectCode, key: file.key })
      });
      await refresh();
    } catch (err) {
      setError(err.message || "Brisanje nije uspjelo.");
    }
  }

  async function handleCreateFolder() {
    const name = window.prompt("Naziv novog foldera");
    if (!name) return;
    try {
      await api("/api/transfer/folder/create", {
        method: "POST",
        body: JSON.stringify({ projectCode: session.projectCode, path, name })
      });
      await refresh();
    } catch (err) {
      setError(err.message || "Ne mogu napraviti folder.");
    }
  }

  async function handleRenameFolder(folder) {
    const name = window.prompt("Novi naziv foldera", folder.name);
    if (!name || name === folder.name) return;
    try {
      await api("/api/transfer/folder/rename", {
        method: "POST",
        body: JSON.stringify({ projectCode: session.projectCode, path: folder.path, name })
      });
      await refresh();
    } catch (err) {
      setError(err.message || "Ne mogu preimenovati folder.");
    }
  }

  async function handleDeleteFolder(folder) {
    if (!window.confirm(`Obrisati folder ${folder.name} i sve unutar njega?`)) return;
    try {
      await api("/api/transfer/folder/delete", {
        method: "POST",
        body: JSON.stringify({ projectCode: session.projectCode, path: folder.path })
      });
      await refresh();
    } catch (err) {
      setError(err.message || "Ne mogu obrisati folder.");
    }
  }

  return (
    <div className="transfer-shell">
      <TransferHeader
        title={session.projectLabel}
        subtitle={capabilityText(session.role)}
        actions={
          <>
            {session.role === "admin" && onBackToProjects ? (
              <button type="button" className="btn btn-secondary" onClick={onBackToProjects}>
                Natrag na svadbe
              </button>
            ) : null}
            <button type="button" className="btn btn-secondary" onClick={onLogout}>
              Odjava
            </button>
          </>
        }
      />

      <div className="transfer-toolbar-card">
        <div className="transfer-toolbar-copy">
          <h2>Folderi i datoteke</h2>
          <p>
            {path ? `Trenutni folder: ${path}` : "Root pregled projekta"} · {files.length} datoteka · {formatBytes(totalFileSize)}
          </p>
        </div>
        <div className="transfer-toolbar-actions">
          {files.length ? (
            <button type="button" className="btn btn-secondary" onClick={handleDownloadAll} disabled={busy}>
              {busy ? "Skidanje..." : "Preuzmi sve"}
            </button>
          ) : null}
          {isAdmin ? (
            <button type="button" className="btn btn-secondary" onClick={handleCreateFolder}>
              Napravi novi folder
            </button>
          ) : null}
          {path ? (
            <label className={`transfer-upload ${uploading ? "is-busy" : ""}`}>
              <input
                type="file"
                multiple
                onChange={(event) => handleFolderInputChange(Array.from(event.target.files || []), event, path)}
                disabled={uploading}
              />
              {uploading ? "Upload u tijeku..." : "Dodaj datoteke"}
            </label>
          ) : null}
        </div>
      </div>

      <div className="transfer-breadcrumbs">
        <button type="button" className={`transfer-crumb ${!path ? "is-active" : ""}`} onClick={() => setPath("")}>Root</button>
        {breadcrumbs.map((crumb) => (
          <button
            key={crumb.path}
            type="button"
            className={`transfer-crumb ${crumb.path === path ? "is-active" : ""}`}
            onClick={() => setPath(crumb.path)}
          >
            {crumb.name}
          </button>
        ))}
      </div>

      {Object.keys(uploadProgress).length ? (
        <div className="transfer-card">
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
        </div>
      ) : null}

      {error ? <p className="transfer-error">{error}</p> : null}

      <div className="transfer-panel-grid">
        <div className="transfer-card">
          <div className="transfer-section-head">
            <h3>Folderi</h3>
            <span>{folders.length}</span>
          </div>

          {loading ? (
            <div className="transfer-empty">Učitavanje...</div>
          ) : folders.length ? (
            <div className="transfer-folder-list">
              {folders.map((folder) => (
                <div key={folder.path} className="transfer-folder-row">
                  <button
                    type="button"
                    className="transfer-folder-link"
                    onClick={() => setPath(folder.path)}
                  >
                    <span className="transfer-folder-icon">📁</span>
                    <span>
                      <strong>{folder.name}</strong>
                      <small>{folder.path}</small>
                    </span>
                  </button>

                  <div className="transfer-folder-actions">
                    {!path ? (
                      <FolderUploadButton
                        disabled={uploading}
                        onFiles={(selected, event) => handleFolderInputChange(selected, event, folder.path)}
                      />
                    ) : null}
                    {isAdmin ? (
                      <button type="button" className="btn btn-secondary" onClick={() => handleRenameFolder(folder)}>
                        Preimenuj
                      </button>
                    ) : null}
                    {isAdmin ? (
                      <button type="button" className="btn btn-ghost-danger" onClick={() => handleDeleteFolder(folder)}>
                        Obriši
                      </button>
                    ) : null}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="transfer-empty">U ovom folderu još nema podfoldera.</div>
          )}
        </div>

        <div className="transfer-card">
          <div className="transfer-section-head">
            <h3>Datoteke</h3>
            <span>{files.length}</span>
          </div>

          {loading ? (
            <div className="transfer-empty">Učitavanje...</div>
          ) : files.length ? (
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
                    <button type="button" className="btn btn-secondary" onClick={() => handleDownload(file)}>
                      Preuzmi
                    </button>
                    {isAdmin ? (
                      <button type="button" className="btn btn-ghost-danger" onClick={() => handleDeleteFile(file)}>
                        Obriši
                      </button>
                    ) : null}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="transfer-empty">U ovom folderu još nema datoteka.</div>
          )}
        </div>
      </div>
    </div>
  );
}

function ProjectCard({ project, onOpen, onRemove }) {
  return (
    <article className="transfer-project-card">
      <div className="transfer-project-main">
        <div>
          <h3>{project.label}</h3>
          <p>{project.expiresAt ? `Istječe: ${new Date(project.expiresAt).toLocaleDateString("hr-HR")}` : "Bez roka isteka"}</p>
        </div>
        <div className="transfer-project-buttons">
          <button type="button" className="btn btn-secondary" onClick={() => onOpen(project)}>
            Otvori kao admin
          </button>
          <button type="button" className="btn btn-ghost-danger" onClick={() => onRemove(project.code, project.label)}>
            Obriši svadbu
          </button>
        </div>
      </div>

      <div className="transfer-project-compact-grid">
        <div className="transfer-project-mini-card">
          <span className="transfer-project-label">Pristup za suradnike</span>
          <strong className="transfer-project-pin">PIN: {project.accessPin}</strong>
          <ProjectLinkButton value={project.links?.access} />
        </div>

        <div className="transfer-project-mini-card is-muted">
          <span className="transfer-project-label">Upravljanje projektom</span>
          <p>Folderi, upload, download i brisanje datoteka dostupni su kroz admin ulaz za ovu svadbu.</p>
        </div>
      </div>
    </article>
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
    if (!window.confirm(`Obrisati svadbu \"${labelText}\" i sve datoteke?`)) return;
    try {
      await api("/api/transfer/projects/delete", {
        method: "POST",
        body: JSON.stringify({ projectCode })
      });
      if (openedProject?.code === projectCode) setOpenedProject(null);
      await loadProjects();
    } catch (err) {
      setError(err.message || "Ne mogu obrisati svadbu.");
    }
  }

  if (openedProject) {
    return (
      <ProjectBrowser
        session={{
          role: "admin",
          projectCode: openedProject.code,
          projectLabel: openedProject.label
        }}
        onBackToProjects={() => setOpenedProject(null)}
        onLogout={onLogout}
      />
    );
  }

  return (
    <div className="transfer-shell">
      <TransferHeader
        title="Promar Transfer"
        subtitle="Portal za razmjenu datoteka"
        actions={<button type="button" className="btn btn-secondary" onClick={onLogout}>Odjava</button>}
      />

      <div className="transfer-dashboard-grid">
        <div className="transfer-card transfer-create-card-modern">
          <div className="transfer-section-head">
            <h2>Nova svadba</h2>
            <span>{projects.length}</span>
          </div>
          <p className="transfer-card-intro">Kreirajte projekt, dobijte PIN i link za suradnike te upravljajte folderima kroz admin ulaz.</p>
          <form className="transfer-admin-form-modern" onSubmit={create}>
            <label>
              Naziv svadbe
              <input value={label} onChange={(e) => setLabel(e.target.value)} placeholder="npr. Monika i Borna" />
            </label>
            <label>
              Istek pristupa
              <input type="date" value={expiresAt} onChange={(e) => setExpiresAt(e.target.value)} />
            </label>
            <button type="submit" className="btn btn-primary" disabled={busy}>
              {busy ? "Spremam..." : "Kreiraj svadbu"}
            </button>
          </form>
          {error ? <p className="transfer-error">{error}</p> : null}
        </div>

        <div className="transfer-card transfer-dashboard-note">
          <div className="transfer-section-head">
            <h2>Kako radi</h2>
            <span>1 PIN</span>
          </div>
          <ul className="transfer-bullet-list">
            <li>Suradnici ulaze s jednim PIN-om i vide iste foldere.</li>
            <li>Upload u root je ugašen. Datoteke idu samo u odabrani folder.</li>
            <li>Admin ima dodatno kreiranje, preimenovanje i brisanje foldera.</li>
          </ul>
        </div>
      </div>

      <div className="transfer-project-list compact-two-col">
        {projects.map((project) => (
          <ProjectCard key={project.code} project={project} onOpen={setOpenedProject} onRemove={remove} />
        ))}
        {!projects.length ? <div className="transfer-empty transfer-card">Još nema kreiranih svadbi.</div> : null}
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
        body: JSON.stringify(
          mode === "admin"
            ? { mode: "admin", adminPin: pin }
            : { inviteToken, pin }
        )
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
        <TransferHeader
          title="Promar Transfer"
          subtitle="Portal za razmjenu datoteka"
          actions={null}
        />
        <div className="transfer-login-card transfer-login-card-modern">
          <div className="transfer-section-head">
            <h2>{mode === "admin" ? "Admin ulaz" : "Pristup projektu"}</h2>
            <span>{mode === "admin" ? "Admin" : "PIN"}</span>
          </div>
          <p className="transfer-card-intro">
            {mode === "admin"
              ? "Ovdje upravljate svadbama, pristupima, folderima i datotekama."
              : "Otvoren je pristup za ovaj projekt. Upišite PIN koji ste dobili."}
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

  return <ProjectBrowser session={session} onLogout={handleLogout} />;
}
