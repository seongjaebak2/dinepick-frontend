import "./Layout.css";

/*
  Footer
  - Global footer area
*/
const Footer = () => {
  return (
    <footer className="footer">
      <div className="container footer-inner">
        <div className="footer-brand">
          <strong>DINE PICK</strong>
          <p>© {new Date().getFullYear()} DINE PICK</p>
        </div>

        <div className="footer-links">
          <FooterColumn
            title="Company"
            items={["About", "Careers", "Contact"]}
          />
          <FooterColumn
            title="Service"
            items={["Reservation", "Reviews", "Favorites"]}
          />
          <FooterColumn title="Policy" items={["Terms", "Privacy", "Refund"]} />
        </div>
      </div>
    </footer>
  );
};

const FooterColumn = ({ title, items }) => {
  return (
    <div className="footer-column">
      <h4>{title}</h4>
      <ul>
        {items.map((item) => (
          <li key={item}>{item}</li>
        ))}
      </ul>
    </div>
  );
};

export default Footer;
