import crypto from "crypto";
import { cookies } from "next/headers";

const COOKIE_NAME = "promar_transfer_session";
const MAX_AGE_SECONDS = 60 * 60 * 12;

function getSecret() {
  const secret = process.env.TRANSFER_SESSION_SECRET;
  if (!secret) {
    throw new Error("Missing TRANSFER_SESSION_SECRET environment variable.");
  }
  return secret;
}

function base64url(input) {
  return Buffer.from(input)
    .toString("base64")
    .replace(/\+/g, "-")
    .replace(/\//g, "_")
    .replace(/=+$/g, "");
}

function sign(payload) {
  return crypto.createHmac("sha256", getSecret()).update(payload).digest("base64url");
}

export function createSignedToken(data) {
  const payload = base64url(JSON.stringify(data));
  const signature = sign(payload);
  return `${payload}.${signature}`;
}

export function readSignedToken(token) {
  if (!token || !token.includes(".")) return null;
  const [payload, signature] = token.split(".");
  const expected = sign(payload);
  if (signature !== expected) return null;

  const json = JSON.parse(Buffer.from(payload, "base64url").toString("utf8"));
  if (json?.exp && Date.now() > json.exp) return null;
  return json;
}

export function createInviteToken(data) {
  return createSignedToken({
    ...data,
    type: "invite",
    exp: data.exp || Date.now() + 1000 * 60 * 60 * 24 * 30
  });
}

export function readInviteToken(token) {
  const data = readSignedToken(token);
  if (!data || data.type !== "invite") return null;
  return data;
}

export async function setTransferSession(session) {
  const token = createSignedToken({
    ...session,
    type: "session",
    exp: Date.now() + MAX_AGE_SECONDS * 1000
  });

  const store = await cookies();
  store.set(COOKIE_NAME, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: MAX_AGE_SECONDS
  });
}

export async function clearTransferSession() {
  const store = await cookies();
  store.set(COOKIE_NAME, "", {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 0
  });
}

export async function getTransferSession() {
  const store = await cookies();
  const token = store.get(COOKIE_NAME)?.value;
  const data = readSignedToken(token);
  if (!data || data.type !== "session") return null;
  return data;
}
