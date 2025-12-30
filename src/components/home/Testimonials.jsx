import "./Testimonials.css";

const TESTIMONIALS = [
  { message: "Amazing service and great UI!", author: "User A" },
  { message: "Booking was fast and easy.", author: "User B" },
  { message: "Highly recommended restaurant platform.", author: "User C" },
];

/*
  Testimonials
  - User feedback section
*/
const Testimonials = () => {
  return (
    <section className="testimonials">
      <div className="container">
        <h2>User Reviews</h2>

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
