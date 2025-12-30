import "./CTASection.css";

/*
  CTASection
  - Encourages user action
*/
const CTASection = () => {
  return (
    <section className="cta-section">
      <div className="container cta-box">
        <h2>DINE PICK</h2>

        <div className="cta-actions">
          <button className="primary-button">로그인</button>
          <button className="secondary-button">회원가입</button>
        </div>
      </div>
    </section>
  );
};

export default CTASection;
