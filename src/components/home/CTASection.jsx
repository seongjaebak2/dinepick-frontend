import "./CTASection.css";

/*
  CTASection
  - Encourages user action
*/
const CTASection = () => {
  return (
    <section className="cta-section">
      <div className="container cta-box">
        <h2>Ready to Make a Reservation?</h2>

        <div className="cta-actions">
          <button className="primary-button">Sign Up</button>
          <button className="secondary-button">Browse Restaurants</button>
        </div>
      </div>
    </section>
  );
};

export default CTASection;
