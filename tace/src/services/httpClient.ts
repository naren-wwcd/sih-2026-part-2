import type { ApiError } from '@/types'

// All backend calls go through /api which vite.config.ts proxies to the
// FastAPI service in dev. In production, set VITE_API_BASE_URL and this
// falls back to hitting the backend directly (make sure CORS is enabled
// there in that case).
const API_BASE = import.meta.env.VITE_API_BASE_URL ?? '/api'

const DEFAULT_TIMEOUT_MS = 15_000

interface RequestOptions {
  method?: 'GET' | 'POST' | 'PUT' | 'DELETE'
  body?: unknown
  retries?: number
  timeoutMs?: number
  signal?: AbortSignal
}

function toApiError(status: number, message: string, detail?: unknown): ApiError {
  return { status, message, detail }
}

async function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms))
}

/**
 * Core request function. Retries idempotent-safe failures (network errors,
 * 502/503/504) with exponential backoff. Does NOT retry 4xx errors — those
 * are treated as terminal (bad request, not found, validation, etc).
 */
export async function request<T>(path: string, options: RequestOptions = {}): Promise<T> {
  const { method = 'GET', body, retries = 2, timeoutMs = DEFAULT_TIMEOUT_MS, signal } = options

  let attempt = 0
  let lastError: ApiError = toApiError(0, 'Request failed')

  while (attempt <= retries) {
    const controller = new AbortController()
    const timeout = setTimeout(() => controller.abort(), timeoutMs)

    // Combine caller-provided signal (if any) with our own timeout signal
    if (signal) {
      signal.addEventListener('abort', () => controller.abort(), { once: true })
    }

    try {
      const res = await fetch(`${API_BASE}${path}`, {
        method,
        headers: body ? { 'Content-Type': 'application/json' } : undefined,
        body: body ? JSON.stringify(body) : undefined,
        signal: controller.signal,
      })
      clearTimeout(timeout)

      if (!res.ok) {
        let detail: unknown
        try {
          detail = await res.json()
        } catch {
          detail = await res.text().catch(() => undefined)
        }
        const message =
          (detail as { detail?: string; message?: string })?.detail ??
          (detail as { detail?: string; message?: string })?.message ??
          `Request failed with status ${res.status}`
        const apiError = toApiError(res.status, message, detail)

        // Retry on server errors only; 4xx is terminal
        if (res.status >= 500 && attempt < retries) {
          lastError = apiError
          attempt++
          await sleep(2 ** attempt * 300)
          continue
        }
        throw apiError
      }

      if (res.status === 204) return undefined as T
      return (await res.json()) as T
    } catch (err) {
      clearTimeout(timeout)

      // Already a typed ApiError thrown above (4xx or exhausted retries)
      if (typeof err === 'object' && err !== null && 'status' in err) {
        throw err
      }

      const isAbort = err instanceof DOMException && err.name === 'AbortError'
      const message = isAbort
        ? 'Request timed out — the backend may be unreachable.'
        : 'Network error — could not reach the TACE backend.'
      lastError = toApiError(0, message)

      if (attempt < retries) {
        attempt++
        await sleep(2 ** attempt * 300)
        continue
      }
      throw lastError
    }
  }

  throw lastError
}

export const http = {
  get: <T>(path: string, options?: Omit<RequestOptions, 'method' | 'body'>) =>
    request<T>(path, { ...options, method: 'GET' }),
  post: <T>(path: string, body?: unknown, options?: Omit<RequestOptions, 'method' | 'body'>) =>
    request<T>(path, { ...options, method: 'POST', body }),
}
