import { RemoteApiError, TimeoutError } from "@travel-agent/shared";

type methodsWithBody = "POST" | "PUT" | "PATCH" | "DELETE";
type apiMethods = "GET" | methodsWithBody;

interface FetchClientConfig {
  apiUrl: string;
  apiKey?: string;
  apiPath?: string;
  apiMethod?: apiMethods;
  timeoutMs?: number;
  body?: any;
  headers?: Record<string, string>;
}

interface RequestInit {
  method: apiMethods;
  headers: Headers;
  body?:
    | string
    | ArrayBuffer
    | Blob
    | DataView
    | File
    | FormData
    | TypedArray
    | URLSearchParams
    | ReadableStream;
}

const DEFAULT_CONFIG: FetchClientConfig = {
  apiKey: "",
  apiUrl: "",
  apiPath: "",
  apiMethod: "GET",
  timeoutMs: 20000,
};

export class FetchClient {
  request: Request;

  constructor(config: Partial<FetchClientConfig> = {}) {
    const cfg: FetchClientConfig = { ...DEFAULT_CONFIG, ...(config || {}) };
    if (!cfg.apiUrl) {
      throw new RemoteApiError("apiUrl is required");
    }

    const path = cfg.apiPath || "";
    if (!URL.canParse(path, cfg.apiUrl)) {
      throw new RemoteApiError("Invalid API URL");
    }

    const url = new URL(path, cfg.apiUrl);

    const method: apiMethods = (
      cfg.apiMethod || "GET"
    ).toUpperCase() as apiMethods;
    const requestInit: RequestInit = {
      method,
      headers: new Headers(cfg.headers || {}),
    };

    if (cfg.apiKey && !requestInit.headers.has("authorization")) {
      requestInit.headers.set("authorization", `Bearer ${cfg.apiKey}`);
    }

    if (isMethodWithBody(method) && cfg.body != null) {
      if (typeof cfg.body === "string") {
        if (!requestInit.headers.has("content-type")) {
          requestInit.headers.set("content-type", "text/plain;charset=utf-8");
        }
        requestInit.body = cfg.body;
      } else {
        if (!requestInit.headers.has("content-type")) {
          requestInit.headers.set("content-type", "application/json");
        }
        requestInit.body = JSON.stringify(cfg.body);
      }
    }

    this.request = new Request(url.toString(), requestInit);
  }

  async handle(timeoutMs = DEFAULT_CONFIG.timeoutMs) {
    const controller = new AbortController();
    const TIMEOUT_ERROR_MSG = "timeout";
    const TIMEOUT_ERROR_NAME = "AbortError";
    const id = setTimeout(
      () => controller.abort(new Error(TIMEOUT_ERROR_MSG)),
      timeoutMs,
    );

    try {
      const response = await fetch(this.request, { signal: controller.signal });

      const contentType = response.headers.get("content-type") || "";
      if (!response.ok) {
        let details = null;
        if (contentType.includes("application/json")) {
          try {
            details = await response.json();
          } catch {
            // ignore errors parsing JSON
          }
        }
        const err = new RemoteApiError(
          `Upstream request failed: ${response.status} ${response.statusText}`,
        );
        err.details = {
          fields: [
            `status: ${response.status} (${response.statusText})`,
            `details: ${JSON.stringify(details)}`,
          ],
        };
        throw err;
      }

      if (contentType.includes("application/json")) {
        return await response.json();
      }

      return await response.text();
    } catch (e: Error | any) {
      if (e.name === TIMEOUT_ERROR_NAME || e.message === TIMEOUT_ERROR_MSG) {
        throw new TimeoutError(`Request timed out after ${timeoutMs}ms`);
      }
      throw e;
    } finally {
      clearTimeout(id);
    }
  }
}

function isMethodWithBody(method: apiMethods) {
  return new Set(["POST", "PUT", "PATCH", "DELETE"]).has(method);
}
