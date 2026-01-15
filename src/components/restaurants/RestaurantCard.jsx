import { useNavigate } from "react-router-dom";
import "./RestaurantCard.css";

/*
  RestaurantCard
  - Single restaurant preview card
  - Navigates to detail page on click
*/
const RestaurantCard = ({ item }) => {
  const sushi = "/sushi.jpg";
  const navigate = useNavigate();

  // 백엔드에 없는 필드는 기본값으로 처리
  const {
    id,
    name = "",
    region = "",
    category = "",
    rating = null,
    priceRange = "",
    thumbnailUrl = "",
  } = item || {};

  // ✅ 썸네일 없으면 기본 이미지
  const imageSrc = thumbnailUrl || sushi;

  const handleOpenDetail = () => {
    if (!id) return;
    navigate(`/restaurants/${id}`);
  };

  return (
    <article
      className="restaurant-card"
      role="button"
      tabIndex={0}
      onClick={handleOpenDetail}
      onKeyDown={(e) => {
        if (e.key === "Enter") handleOpenDetail();
      }}
      aria-label={`Open ${name || "restaurant"} details`}
    >
      <div className="restaurant-image">
        {/* ✅ thumbnailUrl 없으면 sushi로 fallback */}
        {imageSrc ? (
          <img
            src={imageSrc}
            alt={name}
            loading="lazy"
            onError={(e) => {
              // 이미지 깨지면 fallback
              e.currentTarget.src = sushi;
            }}
          />
        ) : (
          <div className="restaurant-image-placeholder" />
        )}
      </div>

      <div className="restaurant-body">
        <div className="restaurant-name-row">
          <h3 className="restaurant-name">{name || " "}</h3>

          <div className="restaurant-rating-badge" aria-label="Rating badge">
            <span className="restaurant-rating-dot" />
            {/* 백엔드에 rating 없으면 빈칸 */}
            {typeof rating === "number" ? rating.toFixed(1) : ""}
          </div>
        </div>

        <div className="restaurant-meta">
          <span className="restaurant-pill">{region || " "}</span>

          {category && (
            <span className="restaurant-chip" aria-label="Category">
              {category}
            </span>
          )}

          <span className="restaurant-pill">{priceRange || " "}</span>
        </div>

        <div
          className="restaurant-actions"
          onClick={(e) => e.stopPropagation()}
        >
          <button type="button" className="restaurant-action">
            Details
          </button>
          <button type="button" className="restaurant-action primary">
            Reserve
          </button>
        </div>
      </div>
    </article>
  );
};

export default RestaurantCard;
