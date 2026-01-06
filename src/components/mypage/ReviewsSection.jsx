// src/components/mypage/ReviewsSection.jsx
import "./ReviewsSection.css";

/*
  ReviewsSection
  - 리뷰 목록 표시
  - props가 없을 때도 안전하게 렌더
*/
export default function ReviewsSection({ reviews = [] }) {
  // 리뷰가 없을 때 빈 상태 UI
  if (reviews.length === 0) {
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
        {reviews.map((r) => (
          <article key={r.id} className="review-card">
            {/* 상단: 식당명 / 평점 */}
            <div className="review-top">
              <div className="review-restaurant">{r.restaurant}</div>
              <div className="review-rating">
                {"★".repeat(r.rating)}
                {"☆".repeat(Math.max(0, 5 - r.rating))}
              </div>
            </div>

            {/* 작성일 */}
            <div className="review-date">{r.date}</div>

            {/* 리뷰 내용 */}
            <p className="review-content">{r.content}</p>
          </article>
        ))}
      </div>
    </section>
  );
}
