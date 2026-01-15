import React, { useState } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { toast } from "react-toastify";
import { useAuth } from "../contexts/AuthContext";
import "./AuthPage.css"; // 공용 CSS (로그인/회원가입 같이 사용 추천)

const LoginPage = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const from = location.state?.from;

  // 로그인 후 원래 있던 페이지로 복귀 (없으면 홈)
  const redirectTo = from?.pathname
    ? `${from.pathname}${from.search || ""}${from.hash || ""}`
    : "/";

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);

    try {
      await login({ email, password });
      toast.success("성공적으로 로그인했습니다!");
      // 로그인 후 원래 있던 페이지로 복귀
      navigate(redirectTo, { replace: true });
    } catch (err) {
      console.error("LOGIN ERROR:", err?.response?.data || err);
      toast.error(err?.message || "로그인 실패 (이메일/비밀번호 확인)");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="auth-wrap">
      <div className="auth-card">
        <h2 className="auth-title">로그인</h2>

        <form onSubmit={handleSubmit} className="auth-form">
          <div className="auth-field">
            <label className="auth-label">이메일</label>
            <input
              className="auth-input"
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="example@mail.com"
              autoComplete="email"
            />
          </div>

          <div className="auth-field">
            <label className="auth-label">비밀번호</label>
            <input
              className="auth-input"
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              autoComplete="current-password"
            />
          </div>

          <button className="auth-btn" type="submit" disabled={submitting}>
            {submitting ? "로그인 중..." : "로그인하기"}
          </button>
        </form>

        <p className="auth-foot">
          계정이 없으신가요?{" "}
          <Link className="auth-link" to="/signup">
            회원가입
          </Link>
        </p>
      </div>
    </div>
  );
};

export default LoginPage;
