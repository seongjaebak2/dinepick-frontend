import "./Layout.css";

/*
  Header
  - Global navigation bar
*/
const Header = () => {
  return (
    <header className="header">
      <div className="container header-inner">
        <div className="logo">DINE PICK</div>

        <nav className="nav">
          <a href="#" className="nav-link">
            Restaurants
          </a>
          <a href="#" className="nav-link">
            My Page
          </a>
          <button className="nav-button">Reserve</button>
        </nav>
      </div>
    </header>
  );
};

export default Header;
