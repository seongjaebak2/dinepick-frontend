import "./CategoryChips.css";

const CATEGORY_OPTIONS = [
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
  FilterBar
  - Category chips + sort select
*/
const FilterBar = ({
  region,
  selectedCategory,
  sortOption,
  onCategoryChange,
  onSortChange,
}) => {
  return (
    <div className="filter-bar">
      <div className="filter-chips">
        {CATEGORY_OPTIONS.map((category) => (
          <button
            key={category}
            type="button"
            className={`filter-chip ${
              selectedCategory === category ? "active" : ""
            }`}
            onClick={() => onCategoryChange({ category })}
          >
            {category}
          </button>
        ))}
      </div>
    </div>
  );
};

export default FilterBar;
