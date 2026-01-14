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

/**
 * Auth 만료/401 발생 시 자동 로그아웃을 연결한다.
 * - AuthProvider에서 logout 함수를 주입해 호출하도록 만든다.
 */
export function attachAuthInterceptors(onUnauthorized) {
  // 이미 값이 있으면 제거 후 재부착(중복 방지)
  if (authInterceptorId !== null) {
    http.interceptors.response.eject(authInterceptorId);
    authInterceptorId = null;
  }

  authInterceptorId = http.interceptors.response.use(
    (res) => res,
    (err) => {
      const status = err?.response?.status;

      // 토큰 만료/무효 시 401
      if (status === 401) {
        onUnauthorized?.();
      }
      return Promise.reject(err);
    }
  );
}
