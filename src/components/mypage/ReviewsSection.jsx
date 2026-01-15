// src/components/mypage/ReviewsSection.jsx
import "./ReviewsSection.css";

/*
  ReviewsSection
  - 리뷰 목록 표시
  - props가 없을 때도 안전하게 렌더
*/
export default function ReviewsSection({ reviews }) {
  const list = Array.isArray(reviews) ? reviews : [];

  // rating 방어용 clamp
  const clampRating = (value) => {
    const n = Number(value);
    if (!Number.isFinite(n)) return 0;
    return Math.max(0, Math.min(5, Math.floor(n)));
  };

  // 리뷰가 없을 때 빈 상태 UI
  if (list.length === 0) {
    return (
      <section className="reviews">
        <header className="reviews-header">
          <h2 className="reviews-title">내 리뷰</h2>
          <p className="reviews-sub">작성한 리뷰가 없습니다.</p>
        </header>

        <div className="empty">리뷰가 없습니다.</div>
      </section>
    );
  }

  return (
    <section className="reviews">
      {/* 리뷰 섹션 헤더 */}
      <header className="reviews-header">
        <h2 className="reviews-title">내 리뷰</h2>
        <p className="reviews-sub">최근 작성한 리뷰를 확인하세요.</p>
      </header>

      {/* 리뷰 리스트 */}
      <div className="reviews-list">
        {list.map((r, idx) => {
          const rating = clampRating(r?.rating);

          const restaurantName =
            r?.restaurantName ??
            r?.restaurant?.name ??
            r?.restaurant ??
            "레스토랑";

          const dateText = r?.date ?? r?.createdAt ?? "";

          return (
            <article
              key={r?.id ?? `${restaurantName}-${dateText}-${idx}`}
              className="review-card"
            >
              {/* 상단: 식당명 / 평점 */}
              <div className="review-top">
                <div className="review-restaurant">{restaurantName}</div>
                <div className="review-rating" aria-label={`평점 ${rating}점`}>
                  {"★".repeat(rating)}
                  {"☆".repeat(5 - rating)}
                </div>
              </div>

              {/* 작성일: 값 있을 때만 */}
              {dateText ? <div className="review-date">{dateText}</div> : null}

              {/* 리뷰 내용 */}
              {r?.content ? (
                <p className="review-content">{r.content}</p>
              ) : (
                <p className="review-content muted">리뷰 내용이 없습니다.</p>
              )}
            </article>
          );
        })}
      </div>
    </section>
  );
}
