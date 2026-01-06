// src/components/mypage/StatsCards.jsx
import { useEffect, useState } from "react";
import { fetchRestaurants } from "../../api/restaurants";
import "./StatsCards.css";

/*
  StatsCards
  - 예약 / 찜 / 리뷰 수 요약 카드
  - 카드 클릭 시 상위(MyPage)에 선택 탭 전달
*/
const StatsCards = ({ stats, onSelect }) => {
  const [apiStats, setApiStats] = useState({
    reservations: 0,
    favorites: 0,
    reviews: 0,
  });

  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (stats) return;

    let alive = true;

    (async () => {
      try {
        setLoading(true);
        const res = await fetchRestaurants({ page: 0, size: 1 });

        if (!alive) return;
        setApiStats({
          reservations: 0,
          favorites: res?.totalElements ?? 0,
          reviews: 0,
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

  const finalStats = stats ?? apiStats;
  const { reservations, favorites, reviews } = finalStats;

  return (
    <section className="stats">
      {/* 예약 */}
      <div
        className="stats-card clickable"
        role="button"
        tabIndex={0}
        onClick={() => onSelect?.("reservations")}
      >
        <div className="stats-icon">⏱</div>
        <div className="stats-value">{loading ? "-" : reservations}</div>
        <div className="stats-label">예약</div>
      </div>

      {/* 찜 */}
      <div
        className="stats-card clickable"
        role="button"
        tabIndex={0}
        onClick={() => onSelect?.("favorites")}
      >
        <div className="stats-icon">♡</div>
        <div className="stats-value">{loading ? "-" : favorites}</div>
        <div className="stats-label">찜</div>
      </div>

      {/* 리뷰 */}
      <div
        className="stats-card clickable"
        role="button"
        tabIndex={0}
        onClick={() => onSelect?.("reviews")}
      >
        <div className="stats-icon">★</div>
        <div className="stats-value">{loading ? "-" : reviews}</div>
        <div className="stats-label">리뷰</div>
      </div>
    </section>
  );
};

export default StatsCards;
