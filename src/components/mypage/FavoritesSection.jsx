// src/components/mypage/FavoritesSection.jsx
import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { fetchRestaurants } from "../../api/restaurants";
import "./FavoritesSection.css";

/*
  FavoritesSection
  - 찜(또는 레스토랑 목록) 카드 표시
  - favorites prop이 없으면 API로 목록 조회 + 페이지네이션
*/
export default function FavoritesSection({ favorites }) {
  const navigate = useNavigate();

  const [data, setData] = useState({
    content: Array.isArray(favorites) ? favorites : [],
    totalPages: 1,
    number: 0,
  });

  // page는 data.number에 의존하지 말고 별도 상태로 관리
  const [page, setPage] = useState(0);

  const [loading, setLoading] = useState(!Array.isArray(favorites));
  const [error, setError] = useState("");

  const totalPages = data?.totalPages ?? 1;

  const list = useMemo(() => {
    const c = data?.content;
    return Array.isArray(c) ? c : [];
  }, [data]);

  // favorites가 들어오면(또는 변경되면) data 동기화
  useEffect(() => {
    if (!Array.isArray(favorites)) return;
    setData((prev) => ({
      ...prev,
      content: favorites,
      totalPages: 1,
      number: 0,
    }));
    setPage(0);
    setLoading(false);
    setError("");
  }, [favorites]);

  // API 호출 로직을 한 곳으로 통일
  const load = async (targetPage) => {
    try {
      setLoading(true);
      setError("");
      const res = await fetchRestaurants({ page: targetPage, size: 10 });
      setData(res);
    } catch (e) {
      console.error(e);
      setError("레스토랑 목록을 불러오지 못했습니다.");
    } finally {
      setLoading(false);
    }
  };

  // favorites가 없을 때만 페이지 바뀌면 로드
  useEffect(() => {
    if (Array.isArray(favorites)) return;
    load(page);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [favorites, page]);

  const goPrev = () => {
    if (Array.isArray(favorites)) return;
    setPage((p) => Math.max(0, p - 1));
  };

  const goNext = () => {
    if (Array.isArray(favorites)) return;
    setPage((p) => Math.min(totalPages - 1, p + 1));
  };

  if (loading) return <p className="empty">불러오는 중...</p>;
  if (error) return <p className="empty">{error}</p>;
  if (list.length === 0)
    return (
      <p className="empty">
        {favorites ? "찜한 레스토랑이 없습니다." : "레스토랑이 없습니다."}
      </p>
    );

  return (
    <section>
      <div className="favorites">
        {list.map((r) => {
          const fallbackImage = "/sushi.jpg";
          const image =
            (Array.isArray(r?.imageUrls) && r.imageUrls[0]) ||
            r?.imageUrl ||
            fallbackImage;

          return (
            <article
              key={r.id}
              className="favorite-card"
              role="button"
              tabIndex={0}
              onClick={() => navigate(`/restaurants/${r.id}`)}
              onKeyDown={(e) => {
                if (e.key === "Enter") navigate(`/restaurants/${r.id}`);
              }}
              aria-label={`${r?.name ?? "레스토랑"} 상세로 이동`}
            >
              <img
                src={image}
                alt={r?.name ? `${r.name} 대표 사진` : "레스토랑 대표 사진"}
                className="favorite-image"
                loading="lazy"
                onError={(e) => {
                  e.currentTarget.onerror = null;
                  e.currentTarget.src = fallbackImage;
                }}
              />

              <div className="favorite-body">
                <div className="favorite-name">{r?.name ?? "레스토랑"}</div>

                {r?.address ? (
                  <div className="favorite-meta">{r.address}</div>
                ) : null}

                {r?.description ? (
                  <div className="favorite-meta">{r.description}</div>
                ) : null}

                {typeof r?.maxPeoplePerReservation === "number" ? (
                  <div className="favorite-meta">
                    최대 예약 인원: {r.maxPeoplePerReservation}명
                  </div>
                ) : null}
              </div>
            </article>
          );
        })}
      </div>

      {/* favorites prop이 없을 때만 페이지네이션 */}
      {!Array.isArray(favorites) && (
        <div className="pagination">
          <button type="button" disabled={page <= 0} onClick={goPrev}>
            이전
          </button>
          <span>
            {page + 1} / {totalPages}
          </span>
          <button
            type="button"
            disabled={page + 1 >= totalPages}
            onClick={goNext}
          >
            다음
          </button>
        </div>
      )}
    </section>
  );
}
