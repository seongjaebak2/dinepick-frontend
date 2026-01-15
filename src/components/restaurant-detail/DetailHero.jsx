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

    // ✅ 더미 기본값 제거 (없으면 그냥 숨기기)
    region = "",
    priceRange = "",

    // 상세 API는 imageUrls 사용
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

  // ✅ 메타 정보: 있는 값만 노출 (dot 자동 처리)
  const metaItems = [];

  if (typeof rating === "number") metaItems.push(`⭐ ${rating.toFixed(1)}`);
  if (region) metaItems.push(region);
  else if (address) metaItems.push(address);
  if (priceRange) metaItems.push(priceRange);

  return (
    <section className="detail-hero">
      <img
        className="detail-hero-image"
        src={heroImage}
        alt={name ? `${name} 대표 사진` : "레스토랑 대표 사진"}
        loading="lazy"
        onError={(e) => {
          // ✅ 무한 onError 방지
          e.currentTarget.onerror = null;
          e.currentTarget.src = fallbackImage;
        }}
      />

      <div className="detail-hero-overlay">
        <div className="detail-hero-top">
          <div className="detail-hero-title-group">
            {/* ✅ category 없으면 아예 숨김 (공백 " " 대신) */}
            {category ? (
              <div className="detail-hero-category">{category}</div>
            ) : null}

            {/* ✅ name 없으면 공백 대신 기본 텍스트 */}
            <h1 className="detail-hero-title">{name || "레스토랑"}</h1>

            {/* ✅ 메타가 있을 때만 렌더 */}
            {metaItems.length > 0 ? (
              <div className="detail-hero-sub">
                {metaItems.map((text, idx) => (
                  <span key={`${text}-${idx}`}>
                    {idx > 0 ? (
                      <span className="detail-hero-dot">•</span>
                    ) : null}
                    {text}
                  </span>
                ))}
              </div>
            ) : null}
          </div>

          <div className="detail-hero-actions">
            {/*  찜 기능은 “넘어간다” 했으니 우선 비활성화(원하면 삭제 가능) */}
            <button
              type="button"
              className="icon-button"
              aria-label="Like"
              disabled
              title="찜 기능은 준비 중이에요"
            >
              ♡
            </button>

            <button
              type="button"
              className="icon-button"
              aria-label="Share"
              disabled
              title="공유 기능은 준비 중이에요"
            >
              ↗
            </button>
          </div>
        </div>
      </div>
    </section>
  );
};

export default DetailHero;
