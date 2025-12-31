import { Link, useNavigate } from "react-router-dom";
import "./Layout.css";
import { useAuth } from "../../contexts/AuthContext";

/*
  Header
  - Global navigation bar
*/
const Header = ({ children }) => {
  const { user, isAuthenticated, logout } = useAuth();
  const navigate = useNavigate();

  const onLogout = () => {
    logout();
    navigate("/login");
  };
  return (
    <header className="header">
      <div className="container header-inner">
        <h2>
          <Link to="/" className="logo" aria-label="Go to home">
            DINE PICK
          </Link>
        </h2>
        <nav className="nav">
          {isAuthenticated ? (
            <>
              <Link to="/restaurants" className="nav-link">
                레스토랑
              </Link>
              <span>
                {user?.name ? `${user.name} (${user.role})` : "로그인됨"}
              </span>
              <Link to="/me" className="nav-link">
                마이페이지
              </Link>
              <button onClick={onLogout}>로그아웃</button>
            </>
          ) : (
            <>
              <Link to="/restaurants" className="nav-link">
                레스토랑
              </Link>
              <Link to="/login">로그인</Link>
              <Link to="/signup">회원가입</Link>
            </>
          )}
        </nav>
        <main style={{ padding: 16 }}>{children}</main>
      </div>
    </header>
  );
};

export default Header;
