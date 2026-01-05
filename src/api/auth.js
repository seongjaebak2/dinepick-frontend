import { http } from "./api";

// 회원가입 API
export async function signup({ email, password, name }) {
  const res = await http.post("/api/auth/signup", { email, password, name });
  return res.data;
}

// 로그인 API
export async function login({ email, password }) {
  const res = await http.post("/api/auth/login", { email, password });
  return res.data;
}
