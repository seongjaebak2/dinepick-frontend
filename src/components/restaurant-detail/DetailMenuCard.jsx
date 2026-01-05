import "./DetailMenuCard.css";

/*
  DetailMenuCard
  - Main menu list
  - Uses placeholder until backend menu API is ready
*/
const DetailMenuCard = ({ restaurant }) => {
  if (!restaurant) return null;

  // 아직 백엔드에 없음
  const menuItems = restaurant.menuItems ?? [];

  return (
    <article className="detail-card">
      <header className="detail-card-header">
        <h2 className="detail-card-title">대표 메뉴</h2>
      </header>

      {menuItems.length === 0 ? (
        <p className="detail-empty">메뉴 정보가 없습니다.</p>
      ) : (
        <ul className="detail-menu">
          {menuItems.map(({ name = "", price = "" }, idx) => (
            <li key={`${name}-${idx}`} className="detail-menu-item">
              <span className="detail-menu-name">{name || " "}</span>
              <span className="detail-menu-price">{price || " "}</span>
            </li>
          ))}
        </ul>
      )}
    </article>
  );
};

export default DetailMenuCard;
