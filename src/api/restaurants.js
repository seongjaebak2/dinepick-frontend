import { http } from "./api";

// 레스토랑 목록 조회 (Spring Page)
export async function fetchRestaurants({
  keyword = "",
  page = 0,
  size = 10,
} = {}) {
  const params = { page, size };
  if (keyword) params.keyword = keyword;
  const res = await http.get("/api/restaurants", { params });
  return res.data; // { content, totalElements, totalPages, number }
}

// 레스토랑 상세 조회
export async function fetchRestaurantById(restaurantId) {
  const res = await http.get(`/api/restaurants/${restaurantId}`);
  return res.data; // { id, name, address, description, maxPeoplePerReservation }
}
