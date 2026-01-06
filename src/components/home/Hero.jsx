import { useState } from "react";
import { useNavigate } from "react-router-dom";
import "./Hero.css";

const HERO_IMAGE =
  "https://images.unsplash.com/photo-1540189549336-e6e99c3679fe?auto=format&fit=crop&w=1400&q=80";

/*
  Hero
  - Main introduction section
  - Navigates to restaurants page with region query
*/
const Hero = () => {
  const navigate = useNavigate();
  const [region, setRegion] = useState("");

  const trimmedRegion = region.trim();
  const isDisabled = trimmedRegion.length === 0;

  const handleSubmit = (event) => {
    event.preventDefault();
    if (isDisabled) return;

    navigate(`/restaurants?region=${encodeURIComponent(trimmedRegion)}`);
  };

  return (
    <section className="hero">
      <div className="container">
        <div className="hero-content">
          <h1 className="hero-title">최고의 레스토랑을 예약하세요</h1>
          <p className="hero-subtitle">전국 최고의 맛집을 한눈에</p>

          <form className="hero-search" onSubmit={handleSubmit}>
            <input
              type="text"
              value={region}
              onChange={(e) => setRegion(e.target.value)}
              placeholder="지역을 입력하세요 (예: 부산, 서울)"
              aria-label="지역 검색"
              autoComplete="off"
              spellCheck={false}
            />
            <button type="submit" disabled={isDisabled}>
              검색
            </button>
          </form>
        </div>

        <div className="hero-image">
          <img src={HERO_IMAGE} alt="맛있는 음식 사진" loading="lazy" />
        </div>
      </div>
    </section>
  );
};

export default Hero;
