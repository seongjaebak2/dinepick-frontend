import { useState } from "react";
import Layout from "../components/layout/Layout";
import Hero from "../components/home/Hero";
import CategoryChips from "../components/home/CategoryChips";
import SectionGrid from "../components/home/SectionGrid";
import Testimonials from "../components/home/Testimonials";
import NearMeMap from "../components/common/NearMeMap";

const HomePage = () => {
  const [homeCategory, setHomeCategory] = useState("ALL");

  return (
    <Layout>
      <Hero />

      <CategoryChips
        selectedCategory={homeCategory}
        onCategoryChange={({ category }) => setHomeCategory(category)}
      />
      <div className="section-header">
        <h2>추천 식당</h2>
      </div>

      <SectionGrid category={homeCategory} />
      <div className="section-header">
        <h3>내 주변 맛집</h3>
        <div className="section-subtitle">
          지금 위치 기준으로 주변 맛집을 찾아보세요
        </div>
      </div>
      <div className="container" style={{ padding: "0 0 22px" }}>
        <NearMeMap radiusKm={10} keyword="" category="ALL" height={420} />
      </div>
      <Testimonials />
    </Layout>
  );
};

export default HomePage;
