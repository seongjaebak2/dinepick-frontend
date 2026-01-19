import { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import Layout from "../components/layout/Layout";
import FilterBar from "../components/restaurants/FilterBar";
import RestaurantGrid from "../components/restaurants/RestaurantGrid";
import Pagination from "../components/restaurants/Pagination";
import { fetchRestaurants, fetchNearbyRestaurants } from "../api/restaurants";
import { useGeolocation } from "../hooks/useGeolocation";

const PAGE_SIZE = 9;
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
  const [hint, setHint] = useState("");

  // ✅ Hybrid Pagination States
  const [kakaoPool, setKakaoPool] = useState([]); // 전체 카카오 검색 결과 저장
  const [dbTotal, setDbTotal] = useState(0);    // 백엔드 전체 아이템 수

  // ✅ 가까운순이면 위치 필요
  const { loaded: geoLoaded, coords, error: geoError } = useGeolocation();

  const customLat = searchParams.get("lat");
  const customLng = searchParams.get("lng");
  const locName = searchParams.get("locName");

  const isDistance = sortOption === "distance";

  // 검색 조건 바뀌면 페이지 초기화 (키워드/카테고리/정렬 등)
  useEffect(() => {
    setPage(0);
  }, [keyword, category, sortOption, customLat, customLng]);

  useEffect(() => {
    setSortOption(searchParams.get("sort") ?? "recommended");
  }, [searchParams]);

  useEffect(() => {
    let cancelled = false;

    const load = async () => {
      setLoading(true);
      setHint("");

      try {
        let currentKakaoPool = kakaoPool;

        // 1. New Search or Page 0: Kakao Pool 무조건 새로고침
        if (page === 0) {
          try {
            const { searchKakaoPlaces } = await import("../utils/kakaoPlaces");
            const categoryMap = {
              KOREAN: "한식",
              CHINESE: "중식",
              JAPANESE: "일식",
              WESTERN: "양식",
              CAFE: "카페",
              ETC: "주점" // 너무 많으면 AND 검색되어 0건 뜰 수 있으므로 단순화
            };

            let searchKw = keyword;
            if (category !== "ALL") {
              const label = categoryMap[category] || category;
              // 키워드에 해당 단어가 없을 때만 조합
              if (keyword) {
                if (!keyword.includes(label)) {
                  searchKw = `${keyword} ${label}`;
                }
              } else {
                searchKw = label;
              }
            } else if (!keyword) {
              searchKw = "맛집";
            }

            if (isDistance) {
              const DEFAULT_POS = { lat: 35.1577583, lng: 129.0593167 };
              const currentPos = (customLat && customLng) ? { lat: Number(customLat), lng: Number(customLng) } : (coords || DEFAULT_POS);
              currentKakaoPool = await searchKakaoPlaces(searchKw, { lat: currentPos.lat, lng: currentPos.lng });
            } else {
              currentKakaoPool = await searchKakaoPlaces(searchKw);
            }

            if (category !== "ALL") {
              currentKakaoPool = currentKakaoPool.filter(item => item.category === category);
            }

            if (!cancelled) setKakaoPool(currentKakaoPool);
          } catch (err) {
            console.warn("Kakao fetch failed", err);
            currentKakaoPool = []; // 실패 시 빈 배열로 진행
            if (!cancelled) setKakaoPool([]);
          }
        }

        // 2. DB Results Fetch (현재 페이지 분량)
        let dbResults = { content: [], totalElements: 0 };
        if (isDistance) {
          const DEFAULT_POS = { lat: 35.1577583, lng: 129.0593167 };
          const currentPos = (customLat && customLng) ? { lat: Number(customLat), lng: Number(customLng) } : (coords || DEFAULT_POS);

          if (!customLat && !coords) setHint("위치 권한이 없어 기본 위치(서면역) 기준으로 검색합니다.");
          else if (customLat) setHint(`'${locName || "지정된 위치"}' 기준 주변 맛집입니다.`);

          dbResults = await fetchNearbyRestaurants({
            lat: currentPos.lat,
            lng: currentPos.lng,
            radiusKm: NEARBY_RADIUS_KM,
            keyword,
            category,
            page,
            size: PAGE_SIZE,
          });
        } else {
          dbResults = await fetchRestaurants({
            keyword,
            category,
            page,
            size: PAGE_SIZE,
          });
        }

        if (cancelled) return;
        setDbTotal(dbResults.totalElements || 0);

        // 3. Hybrid Merge (9개 채우기)
        let mergedItems = [...(dbResults.content || [])];
        const dbCountOnThisPage = mergedItems.length;

        if (dbCountOnThisPage < PAGE_SIZE && currentKakaoPool.length > 0) {
          // 카카오 아이템 중 어디서부터 가져올지 계산 (Skip)
          // 전체 아이템 관점에서 현재 페이지 시작 인덱스 (page * 9)
          // 거기서 dbTotalCount를 뺀 만큼이 카카오의 시작점
          const kakaoStartIdx = Math.max(0, (page * PAGE_SIZE) - (dbResults.totalElements || 0));
          const kakaoEndIdx = kakaoStartIdx + (PAGE_SIZE - dbCountOnThisPage);

          const kakaoSlice = currentKakaoPool.slice(kakaoStartIdx, kakaoEndIdx);
          mergedItems = [...mergedItems, ...kakaoSlice];
        }

        setData({
          ...dbResults,
          content: mergedItems,
          totalElements: (dbResults.totalElements || 0) + currentKakaoPool.length,
          totalPages: Math.ceil(((dbResults.totalElements || 0) + currentKakaoPool.length) / PAGE_SIZE)
        });

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
