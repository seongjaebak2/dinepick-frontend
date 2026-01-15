import axios from "axios";

// Axios 인스턴스 생성
export const http = axios.create({
  baseURL: "http://localhost:8080",
  headers: { "Content-Type": "application/json" },
});

// 요청 전에 토큰 자동 첨부
http.interceptors.request.use((config) => {
  const token = localStorage.getItem("accessToken");
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// 401 처리용 인터셉터를 1번만 적용하기 위함
let authInterceptorId = null;

// refresh 동시성 제어(여러 요청이 동시에 401 떠도 reissue 1번만)
let refreshPromise = null;

// reissue는 인터셉터/Authorization에 영향 안 받게 "plain axios"로 호출
async function reissueAccessToken() {
  if (refreshPromise) return refreshPromise;

  const refreshToken = localStorage.getItem("refreshToken");
  if (!refreshToken) {
    return Promise.reject(new Error("No refresh token"));
  }

  const baseURL = http.defaults.baseURL || "http://localhost:8080";

  refreshPromise = axios
    .post(
      `${baseURL}/api/auth/reissue`,
      { refreshToken },
      { headers: { "Content-Type": "application/json" } }
    )
    .then((res) => {
      const newAccessToken = res.data?.accessToken;
      if (!newAccessToken)
        throw new Error("No accessToken in reissue response");

      localStorage.setItem("accessToken", newAccessToken);
      return newAccessToken;
    })
    .finally(() => {
      refreshPromise = null;
    });

  return refreshPromise;
}

/**
 * Auth 만료/401 발생 시 자동 재발급(reissue) 후 재시도 한다.
 * - 실패하면 onUnauthorized() 호출 (로그아웃 처리)
 */
export function attachAuthInterceptors(onUnauthorized) {
  if (authInterceptorId !== null) {
    http.interceptors.response.eject(authInterceptorId);
    authInterceptorId = null;
  }

  authInterceptorId = http.interceptors.response.use(
    (res) => res,
    async (err) => {
      const status = err?.response?.status;
      const original = err?.config;
      if (!original) return Promise.reject(err);

      const url = original.url || "";
      const isAuthEndpoint =
        url.includes("/api/auth/login") ||
        url.includes("/api/auth/signup") ||
        url.includes("/api/auth/reissue") ||
        url.includes("/api/auth/logout");

      if (status === 401 && !isAuthEndpoint && !original._retry) {
        original._retry = true;
        try {
          const newAccessToken = await reissueAccessToken();
          original.headers.Authorization = `Bearer ${newAccessToken}`;
          return http(original);
        } catch {
          return Promise.reject(err);
        }
      }

      return Promise.reject(err);
    }
  );
}
