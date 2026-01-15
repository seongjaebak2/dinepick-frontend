import { Link, useNavigate } from "react-router-dom";
import "./Layout.css";
import { useAuth } from "../../contexts/AuthContext";

const Header = ({ children }) => {
  const { user, isAuthenticated, logout } = useAuth();
  const navigate = useNavigate();

  const onLogout = async () => {
    await logout();
    navigate("/");
  };

  return (
    <>
      <header className="header">
        <div className="container header-inner">
          <h2 style={{ margin: 0 }}>
            <Link to="/" className="logo" aria-label="Go to home">
              DINE PICK
            </Link>
          </h2>

          <nav className="nav">
            <Link to="/restaurants" className="nav-link">
              레스토랑
            </Link>

            {isAuthenticated ? (
              <>
                <span className="nav-user">
                  {user?.name ? `${user.name} 님` : "로그인됨"}
                </span>

                <Link to="/me" className="nav-link">
                  마이페이지
                </Link>

                <button className="nav-link nav-logout" onClick={onLogout}>
                  로그아웃
                </button>
              </>
            ) : (
              <>
                <Link to="/login" className="nav-link">
                  로그인
                </Link>
                <Link to="/signup" className="nav-button">
                  회원가입
                </Link>
              </>
            )}
          </nav>
        </div>
      </header>

      <main className="app-main">{children}</main>
    </>
  );
};

export default Header;
