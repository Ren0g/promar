const VALID_ROLES = ["crew", "editor", "admin"];
const VALID_AREAS = ["raw", "final"];

export function getTransferProjects() {
  const raw = process.env.TRANSFER_PROJECTS;
  if (!raw) {
    throw new Error("Missing TRANSFER_PROJECTS environment variable.");
  }

  const parsed = JSON.parse(raw);
  if (!parsed || typeof parsed !== "object") {
    throw new Error("TRANSFER_PROJECTS must be a JSON object.");
  }

  return parsed;
}

export function getProjectConfig(projectCode) {
  const projects = getTransferProjects();
  const project = projects[projectCode];
  if (!project) return null;

  return {
    code: projectCode,
    label: project.label || projectCode,
    expiresAt: project.expiresAt || null,
    crewPin: project.crewPin || null,
    editorPin: project.editorPin || null,
    adminPin: project.adminPin || null
  };
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
  return role === "admin";
}

export function normalizeProjectCode(input) {
  return String(input || "")
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9-_]/g, "");
}
