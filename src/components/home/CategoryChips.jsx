import "./CategoryChips.css";

const CATEGORIES = [
  "전체",
  "한식",
  "중식",
  "일식",
  "양식",
  "이탈리안",
  "카페",
  "바",
];

/*
  CategoryChips
  - Restaurant category filter UI
*/
const CategoryChips = () => {
  return (
    <section className="category-chips">
      <div className="container chips-container">
        {CATEGORIES.map((category, index) => (
          <button
            key={category}
            className={`chip ${index === 0 ? "active" : ""}`}
          >
            {category}
          </button>
        ))}
      </div>
    </section>
  );
};

export default CategoryChips;
