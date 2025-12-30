import "./Testimonials.css";

const TESTIMONIALS = [
  { message: "훌륭한 칭찬 한마디", author: "이름 A" },
  { message: "환상적인 피드백.", author: "이름 B" },
  { message: "진정으로 빛나는 리뷰.", author: "이름 C" },
];

/*
  Testimonials
  - User feedback section
*/
const Testimonials = () => {
  return (
    <section className="testimonials">
      <div className="container">
        <h2>유저 리뷰</h2>

        <div className="testimonial-grid">
          {TESTIMONIALS.map(({ message, author }, index) => (
            <div key={index} className="testimonial-card">
              <p>"{message}"</p>
              <span>- {author}</span>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Testimonials;
