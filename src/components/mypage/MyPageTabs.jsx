// src/components/mypage/MyPageTabs.jsx
import "./MyPageTabs.css";

/*
  MyPageTabs
  - 탭 버튼 렌더링 (예약/찜/리뷰)
  - 접근성(role/tablist) + 키보드 이동 지원
*/
const TABS = [
  { key: "reservations", label: "예약 내역" },
  { key: "favorites", label: "찜한 레스토랑" },
  { key: "reviews", label: "내 리뷰" },
];

const DEFAULT_TAB = "reservations";

const MyPageTabs = ({ activeTab = DEFAULT_TAB, onChangeTab }) => {
  // activeTab 방어
  const safeTab = TABS.some((t) => t.key === activeTab)
    ? activeTab
    : DEFAULT_TAB;

  const currentIndex = TABS.findIndex((t) => t.key === safeTab);

  const handleChange = (key) => {
    if (typeof onChangeTab === "function") {
      onChangeTab(key);
    }
  };

  // 키보드 좌/우 이동
  const handleKeyDown = (e) => {
    if (e.key !== "ArrowLeft" && e.key !== "ArrowRight") return;

    e.preventDefault();

    const nextIndex =
      e.key === "ArrowRight"
        ? Math.min(TABS.length - 1, currentIndex + 1)
        : Math.max(0, currentIndex - 1);

    const nextTab = TABS[nextIndex]?.key;
    if (nextTab) handleChange(nextTab);
  };

  return (
    <nav
      className="tabs"
      role="tablist"
      aria-label="마이페이지 탭"
      onKeyDown={handleKeyDown}
    >
      {TABS.map((t) => {
        const isActive = safeTab === t.key;

        return (
          <button
            key={t.key}
            type="button"
            role="tab"
            className={`tab ${isActive ? "active" : ""}`}
            aria-selected={isActive}
            aria-current={isActive ? "page" : undefined}
            tabIndex={isActive ? 0 : -1}
            onClick={() => handleChange(t.key)}
          >
            {t.label}
          </button>
        );
      })}
    </nav>
  );
};

export default MyPageTabs;
