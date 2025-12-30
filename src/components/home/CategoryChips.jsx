import "./CategoryChips.css";

const CATEGORIES = [
  "All",
  "Korean",
  "Chinese",
  "Japanese",
  "Western",
  "Italian",
  "Cafe",
  "Bar",
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
