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
  onCategoryChange = () => { },
  onSortChange = () => { },
  onKeywordSubmit = () => { },
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
          <div className="search-icon">
            <svg
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <circle cx="11" cy="11" r="8"></circle>
              <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
            </svg>
          </div>
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="식당명, 지역, 키워드 검색"
            aria-label="검색어 입력"
          />
          <button type="submit">{input.trim() ? "식당 검색" : "전체보기"}</button>
        </form>

        {/* 필터 요약 및 정렬 */}
        <div className="filter-controls">
          <div className="filter-summary">
            {keyword && (
              <div className="summary-item">
                <span className="summary-label">검색어</span>
                <span className="summary-tag">{keyword}</span>
              </div>
            )}
            <div className="summary-item">
              <span className="summary-label">카테고리</span>
              <span className="summary-tag">{valueToLabel(selectedCategory)}</span>
            </div>
          </div>

          <div className="sort-wrapper">
            <select
              className="filter-select"
              value={sortOption}
              onChange={(e) => onSortChange({ sort: e.target.value })}
              aria-label="Sort option"
            >
              <option value="recommended">추천순</option>
              <option value="distance">가까운순</option>
            </select>
          </div>
        </div>
      </div>

      {/* chips */}
      <div className="filter-chips">
        {CATEGORY_OPTIONS.map((opt) => (
          <button
            key={`${opt.label}-${opt.value}`}
            type="button"
            className={`filter-chip ${selectedCategory === opt.value ? "active" : ""
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
