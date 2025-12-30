import "./Hero.css";

/*
  Hero
  - Main introduction section
*/
const Hero = () => {
  return (
    <section className="hero">
      <div className="container">
        <div className="hero-content">
          <h1 className="hero-title">
            Discover and Reserve the Best Restaurants
          </h1>

          <p className="hero-subtitle">
            Find top-rated restaurants and book instantly
          </p>

          <div className="hero-search">
            <input type="text" placeholder="Search by location or restaurant" />
            <button>Search</button>
          </div>
        </div>

        <div className="hero-image">
          <img
            src="https://images.unsplash.com/photo-1541544181074-e2df4c25d221"
            alt="Restaurant"
          />
        </div>
      </div>
    </section>
  );
};

export default Hero;
