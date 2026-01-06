// src/components/mypage/StatsCards.jsx
import { useEffect, useState } from "react";
import { fetchRestaurants } from "../../api/restaurants";
import "./StatsCards.css";

/*
  StatsCards
  - 예약 / 찜 / 리뷰 수 요약 카드
  - props(stats)가 없으면 내부에서 API 호출
*/
const StatsCards = ({ stats }) => {
  // API로 가져온 통계 값 저장
  const [apiStats, setApiStats] = useState({
    reservations: 0,
    favorites: 0,
    reviews: 0,
  });

  // 로딩 상태
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    // stats가 props로 들어오면 API 호출 생략
    if (stats) return;

    let alive = true;

    (async () => {
      try {
        setLoading(true);

        // 레스토랑 목록 개수로 찜 수 대체
        const res = await fetchRestaurants({ page: 0, size: 1 });

        if (!alive) return;

        setApiStats({
          reservations: 0, // 예약 API 추가 시 교체
          favorites: res?.totalElements ?? 0,
          reviews: 0, // 리뷰 API 추가 시 교체
        });
      } catch (e) {
        console.error("StatsCards API error:", e);
      } finally {
        if (!alive) return;
        setLoading(false);
      }
    })();

    return () => {
      alive = false;
    };
  }, [stats]);

  // props 우선, 없으면 API 결과 사용
  const finalStats = stats ?? apiStats;
  const { reservations, favorites, reviews } = finalStats;

  return (
    <section className="stats">
      <div className="stats-card">
        <div className="stats-icon">⏱</div>
        <div className="stats-value">{loading ? "-" : reservations}</div>
        <div className="stats-label">예약</div>
      </div>

      <div className="stats-card">
        <div className="stats-icon">♡</div>
        <div className="stats-value">{loading ? "-" : favorites}</div>
        <div className="stats-label">찜</div>
      </div>

      <div className="stats-card">
        <div className="stats-icon">★</div>
        <div className="stats-value">{loading ? "-" : reviews}</div>
        <div className="stats-label">리뷰</div>
      </div>
    </section>
  );
};

export default StatsCards;
