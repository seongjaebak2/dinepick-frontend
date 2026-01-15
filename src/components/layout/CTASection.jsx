import { Link } from "react-router-dom";
import { useAuth } from "../../contexts/AuthContext";
import "./CtaSection.css";

export default function CtaSection() {
  const { isAuthenticated, user } = useAuth();

  const copy = isAuthenticated
    ? {
        title: `${user?.name ?? "회원"}님, 예약을 관리해보세요`,
        desc: "마이페이지에서 예약 내역을 한눈에 확인할 수 있어요.",
        cta: "마이페이지로 이동",
        to: "/me",
      }
    : {
        title: "예약을 더 빠르게, 더 편하게",
        desc: "회원가입 후 원하는 레스토랑을 바로 예약해보세요.",
        cta: "회원가입하고 시작하기",
        to: "/signup",
      };

  return (
    <section className="cta-wrap" aria-label="Call to action">
      <div className="cta-card">
        <div className="cta-text">
          <h3 className="cta-title">{copy.title}</h3>
          <p className="cta-desc">{copy.desc}</p>
        </div>

        <Link className="cta-btn" to={copy.to}>
          {copy.cta}
        </Link>
      </div>
    </section>
  );
}
