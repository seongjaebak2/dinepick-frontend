import Layout from "../components/layout/Layout";
import Hero from "../components/home/Hero";
import CategoryChips from "../components/home/CategoryChips";
import SectionGrid from "../components/home/SectionGrid";
import Testimonials from "../components/home/Testimonials";
import CTASection from "../components/home/CTASection";

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
      <SectionGrid title="Popular Restaurants" />
      <SectionGrid title="New Openings" />
      <SectionGrid title="Available Now" />

      {/* Testimonials section */}
      <Testimonials />

      {/* Call-to-action section */}
      <CTASection />
    </Layout>
  );
};

export default HomePage;
