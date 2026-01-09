import { useState, useEffect } from "react";
import "./FilterBar.css";

const CATEGORY_OPTIONS = [
  { label: "전체", value: "ALL" },
  { label: "한식", value: "KOREAN" },
  { label: "중식", value: "CHINESE" },
  { label: "일식", value: "JAPANESE" },
  { label: "양식", value: "WESTERN" },
  { label: "카페", value: "CAFE" },
  { label: "기타", value: "ETC" },
];

const valueToLabel = (val) =>
  CATEGORY_OPTIONS.find((o) => o.value === val)?.label ?? "전체";

const FilterBar = ({
  keyword = "",
  selectedCategory = "ALL",
  sortOption,
  onCategoryChange = () => {},
  onSortChange = () => {},
  onKeywordSubmit = () => {},
}) => {
  // 내부 입력값 (URL/부모 변경 시 동기화)
  const [input, setInput] = useState(keyword);

  useEffect(() => {
    setInput(keyword);
  }, [keyword]);

  const handleSubmit = (e) => {
    e.preventDefault();
    onKeywordSubmit(input.trim());
  };

  return (
    <div className="filter-bar">
      <div className="filter-header">
        {/* 검색창 */}
        <form className="filter-search" onSubmit={handleSubmit}>
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="식당명, 지역, 키워드 검색"
            aria-label="검색어 입력"
          />
          <button type="submit">{input.trim() ? "검색" : "전체보기"}</button>
        </form>

        {/* 필터 */}
        <div className="filter-top">
          <div>
            <div className="filter-title">Filters</div>
            <div className="filter-meta">
              <span>검색어:</span>
              <span className="filter-value">{keyword || "All"}</span>
            </div>
            <div className="filter-meta" style={{ marginTop: 4 }}>
              <span>Category:</span>
              <span className="filter-value">
                {valueToLabel(selectedCategory)}
              </span>
            </div>
          </div>

          {/* 정렬 */}
          <select
            className="filter-select"
            value={sortOption}
            onChange={(e) => onSortChange({ sort: e.target.value })}
            aria-label="Sort option"
          >
            <option value="recommended">Recommended</option>
            <option value="rating">Rating</option>
            <option value="name">Name</option>
          </select>
        </div>
      </div>

      {/* chips */}
      <div className="filter-chips">
        {CATEGORY_OPTIONS.map((opt) => (
          <button
            key={`${opt.label}-${opt.value}`}
            type="button"
            className={`filter-chip ${
              selectedCategory === opt.value ? "active" : ""
            }`}
            onClick={() => onCategoryChange({ category: opt.value })}
          >
            {opt.label}
          </button>
        ))}
      </div>
    </div>
  );
};

export default FilterBar;
