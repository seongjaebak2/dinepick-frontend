// src/components/mypage/MyPageTabs.jsx
import "./MyPageTabs.css";

/*
  MyPageTabs
  - 탭 버튼 렌더링 (예약/찜/리뷰)
*/
const TABS = [
  { key: "reservations", label: "예약 내역" },
  { key: "favorites", label: "찜한 레스토랑" },
  { key: "reviews", label: "내 리뷰" },
];

const MyPageTabs = ({ activeTab = "reservations", onChangeTab }) => {
  // activeTab 방어(예상치 못한 값이면 기본 탭)
  const safeTab = TABS.some((t) => t.key === activeTab)
    ? activeTab
    : "reservations";

  return (
    <nav className="tabs" aria-label="마이페이지 탭">
      {TABS.map((t) => (
        <button
          key={t.key}
          type="button"
          className={`tab ${safeTab === t.key ? "active" : ""}`}
          onClick={() => onChangeTab?.(t.key)} // onChangeTab 없을 때도 안전
          aria-current={safeTab === t.key ? "page" : undefined}
        >
          {t.label}
        </button>
      ))}
    </nav>
  );
};

export default MyPageTabs;
