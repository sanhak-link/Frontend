// src/lib/api.js
// ──────────────────────────────────────────────────────────────
// 프록시(/api → 8080) & 절대경로(.env) 모두 지원
// - VITE_API_BASE_URL 없으면: Vite dev proxy 사용 (/api → 백엔드)
// - 있으면: 그 값을 BASE로 사용 (예: http://localhost:8080)
// 공통 유틸 + 로그인, 회원가입, 이메일 인증, 인증 필요 호출
// ──────────────────────────────────────────────────────────────

// BASE 설정 ----------------------------------------------------
const RAW_BASE = (import.meta.env.VITE_API_BASE_URL || "").trim();
const ABS_BASE = RAW_BASE.replace(/\/+$/, ""); // 끝 슬래시 제거
const USE_PROXY = ABS_BASE === "";

// 내부 유틸 ----------------------------------------------------
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

async function fetchWithTimeout(url, init = {}, timeoutMs = 10000) {
  const ctrl = new AbortController();
  const id = setTimeout(() => ctrl.abort(), timeoutMs);
  try {
    return await fetch(url, { signal: ctrl.signal, ...init });
  } finally {
    clearTimeout(id);
  }
}

async function safeJson(res) {
  try {
    return await res.json();
  } catch {
    return null;
  }
}

// path로부터 실제 요청 URL 생성
function buildUrl(path) {
  const p = path.startsWith("/") ? path : `/${path}`;
  if (USE_PROXY) {
    // dev 환경: 프론트는 /api로 호출, Vite가 백엔드로 프록시
    return p.startsWith("/api/") ? p : `/api${p}`;
  }
  // 절대 BASE 사용 시
  return `${ABS_BASE}${p}`;
}

// 토큰 저장/조회 -----------------------------------------------
function saveTokenMaybe(data) {
  const token = data?.accessToken || data?.token || null;
  if (token) {
    try {
      localStorage.setItem("accessToken", token);
    } catch {
      // storage 막힌 환경 대비
    }
  }
  return token;
}

export function getToken() {
  try {
    return localStorage.getItem("accessToken");
  } catch {
    return null;
  }
}

export function clearToken() {
  try {
    localStorage.removeItem("accessToken");
  } catch {
    // ignore
  }
}

// ── API: 로그인 ───────────────────────────────────────────────
// 프론트에서: login({ email, password })
export async function login({ email, password }) {
  const body = JSON.stringify({ email, password });

  const candidates = [buildUrl("/api/auth/login")];

  let lastErr = "로그인 실패";

  for (const url of candidates) {
    try {
      const res = await fetchWithTimeout(
        url,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body,
        },
        10000
      );

      const data = await safeJson(res);
      const success =
        res.ok &&
        (data?.success === true ||
          data?.ok === true ||
          data?.accessToken ||
          data?.token);

      if (!success) {
        lastErr =
          (data && (data.message || data.error)) ||
          `HTTP ${res.status} at ${url}`;
        // 다음 후보 시도
        continue;
      }

      saveTokenMaybe(data);
      return { ok: true, data, used: url };
    } catch (e) {
      lastErr = e?.message || "네트워크 오류";
      await sleep(50);
      continue;
    }
  }

  return { ok: false, error: lastErr };
}

// ── API: 회원가입 ─────────────────────────────────────────────
export async function signup({
  email,
  password,
  name,
  phoneNumber,
}) {
  const body = JSON.stringify({
    email,
    password,
    name,
    phoneNumber,
  });

  const candidates = [buildUrl("/api/auth/signup")];
  let lastErr = "회원가입 실패";

  for (const url of candidates) {
    try {
      const res = await fetchWithTimeout(
        url,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body,
        },
        10000
      );

      const data = await safeJson(res);
      const success =
        res.ok &&
        (data?.success === true ||
          data?.ok === true ||
          data?.accessToken ||
          data?.token);

      if (!success) {
        lastErr =
          (data && (data.message || data.error)) ||
          `HTTP ${res.status} at ${url}`;
        continue;
      }

      // 회원가입 응답에 토큰이 있다면 저장
      saveTokenMaybe(data);
      return { ok: true, data, used: url };
    } catch (e) {
      lastErr = e?.message || "네트워크 오류";
      await sleep(50);
      continue;
    }
  }

  return { ok: false, error: lastErr };
}

// ── API: 이메일 인증 코드 발송 ────────────────────────────────
// 프론트: sendEmailCode(email)
export async function sendEmailCode(email) {
  const body = JSON.stringify({ email });
  const url = buildUrl("/api/auth/email/send");
  let lastErr = "인증 코드 발송 실패";

  try {
    const res = await fetchWithTimeout(
      url,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body,
      },
      10000
    );

    const data = await safeJson(res);
    if (!res.ok) {
      lastErr =
        (data && (data.message || data.error)) ||
        `HTTP ${res.status} at ${url}`;
      return { ok: false, error: lastErr, data, used: url };
    }

    return { ok: true, data, used: url };
  } catch (e) {
    lastErr = e?.message || "네트워크 오류";
    return { ok: false, error: lastErr, used: url };
  }
}

// ── API: 이메일 인증 코드 검증 ────────────────────────────────
// 프론트: verifyEmailCode({ email, code })
export async function verifyEmailCode({ email, code }) {
  const body = JSON.stringify({ email, code });
  const url = buildUrl("/api/auth/email/verify");
  let lastErr = "이메일 인증 실패";

  try {
    const res = await fetchWithTimeout(
      url,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body,
      },
      10000
    );

    const data = await safeJson(res);
    if (!res.ok) {
      lastErr =
        (data && (data.message || data.error)) ||
        `HTTP ${res.status} at ${url}`;
      return { ok: false, error: lastErr, data, used: url };
    }

    return { ok: true, data, used: url };
  } catch (e) {
    lastErr = e?.message || "네트워크 오류";
    return { ok: false, error: lastErr, used: url };
  }
}

// ── API: 인증 필요 호출 ──────────────────────────────────────
// 예: apiAuthFetch("/user/me", { method: "GET" })
export async function apiAuthFetch(path, options = {}) {
  const token = getToken();
  const headers = new Headers(options.headers || {});
  if (token) headers.set("Authorization", `Bearer ${token}`);

  const init = { ...options, headers };
  if (init.body && !headers.has("Content-Type")) {
    headers.set("Content-Type", "application/json");
  }

  const url = buildUrl(path);
  const res = await fetchWithTimeout(url, init, 10000);

  let data = null;
  if (res.status !== 204) {
    data = await safeJson(res);
  }

  return { status: res.status, ok: res.ok, data, used: url };
}
