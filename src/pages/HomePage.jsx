import Layout from "../components/layout/Layout";
import Hero from "../components/home/Hero";
import CategoryChips from "../components/home/CategoryChips";
import SectionGrid from "../components/home/SectionGrid";
import Testimonials from "../components/home/Testimonials";

/*
  HomePage
  - Page-level component
  - Responsible only for layout composition
*/
const HomePage = () => {
  return (
    <Layout>
      {/* Hero section */}
      <Hero />

      {/* Category filter section */}
      <CategoryChips />

      {/* Reusable content sections */}
      <SectionGrid title="추천 식당" />

      {/* Testimonials section */}
      <Testimonials />
    </Layout>
  );
};

export default HomePage;
