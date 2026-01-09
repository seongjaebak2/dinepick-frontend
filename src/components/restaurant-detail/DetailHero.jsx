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
    category = "",
    // 아직 백엔드에 없음
    rating = null,
    region = "지역(백엔드에 없음)",
    priceRange = "가격대(백엔드에 없음)",

    // 변경: 상세 API는 imageUrls 사용
    imageUrls = [],
    // (호환용) 혹시 예전 데이터가 imageUrl로 올 수도 있으니 남겨둠
    imageUrl = "",
  } = restaurant;

  const fallbackImage = "/sushi.jpg";

  // 대표 이미지: imageUrls[0] (썸네일) 우선, 없으면 imageUrl, 없으면 fallback
  const heroImage =
    (Array.isArray(imageUrls) && imageUrls.length > 0 ? imageUrls[0] : "") ||
    imageUrl ||
    fallbackImage;

  return (
    <section className="detail-hero">
      <img
        className="detail-hero-image"
        src={heroImage}
        alt={name || "restaurant"}
        loading="lazy"
        onError={(e) => {
          e.currentTarget.src = fallbackImage;
        }}
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
