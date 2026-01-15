import { http } from "./api";

// 로그인된 회원 정보 조회(마이페이지) API
export async function fetchMe() {
  const res = await http.get("/api/members/me");
  return res.data;
}
