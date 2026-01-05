import axios from "axios";

// Axios 인스턴스 생성 - 백엔드 서버 기본 URL 설정
export const http = axios.create({
  baseURL: "http://localhost:8080",
  headers: { "Content-Type": "application/json" },
});

// 서버로 요청이 보내지기 전에 자동으로 토큰을 헤더에 포함시키는 인터셉터 설정
http.interceptors.request.use((config) => {
  const token = localStorage.getItem("accessToken");
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});
