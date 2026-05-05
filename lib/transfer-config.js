import { deletePrefix, getBasePrefix, getPortalManifestKey, readJsonObject, writeJsonObject } from "./b2";
import { createInviteToken } from "./transfer-auth";

const VALID_ROLES = ["user", "admin", "superadmin", "crew", "editor"];

export function normalizeProjectCode(input) {
  return String(input || "")
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9-_]/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "");
}

function randomPin() {
  return String(Math.floor(1000 + Math.random() * 9000));
}

function isLegacyProject(project) {
  return Boolean(project && (project.crewPin || project.editorPin || project.adminPin));
}

function normalizeProject(projectCode, project) {
  const legacy = isLegacyProject(project);

  return {
    code: projectCode,
    label: project?.label || projectCode,
    expiresAt: project?.expiresAt || null,
    mode: legacy ? "legacy" : "modern",
    accessPin: legacy ? String(project?.accessPin || project?.editorPin || "") : String(project?.accessPin || ""),
    crewPin: String(project?.crewPin || ""),
    editorPin: String(project?.editorPin || ""),
    adminPin: String(project?.adminPin || "")
  };
}

function readEnvProjects() {
  const raw = process.env.TRANSFER_PROJECTS;
  if (!raw) return {};
  const parsed = JSON.parse(raw);
  return parsed && typeof parsed === "object" ? parsed : {};
}

export async function getTransferProjects() {
  const stored = await readJsonObject(getPortalManifestKey());
  if (stored && typeof stored === "object" && !Array.isArray(stored)) return stored;
  return readEnvProjects();
}

export async function saveTransferProjects(projects) {
  await writeJsonObject(getPortalManifestKey(), projects);
}

export async function getProjectConfig(projectCode) {
  const projects = await getTransferProjects();
  const project = projects[projectCode];
  if (!project) return null;
  return normalizeProject(projectCode, project);
}

export function canUpload(role) {
  return VALID_ROLES.includes(role) && role !== "superadmin";
}

export function canDownload(role) {
  return VALID_ROLES.includes(role) && role !== "superadmin";
}

export function canDelete(role) {
  return role === "admin" || role === "superadmin";
}

export function canManageFolders(role) {
  return role === "admin" || role === "superadmin";
}

export function getAdminPin() {
  const pin = process.env.TRANSFER_ADMIN_PIN;
  if (!pin) throw new Error("Missing TRANSFER_ADMIN_PIN environment variable.");
  return String(pin);
}

export function isAdminPin(pin) {
  return String(pin || "") === getAdminPin();
}

function createProjectLinks(project) {
  const base = "/transfer?t=";

  if (project.mode === "legacy") {
    return {
      crew: `${base}${encodeURIComponent(createInviteToken({ projectCode: project.code, role: "crew" }))}`,
      editor: `${base}${encodeURIComponent(createInviteToken({ projectCode: project.code, role: "editor" }))}`,
      admin: `${base}${encodeURIComponent(createInviteToken({ projectCode: project.code, role: "admin" }))}`
    };
  }

  return {
    access: `${base}${encodeURIComponent(createInviteToken({ projectCode: project.code, role: "user" }))}`
  };
}

export async function listProjectsForAdmin() {
  const projects = await getTransferProjects();
  return Object.entries(projects)
    .map(([code, value]) => {
      const project = normalizeProject(code, value);
      return { ...project, links: createProjectLinks(project) };
    })
    .sort((a, b) => (a.label || "").localeCompare(b.label || "", "hr"));
}

export async function createProject({ label, expiresAt }) {
  const trimmedLabel = String(label || "").trim();
  if (!trimmedLabel) throw new Error("Upiši naziv svadbe.");

  const baseCode = normalizeProjectCode(trimmedLabel);
  const code = `${baseCode || "svadba"}-${Math.random().toString(36).slice(2, 7)}`;

  const projects = await getTransferProjects();
  projects[code] = {
    label: trimmedLabel,
    expiresAt: expiresAt || null,
    accessPin: randomPin()
  };

  await saveTransferProjects(projects);
  return normalizeProject(code, projects[code]);
}

export async function deleteProjectCompletely(projectCode) {
  const projects = await getTransferProjects();
  if (!projects[projectCode]) {
    throw new Error("Projekt nije pronađen.");
  }

  delete projects[projectCode];
  await saveTransferProjects(projects);
  await deletePrefix(`${getBasePrefix()}${projectCode}/`);
  return true;
}
