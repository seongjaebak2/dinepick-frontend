import Header from "./Header";
import Footer from "./Footer";
import "./Layout.css";

/*
  Layout
  - Shared page wrapper
  - Includes header and footer
*/
const Layout = ({ children }) => {
  return (
    <div className="app-shell">
      <Header />

      <main className="app-main">{children}</main>

      <Footer />
    </div>
  );
};

export default Layout;
