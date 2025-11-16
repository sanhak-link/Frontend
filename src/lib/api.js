// src/lib/api.js
// ──────────────────────────────────────────────────────────────
// 프록시(/api → 8080) & 절대경로(.env) 모두 지원
// - VITE_API_BASE_URL 없으면: Vite dev proxy 사용 (/api → 백엔드)
// - 있으면: 그 값을 BASE로 사용 (예: http://localhost:8080)
// 공통 유틸 + 로그인, 회원가입, 인증 요청 함수 제공
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
// [수정됨] USE_PROXY일 때 자동으로 /api를 붙여줍니다.
function buildUrl(path) {
  const p = path.startsWith("/") ? path : `/${path}`;
  if (USE_PROXY) {
    // dev 환경 또는 cPanel 프록시 사용 시:
    // 이미 path에 /api가 들어있다면 중복해서 붙이지 않음
    return p.startsWith("/api/") ? p : `/api${p}`;
  }
  // 절대 BASE 사용 시 (.env에 주소가 있을 때)
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

  const candidates = [
    // [수정 완료] '/api'를 제거했습니다. buildUrl이 자동으로 붙여줍니다.
    // 결과적으로 요청 주소는 /api/auth/login 이 됩니다.
    buildUrl('/auth/login')
  ];

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

  const candidates = [
    // [수정 완료] '/api'를 제거했습니다.
    buildUrl('/auth/signup'),
  ];
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