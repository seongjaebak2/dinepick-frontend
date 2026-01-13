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
    maxPeoplePerReservation = null,

    // 더미 기본값 제거
    openingHours = "",
    phone = "",
    priceRange = "",
  } = restaurant;

  const maxPeopleNum =
    maxPeoplePerReservation === null || maxPeoplePerReservation === undefined
      ? null
      : Number(maxPeoplePerReservation);

  // 값 있는 것만 렌더
  const rows = [
    { label: "영업시간", value: openingHours?.trim?.() ? openingHours : "" },
    { label: "주소", value: address?.trim?.() ? address : "" },
    { label: "전화", value: phone?.trim?.() ? phone : "" },
    { label: "가격대", value: priceRange?.trim?.() ? priceRange : "" },
    {
      label: "최대 예약 인원",
      value:
        Number.isFinite(maxPeopleNum) && maxPeopleNum > 0
          ? `${maxPeopleNum}명`
          : "",
    },
  ].filter((r) => Boolean(r.value));

  const hasDescription = Boolean(description?.trim?.());

  return (
    <article className="detail-card">
      <header className="detail-card-header">
        <h2 className="detail-card-title">레스토랑 정보</h2>
      </header>

      {rows.length > 0 ? (
        <div className="detail-info-list">
          {rows.map(({ label, value }) => (
            <div className="detail-info-row" key={label}>
              <span className="detail-info-label">{label}</span>
              <span className="detail-info-value">{value}</span>
            </div>
          ))}
        </div>
      ) : (
        <p className="detail-description" style={{ marginTop: 0 }}>
          제공된 레스토랑 정보가 아직 없어요.
        </p>
      )}

      {hasDescription ? (
        <p className="detail-description">{description}</p>
      ) : null}
    </article>
  );
};

export default DetailInfoCard;
