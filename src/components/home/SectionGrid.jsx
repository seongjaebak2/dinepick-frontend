import { useEffect, useState } from "react";
import "./SectionGrid.css";
import { fetchRestaurants } from "../../api/restaurants";
import RestaurantCard from "../restaurants/RestaurantCard";

/**
 * Home SectionGrid
 * - 홈 추천 식당 전용 (하이브리드 검색 적용)
 * - category로 필터 + 카카오 검색 결과 보충
 */
const SectionGrid = ({ title, category = "ALL", size = 6 }) => {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    let alive = true;

    (async () => {
      try {
        setLoading(true);
        setError("");

        // 1. DB 검색
        const dbData = await fetchRestaurants({
          category,
          page: 0,
          size,
        });

        if (!alive) return;

        const dbItems = Array.isArray(dbData?.content) ? dbData.content : [];

        // 2. Kakao 검색 (Hybrid)
        let kakaoItems = [];
        try {
          // 카테고리 매핑 (KOREAN -> 한식 등)
          const categoryMap = {
            KOREAN: "한식",
            CHINESE: "중식",
            JAPANESE: "일식",
            WESTERN: "양식",
            CAFE: "카페",
            ETC: "주점",
            ALL: "맛집"
          };
          const searchKw = categoryMap[category] || "맛집";
          const { searchKakaoPlaces } = await import("../../utils/kakaoPlaces");
          kakaoItems = await searchKakaoPlaces(searchKw);

          // 정확한 분류를 위해 한 번 더 필터링 (ALL이 아닐 때)
          if (category !== "ALL") {
            kakaoItems = kakaoItems.filter(item => item.category === category);
          }
        } catch (err) {
          console.warn("Kakao search failed in SectionGrid", err);
        }

        if (!alive) return;

        // DB 결과 뒤에 카카오 결과 붙이기 (최대 size 개수만큼만 표시할 수도 있지만 여기선 전체 병합 후 유연하게 처리)
        // 일단 홈화면이니 적절히 6~12개 정도 나오게 조절
        setItems([...dbItems, ...kakaoItems].slice(0, 12));
      } catch (e) {
        console.error(e);
        if (!alive) return;
        setError("레스토랑을 불러오지 못했어요.");
        setItems([]);
      } finally {
        if (!alive) return;
        setLoading(false);
      }
    })();

    return () => {
      alive = false;
    };
  }, [category, size]);

  return (
    <section className="section-grid">
      <div className="container">
        <div className="section-head">
          <h2 className="section-title">{title}</h2>
        </div>

        {loading && <p className="section-grid-state">불러오는 중...</p>}
        {!loading && error && <p className="section-grid-state">{error}</p>}
        {!loading && !error && items.length === 0 && (
          <p className="section-grid-state">표시할 레스토랑이 없습니다.</p>
        )}

        <div className="grid">
          {items.map((item) => (
            <RestaurantCard key={item.id} item={item} />
          ))}
        </div>
      </div>
    </section>
  );
};

export default SectionGrid;
