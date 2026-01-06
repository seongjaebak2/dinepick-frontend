import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";

export default function AuthRedirect({ children }) {
  const { isAuthenticated, loading } = useAuth();
  const location = useLocation();

  if (loading) return <div style={{ padding: 16 }}>로딩중...</div>;

  // 로그인 페이지로 올 때 state.from이 있으면 원래 있던 페이지로 복귀
  const from = location.state?.from;
  const redirectTo = from?.pathname
    ? `${from.pathname}${from.search || ""}${from.hash || ""}`
    : "/";

  return isAuthenticated ? <Navigate to={redirectTo} replace /> : children;
}
