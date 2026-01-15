import { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import Layout from "../components/layout/Layout";
import FilterBar from "../components/restaurants/FilterBar";
import RestaurantGrid from "../components/restaurants/RestaurantGrid";
import Pagination from "../components/restaurants/Pagination";
import { fetchRestaurants, fetchNearbyRestaurants } from "../api/restaurants";
import { useGeolocation } from "../hooks/useGeolocation";

const PAGE_SIZE = 6;
const NEARBY_RADIUS_KM = 10; // 필요하면 조절

const RestaurantsPage = () => {
  const [searchParams, setSearchParams] = useSearchParams();

  const keyword = searchParams.get("keyword") ?? "";
  const category = searchParams.get("category") ?? "ALL";

  const [page, setPage] = useState(0);
  const sortFromUrl = searchParams.get("sort") ?? "recommended";
  const [sortOption, setSortOption] = useState(sortFromUrl);

  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [hint, setHint] = useState(""); // ✅ 거리순일 때 위치 관련 안내용

  // ✅ 가까운순이면 위치 필요
  const { loaded: geoLoaded, coords, error: geoError } = useGeolocation();

  const isDistance = sortOption === "distance";

  // keyword/category/sortOption 바뀌면 첫 페이지로
  useEffect(() => {
    setPage(0);
  }, [keyword, category, sortOption]);

  useEffect(() => {
    setSortOption(searchParams.get("sort") ?? "recommended");
  }, [searchParams]);

  useEffect(() => {
    let cancelled = false;

    const load = async () => {
      setLoading(true);
      setHint("");

      try {
        // ✅ 가까운순: nearby 호출
        if (isDistance) {
          // 위치 로딩 중이면 대기
          if (!geoLoaded) {
            setHint("내 위치를 확인하는 중...");
            setData(null);
            return;
          }

          // loaded인데 coords 없으면(권한 거부/실패/타임아웃)
          if (!coords) {
            const msg =
              geoError?.code === 1
                ? "가까운순 정렬을 위해 위치 권한이 필요합니다."
                : "내 위치를 가져오지 못했습니다. 위치 설정을 확인해주세요.";
            setHint(msg);

            // UI 깨지지 않게 빈 페이지 형태로 세팅
            setData({
              content: [],
              totalPages: 1,
              totalElements: 0,
              number: 0,
            });
            return;
          }

          const res = await fetchNearbyRestaurants({
            lat: coords.lat,
            lng: coords.lng,
            radiusKm: NEARBY_RADIUS_KM,
            keyword,
            category,
            page,
            size: PAGE_SIZE,
          });

          if (cancelled) return;
          setData(res);
          return;
        }

        // ✅ 추천순(기본): 기존 API 그대로
        const res = await fetchRestaurants({
          keyword,
          category,
          page,
          size: PAGE_SIZE,
        });

        if (cancelled) return;
        setData(res);
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    load();

    return () => {
      cancelled = true;
    };
  }, [keyword, category, page, isDistance, geoLoaded, coords, geoError]);

  // 검색어 submit: 빈값이면 전체보기
  const handleKeywordSubmit = (nextKeyword) => {
    const params = new URLSearchParams(searchParams);

    if (!nextKeyword) params.delete("keyword");
    else params.set("keyword", nextKeyword);

    setSearchParams(params);
  };

  const items = data?.content ?? [];
  const totalPages = data?.totalPages ?? 1;
  const totalElements = data?.totalElements ?? 0;

  return (
    <Layout>
      <div className="container" style={{ padding: "22px 0" }}>
        <h1 style={{ margin: "0 0 6px", letterSpacing: "-0.3px" }}>
          {keyword ? `"${keyword}" 검색 결과` : "Restaurants"}
        </h1>
        <p style={{ margin: 0, color: "#6b7280", fontSize: 14 }}>
          {totalElements} results found
        </p>

        <FilterBar
          keyword={keyword}
          selectedCategory={category}
          sortOption={sortOption}
          onCategoryChange={({ category: nextCategory }) => {
            const params = new URLSearchParams(searchParams);
            if (nextCategory === "ALL") params.delete("category");
            else params.set("category", nextCategory);
            setSearchParams(params);
          }}
          onSortChange={({ sort }) => {
            const params = new URLSearchParams(searchParams);
            params.set("page", "0");
            if (sort === "recommended") params.delete("sort");
            else params.set("sort", sort);
            setSearchParams(params);
          }}
          onKeywordSubmit={handleKeywordSubmit}
        />

        {/* 거리순 안내 문구 */}
        {hint && (
          <div style={{ marginTop: 10, color: "#6b7280", fontSize: 13 }}>
            {hint}
          </div>
        )}

        {loading ? (
          <div style={{ padding: 20 }}>불러오는 중...</div>
        ) : (
          <RestaurantGrid items={items} />
        )}

        <Pagination
          currentPage={page + 1}
          totalPages={totalPages}
          onChange={({ nextPage }) => setPage(nextPage - 1)}
        />
      </div>
    </Layout>
  );
};

export default RestaurantsPage;
