import { useNavigate } from "react-router-dom";
import "./RestaurantCard.css";

/*
  RestaurantCard
  - Single restaurant preview card
  - Navigates to detail page on click
*/
const RestaurantCard = ({ item }) => {
  const DEFAULT_RESTAURANT_IMG = "https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?auto=format&fit=crop&w=800&q=80";
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
    isExternal = false,
    placeUrl = "",
    address = "",
  } = item || {};

  // ✅ 썸네일 처리: 상대 경로인 경우 백엔드 주소(http://localhost:8080)를 붙여줌
  let imageSrc = thumbnailUrl || DEFAULT_RESTAURANT_IMG;
  if (thumbnailUrl && !thumbnailUrl.startsWith("http")) {
    imageSrc = `http://localhost:8080${thumbnailUrl}`;
  }

  const handleOpenDetail = () => {
    if (isExternal && placeUrl) {
      window.open(placeUrl, "_blank");
      return;
    }
    if (!id) return;
    navigate(`/restaurants/${id}`);
  };

  return (
    <article
      className={`restaurant-card ${isExternal ? "external-item" : ""}`}
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
              e.currentTarget.src = DEFAULT_RESTAURANT_IMG;
            }}
          />
        ) : (
          <div className="restaurant-image-placeholder" />
        )}
        {isExternal && <div className="external-badge">Kakao 검색</div>}
      </div>

      <div className="restaurant-body">
        <div className="restaurant-name-row">
          <h3 className="restaurant-name">{name || " "}</h3>

          {/* rating이 있을 때만 표시 */}
          {rating !== null && (
            <div className="restaurant-rating-badge" aria-label="Rating badge">
              <span className="restaurant-rating-dot" />
              {typeof rating === "number" ? rating.toFixed(1) : ""}
            </div>
          )}
        </div>

        <div className="restaurant-meta">
          {(region || address) && (
            <span className="restaurant-pill">{region || address}</span>
          )}

          {category && (
            <span className="restaurant-chip" aria-label="Category">
              {(() => {
                const map = {
                  KOREAN: "한식",
                  CHINESE: "중식",
                  JAPANESE: "일식",
                  WESTERN: "양식",
                  CAFE: "카페",
                  ETC: "기타",
                };
                return map[category] || category;
              })()}
            </span>
          )}

          {priceRange && (
            <span className="restaurant-pill">{priceRange}</span>
          )}
        </div>

        {item.description && (
          <p className="restaurant-description">{item.description}</p>
        )}

        <div
          className="restaurant-actions"
          onClick={(e) => e.stopPropagation()}
        >
          {isExternal ? (
            <button
              type="button"
              className="restaurant-action primary"
              onClick={() => window.open(placeUrl, "_blank")}
            >
              카카오맵 보기
            </button>
          ) : (
            <>
              <button
                type="button"
                className="restaurant-action"
                onClick={handleOpenDetail}
              >
                상세페이지
              </button>
              <button
                type="button"
                className="restaurant-action primary"
                onClick={handleOpenDetail}
              >
                예약하기
              </button>
            </>
          )}
        </div>
      </div>
    </article>
  );
};

export default RestaurantCard;
