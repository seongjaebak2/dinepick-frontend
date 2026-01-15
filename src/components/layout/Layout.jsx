import Header from "./Header";
import Footer from "./Footer";
import "./Layout.css";
import CtaSection from "./CTASection";
import { useLocation } from "react-router-dom";

const Layout = ({ children }) => {
  const location = useLocation();

  // CTA 숨길 페이지들 (기능 추가하면서 변경될 수 있음)
  const hideCta =
    location.pathname.startsWith("/me") ||
    location.pathname.startsWith("/login") ||
    location.pathname.startsWith("/signup") ||
    location.pathname.startsWith("/restaurants");

  return (
    <div className="app-shell">
      <Header />

      <main className="app-main">{children}</main>

      {!hideCta && <CtaSection />}
      <Footer />
    </div>
  );
};

export default Layout;
