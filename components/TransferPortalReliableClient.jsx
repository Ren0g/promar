"use client";

import { useEffect } from "react";
import TransferPortalClient from "@/components/TransferPortalClient";

const RETRYABLE_STATUS_CODES = new Set([408, 425, 429, 500, 502, 503, 504]);
const RETRY_DELAYS_MS = [1000, 2000, 4000, 8000, 15000, 30000, 30000];

function getRetryableRequest(input, init) {
  // Current transfer uploader always calls fetch with a URL string and a replayable
  // Blob/JSON body. Do not retry arbitrary Request objects because their body may
  // already be consumed after the first attempt.
  if (!(typeof input === "string" || input instanceof URL)) return null;

  const method = String(init?.method || "GET").toUpperCase();

  try {
    const url = new URL(String(input), window.location.href);
    const hostname = url.hostname.toLowerCase();
    const isBackblazePartUpload =
      method === "PUT" &&
      (hostname.endsWith("backblazeb2.com") || hostname.endsWith("backblaze.com"));
    const isTransferMultipartApi =
      method === "POST" &&
      url.origin === window.location.origin &&
      [
        "/api/transfer/multipart/start",
        "/api/transfer/multipart/part-url",
        "/api/transfer/multipart/complete"
      ].includes(url.pathname);

    return isBackblazePartUpload || isTransferMultipartApi ? { method, url } : null;
  } catch {
    return null;
  }
}

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export default function TransferPortalReliableClient() {
  useEffect(() => {
    const originalFetch = window.fetch.bind(window);

    async function fetchWithTransferRetry(input, init) {
      const retryableRequest = getRetryableRequest(input, init);
      if (!retryableRequest) {
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
      throw lastError || new Error("Upload nije uspio nakon više automatskih pokušaja.");
    }

    window.fetch = fetchWithTransferRetry;

    return () => {
      if (window.fetch === fetchWithTransferRetry) {
        window.fetch = originalFetch;
      }
    };
  }, []);

  return <TransferPortalClient />;
}
