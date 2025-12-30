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
            레스토랑
          </a>
          <a href="#" className="nav-link">
            마이페이지
          </a>
          <button className="nav-button">내정보</button>
        </nav>
      </div>
    </header>
  );
};

export default Header;
