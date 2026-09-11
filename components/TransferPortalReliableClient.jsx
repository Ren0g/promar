"use client";

import { useEffect } from "react";
import TransferPortalClient from "@/components/TransferPortalClient";

const RETRYABLE_STATUS_CODES = new Set([408, 425, 429, 500, 502, 503, 504]);
const RETRY_DELAYS_MS = [1000, 2000, 4000, 8000, 15000, 30000, 30000];

function isBackblazeUploadRequest(input, init) {
  const method = String(init?.method || (typeof Request !== "undefined" && input instanceof Request ? input.method : "GET")).toUpperCase();
  if (method !== "PUT") return false;

  const rawUrl = typeof input === "string" || input instanceof URL ? String(input) : input?.url;
  if (!rawUrl) return false;

  try {
    const hostname = new URL(rawUrl, window.location.href).hostname.toLowerCase();
    return hostname.endsWith("backblazeb2.com") || hostname.endsWith("backblaze.com");
  } catch {
    return false;
  }
}

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export default function TransferPortalReliableClient() {
  useEffect(() => {
    const originalFetch = window.fetch.bind(window);

    async function fetchWithB2Retry(input, init) {
      if (!isBackblazeUploadRequest(input, init)) {
        return originalFetch(input, init);
      }

      let lastResponse = null;
      let lastError = null;
      const maxAttempts = RETRY_DELAYS_MS.length + 1;

      for (let attempt = 0; attempt < maxAttempts; attempt += 1) {
        try {
          const response = await originalFetch(input, init);

          if (response.ok || !RETRYABLE_STATUS_CODES.has(response.status)) {
            return response;
          }

          lastResponse = response;
          lastError = null;
        } catch (error) {
          lastError = error;
          lastResponse = null;
        }

        if (attempt < RETRY_DELAYS_MS.length) {
          const jitter = Math.floor(Math.random() * 500);
          await sleep(RETRY_DELAYS_MS[attempt] + jitter);
        }
      }

      if (lastResponse) return lastResponse;
      throw lastError || new Error("Upload prema B2 nije uspio nakon više pokušaja.");
    }

    window.fetch = fetchWithB2Retry;

    return () => {
      if (window.fetch === fetchWithB2Retry) {
        window.fetch = originalFetch;
      }
    };
  }, []);

  return <TransferPortalClient />;
}
