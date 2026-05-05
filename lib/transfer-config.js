import { deletePrefix, getBasePrefix, getPortalManifestKey, readJsonObject, writeJsonObject } from "./b2";
import { createInviteToken } from "./transfer-auth";

const VALID_ROLES = ["user", "admin", "superadmin"];

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

function normalizeProject(projectCode, project) {
  return {
    code: projectCode,
    label: project.label || projectCode,
    expiresAt: project.expiresAt || null,
    accessPin: String(project.accessPin || "")
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

export function projectLinks(projectCode, roleExpMs = 1000 * 60 * 60 * 24 * 30) {
  const base = "/transfer?t=";
  const token = createInviteToken({ projectCode, role: "user", exp: Date.now() + roleExpMs });
  return {
    access: `${base}${encodeURIComponent(token)}`
  };
}

export async function listProjectsForAdmin() {
  const projects = await getTransferProjects();
  return Object.entries(projects)
    .map(([code, value]) => {
      const project = normalizeProject(code, value);
      return { ...project, links: projectLinks(code) };
    })
    .sort((a, b) => (a.label || "").localeCompare(b.label || "hr"));
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
