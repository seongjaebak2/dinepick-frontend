// src/components/mypage/FavoritesSection.jsx
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { fetchRestaurants } from "../../api/restaurants";
import "./FavoritesSection.css";

/*
  FavoritesSection
  - 찜(또는 레스토랑 목록) 카드 표시
  - props 없으면 API로 목록 조회
*/
export default function FavoritesSection({ favorites }) {
  const navigate = useNavigate();

  const [data, setData] = useState({
    content: favorites ?? [],
    totalPages: 1,
    number: 0,
  });

  const [loading, setLoading] = useState(!favorites);
  const [error, setError] = useState("");

  const page = data?.number ?? 0;
  const totalPages = data?.totalPages ?? 1;
  const list = data?.content ?? [];

  useEffect(() => {
    if (favorites) return;

    let alive = true;

    (async () => {
      try {
        setLoading(true);
        setError("");

        const res = await fetchRestaurants({ page, size: 10 });

        if (!alive) return;
        setData(res);
      } catch {
        if (!alive) return;
        setError("레스토랑 목록을 불러오지 못했습니다.");
      } finally {
        if (!alive) return;
        setLoading(false);
      }
    })();

    return () => {
      alive = false;
    };
  }, [favorites, page]);

  const goPrev = async () => {
    if (favorites || page <= 0) return;
    setLoading(true);
    const res = await fetchRestaurants({ page: page - 1, size: 10 });
    setData(res);
    setLoading(false);
  };

  const goNext = async () => {
    if (favorites || page + 1 >= totalPages) return;
    setLoading(true);
    const res = await fetchRestaurants({ page: page + 1, size: 10 });
    setData(res);
    setLoading(false);
  };

  if (loading) return <p className="empty">불러오는 중...</p>;
  if (error) return <p className="empty">{error}</p>;
  if (list.length === 0) return <p className="empty">레스토랑이 없습니다.</p>;

  return (
    <section>
      <div className="favorites">
        {list.map((r) => (
          <article
            key={r.id}
            className="favorite-card"
            onClick={() => navigate(`/restaurants/${r.id}`)}
          >
            {/* public 이미지 사용 */}
            <img src="/sushi.jpg" alt={r.name} className="favorite-image" />

            <div className="favorite-body">
              <div className="favorite-name">{r.name}</div>
              <div className="favorite-meta">{r.address}</div>
              <div className="favorite-meta">{r.description}</div>
              <div className="favorite-meta">
                최대 예약 인원: {r.maxPeoplePerReservation}명
              </div>
            </div>
          </article>
        ))}
      </div>

      {!favorites && (
        <div className="pagination">
          <button disabled={page <= 0} onClick={goPrev}>
            이전
          </button>
          <span>
            {page + 1} / {totalPages}
          </span>
          <button disabled={page + 1 >= totalPages} onClick={goNext}>
            다음
          </button>
        </div>
      )}
    </section>
  );
}
