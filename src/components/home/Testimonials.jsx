import { useEffect, useState } from "react";
import "./Testimonials.css";
import { fetchRestaurants } from "../../api/restaurants";

/*
  Testimonials
  - User feedback section (API 연동)
*/
const Testimonials = () => {
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    setLoading(true);

    // 식당 일부만 가져와서 리뷰 추출
    fetchRestaurants({ page: 0, size: 5 })
      .then((data) => {
        const extractedReviews = [];

        data.content.forEach((restaurant) => {
          if (restaurant.reviews && restaurant.reviews.length > 0) {
            restaurant.reviews.forEach((review) => {
              extractedReviews.push({
                message: review.content,
                author: review.author,
                restaurantName: restaurant.name,
              });
            });
          }
        });

        setReviews(extractedReviews.slice(0, 6)); // 홈에는 최대 6개
      })
      .finally(() => setLoading(false));
  }, []);

  return (
    <section className="testimonials">
      <div className="container">
        <h2>유저 리뷰</h2>

        {loading && <p className="loading">리뷰를 불러오는 중...</p>}

        {!loading && reviews.length === 0 && (
          <p className="empty">아직 등록된 리뷰가 없습니다.</p>
        )}

        <div className="testimonial-grid">
          {reviews.map(({ message, author, restaurantName }, index) => (
            <div key={index} className="testimonial-card">
              <p>"{message}"</p>
              <span>
                - {author} · {restaurantName}
              </span>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Testimonials;
