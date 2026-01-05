import "./DetailInfoCard.css";

/*
  DetailInfoCard
  - Restaurant info summary
  - Uses only available backend fields
*/
const DetailInfoCard = ({ restaurant }) => {
  if (!restaurant) return null;

  const {
    address = "",
    description = "",
    maxPeoplePerReservation = "",
    // 아직 백엔드에 없음
    openingHours = "###",
    phone = "###",
    priceRange = "###",
  } = restaurant;

  return (
    <article className="detail-card">
      <header className="detail-card-header">
        <h2 className="detail-card-title">레스토랑 정보</h2>
      </header>

      <div className="detail-info-list">
        <div className="detail-info-row">
          <span className="detail-info-label">영업시간</span>
          <span className="detail-info-value">{openingHours || " "}</span>
        </div>

        <div className="detail-info-row">
          <span className="detail-info-label">주소</span>
          <span className="detail-info-value">{address || " "}</span>
        </div>

        <div className="detail-info-row">
          <span className="detail-info-label">전화</span>
          <span className="detail-info-value">{phone || " "}</span>
        </div>

        <div className="detail-info-row">
          <span className="detail-info-label">가격대</span>
          <span className="detail-info-value">{priceRange || " "}</span>
        </div>

        <div className="detail-info-row">
          <span className="detail-info-label">최대 예약 인원</span>
          <span className="detail-info-value">
            {maxPeoplePerReservation ? `${maxPeoplePerReservation}명` : " "}
          </span>
        </div>
      </div>

      <p className="detail-description">{description || " "}</p>
    </article>
  );
};

export default DetailInfoCard;
