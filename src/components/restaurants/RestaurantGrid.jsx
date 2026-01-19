import RestaurantCard from "./RestaurantCard";
import "./RestaurantGrid.css";

/*
  RestaurantGrid
  - Grid layout for restaurant cards
*/
const RestaurantGrid = ({ items }) => {
  if (items.length === 0) {
    return (
      <div className="restaurant-empty">
        <div className="restaurant-empty-title">검색 결과가 없습니다</div>
        <div className="restaurant-empty-desc">
          다른 키워드로 검색하거나 필터를 조절해 보세요.
        </div>
      </div>
    );
  }

  return (
    <section className="restaurant-grid">
      {items.map((item) => (
        <RestaurantCard key={item.id} item={item} />
      ))}
    </section>
  );
};

export default RestaurantGrid;
