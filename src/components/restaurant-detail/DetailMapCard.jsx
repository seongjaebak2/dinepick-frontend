import "./DetailMapCard.css";

/*
  DetailMapCard
  - Placeholder map section
*/
const DetailMapCard = ({ restaurant }) => {
  if (!restaurant) return null;

  const { name = "", address = "" } = restaurant;

  return (
    <article className="detail-card">
      <header className="detail-card-header">
        <h2 className="detail-card-title">위치</h2>
      </header>

      <div className="detail-map">
        <div className="detail-map-pin">📍</div>
        <div className="detail-map-text">
          <div className="detail-map-name">{name || " "}</div>
          <div className="detail-map-address">{address || " "}</div>
        </div>
      </div>

      <div className="detail-map-hint">
        Map integration (Kakao/Google) will be added later.
      </div>
    </article>
  );
};

export default DetailMapCard;
