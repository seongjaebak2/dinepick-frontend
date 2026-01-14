import { http } from "./api";

// 레스토랑 목록 조회 API - keyword + category + paging
export async function fetchRestaurants({
  keyword,
  category,
  page = 0,
  size = 10,
} = {}) {
  const params = { page, size };

  // keyword: 비어있으면 아예 안 보냄
  const kw = typeof keyword === "string" ? keyword.trim() : "";
  if (kw) params.keyword = kw;

  // category: ALL/빈값이면 아예 안 보냄 (백엔드 enum 오류 방지)
  if (category && category !== "ALL") params.category = category;

  try {
    const res = await http.get("/api/restaurants", { params });
    return res.data;
  } catch (err) {
    console.error("[fetchRestaurants] failed", {
      url: err?.config?.url,
      params: err?.config?.params,
      status: err?.response?.status,
      data: err?.response?.data,
    });
    throw err;
  }
}

// 레스토랑 상세 조회 API
export async function fetchRestaurantById(restaurantId) {
  const res = await http.get(`/api/restaurants/${restaurantId}`);
  return res.data;
}

/**
 * 위치 기반 레스토랑 검색
 * GET /api/restaurants/nearby
 */
export async function fetchNearbyRestaurants({
  lat,
  lng,
  radiusKm,
  keyword,
  category,
  page = 0,
  size = 10,
}) {
  if (lat == null || lng == null) throw new Error("lat/lng is required");
  if (radiusKm == null) throw new Error("radiusKm is required");

  const params = {
    lat,
    lng,
    radius: radiusKm, // 서버 스펙: km
    page,
    size,
  };

  const kw = typeof keyword === "string" ? keyword.trim() : "";
  if (kw) params.keyword = kw;

  if (category && category !== "ALL") params.category = category;

  const res = await http.get("/api/restaurants/nearby", { params });
  return res.data;
}
