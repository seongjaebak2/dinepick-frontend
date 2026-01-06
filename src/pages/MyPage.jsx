// src/pages/MyPage.jsx
import { useState } from "react";
import Layout from "../components/layout/Layout";
import ProfileBanner from "../components/mypage/ProfileBanner";
import StatsCards from "../components/mypage/StatsCards";
import MyPageTabs from "../components/mypage/MyPageTabs";
import ReservationsSection from "../components/mypage/ReservationsSection";
import FavoritesSection from "../components/mypage/FavoritesSection";
import ReviewsSection from "../components/mypage/ReviewsSection";
import "./MyPage.css";

/*
  MyPage
  - 페이지 조립만 담당
*/
const MyPage = () => {
  // 현재 선택된 탭 상태
  const [activeTab, setActiveTab] = useState("reservations");

  return (
    <Layout>
      <div className="container mypage">
        {/* 프로필 영역 */}
        <ProfileBanner />

        {/* 요약 통계 카드 */}
        <StatsCards onSelect={setActiveTab} />

        {/* 탭 메뉴 */}
        <MyPageTabs activeTab={activeTab} onChangeTab={setActiveTab} />

        {/* 탭별 컨텐츠 */}
        {activeTab === "reservations" && <ReservationsSection />}
        {activeTab === "favorites" && <FavoritesSection />}
        {activeTab === "reviews" && <ReviewsSection />}
      </div>
    </Layout>
  );
};

export default MyPage;
