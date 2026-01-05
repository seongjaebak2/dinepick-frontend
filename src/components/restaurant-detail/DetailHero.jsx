import "./DetailHero.css";

/*
  DetailHero
  - Banner image with overlay title area
  - Uses only available backend fields (fallback for missing ones)
*/
const DetailHero = ({ restaurant }) => {
  if (!restaurant) return null;

  const {
    name = "",
    address = "",
    // 아직 백엔드에 없음
    category = "카테고리(백엔드에 없음)",
    rating = null,
    region = "지역(백엔드에 없음)",
    priceRange = "가격대(백엔드에 없음)",
    imageUrl = "",
  } = restaurant;

  const fallbackImage = "/sushi.jpg";

  return (
    <section className="detail-hero">
      <img
        className="detail-hero-image"
        src={imageUrl || fallbackImage}
        alt={name || "restaurant"}
      />

      <div className="detail-hero-overlay">
        <div className="detail-hero-top">
          <div className="detail-hero-title-group">
            <div className="detail-hero-category">{category || " "}</div>

            <h1 className="detail-hero-title">{name || " "}</h1>

            <div className="detail-hero-sub">
              <span>
                ⭐ {typeof rating === "number" ? rating.toFixed(1) : " "}
              </span>

              <span className="detail-hero-dot">•</span>

              <span>{region || address || " "}</span>

              <span className="detail-hero-dot">•</span>

              <span>{priceRange || " "}</span>
            </div>
          </div>

          <div className="detail-hero-actions">
            <button type="button" className="icon-button" aria-label="Like">
              ♡
            </button>
            <button type="button" className="icon-button" aria-label="Share">
              ↗
            </button>
          </div>
        </div>
      </div>
    </section>
  );
};

export default DetailHero;
