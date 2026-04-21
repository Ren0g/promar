import { deletePrefix, getBasePrefix, getPortalManifestKey, readJsonObject, writeJsonObject } from "./b2";
import { createInviteToken } from "./transfer-auth";

const VALID_ROLES = ["crew", "editor", "admin", "superadmin"];
const VALID_AREAS = ["raw", "final"];

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
    crewPin: String(project.crewPin || ""),
    editorPin: String(project.editorPin || ""),
    adminPin: String(project.adminPin || "")
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

export function resolveRoleForPin(project, pin) {
  if (project.adminPin && pin === project.adminPin) return "admin";
  if (project.editorPin && pin === project.editorPin) return "editor";
  if (project.crewPin && pin === project.crewPin) return "crew";
  return null;
}

export function canUpload(role, area) {
  if (!VALID_ROLES.includes(role) || !VALID_AREAS.includes(area)) return false;
  if (role === "admin") return true;
  if (role === "crew") return area === "raw";
  if (role === "editor") return area === "final";
  return false;
}

export function canDownload(role, area) {
  if (!VALID_ROLES.includes(role) || !VALID_AREAS.includes(area)) return false;
  if (role === "admin") return true;
  if (role === "crew") return area === "final";
  if (role === "editor") return area === "raw";
  return false;
}

export function canDelete(role) {
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
  const crewToken = createInviteToken({ projectCode, role: "crew", exp: Date.now() + roleExpMs });
  const editorToken = createInviteToken({ projectCode, role: "editor", exp: Date.now() + roleExpMs });
  const adminToken = createInviteToken({ projectCode, role: "admin", exp: Date.now() + roleExpMs });
  return {
    crew: `${base}${encodeURIComponent(crewToken)}`,
    editor: `${base}${encodeURIComponent(editorToken)}`,
    admin: `${base}${encodeURIComponent(adminToken)}`
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
    crewPin: randomPin(),
    editorPin: randomPin(),
    adminPin: randomPin()
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
