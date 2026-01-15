import { useState } from "react";
import { useNavigate } from "react-router-dom";
import "./Hero.css";

const HERO_IMAGE =
  "https://images.unsplash.com/photo-1540189549336-e6e99c3679fe?auto=format&fit=crop&w=1400&q=80";

/*
  Hero
  - Main introduction section
  - Navigates to restaurants page with keyword query
*/
const Hero = () => {
  const navigate = useNavigate();
  const [keyword, setKeyword] = useState("");

  const trimmedKeyword = keyword.trim();
  const isDisabled = trimmedKeyword.length === 0;

  const handleSubmit = (event) => {
    event.preventDefault();
    if (isDisabled) return;

    navigate(`/restaurants?keyword=${encodeURIComponent(trimmedKeyword)}`);
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
              value={keyword}
              onChange={(e) => setKeyword(e.target.value)}
              placeholder="지역 또는 키워드를 입력하세요 (예: 부산, 스시)"
              aria-label="레스토랑 검색"
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
