import { http } from "./api";

// 식당 목록 조회 API(페이지네이션 및 검색 지원)
export async function fetchRestaurants({
  keyword = "",
  category = "",
  page = 0,
  size = 10,
} = {}) {
  const params = { page, size };
  if (keyword) params.keyword = keyword;
  if (category && category !== "전체") {
    params.category = category;
  }

  const res = await http.get("/api/restaurants", { params });
  return res.data; // Spring Page 형태
}

// 식당 상세 조회 API
export async function fetchRestaurantById(id) {
  const res = await http.get(`/api/restaurants/${id}`);
  return res.data;
}
