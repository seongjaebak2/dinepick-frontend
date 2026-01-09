import { useState } from "react";
import Layout from "../components/layout/Layout";
import Hero from "../components/home/Hero";
import CategoryChips from "../components/home/CategoryChips";
import SectionGrid from "../components/home/SectionGrid";
import Testimonials from "../components/home/Testimonials";

const HomePage = () => {
  const [homeCategory, setHomeCategory] = useState("ALL");

  return (
    <Layout>
      <Hero />

      <CategoryChips
        selectedCategory={homeCategory}
        onCategoryChange={({ category }) => setHomeCategory(category)}
      />

      <SectionGrid title="추천 식당" category={homeCategory} />

      <Testimonials />
    </Layout>
  );
};

export default HomePage;
