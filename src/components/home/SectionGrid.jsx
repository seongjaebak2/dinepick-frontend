import "./SectionGrid.css";

const SAMPLE_ITEMS = [
  {
    title: "Restaurant Name",
    description: "Short description of the restaurant.",
    imageUrl: "https://images.unsplash.com/photo-1540189549336-e6e99c3679fe",
  },
  {
    title: "Restaurant Name",
    description: "Short description of the restaurant.",
    imageUrl: "https://images.unsplash.com/photo-1528826194825-8d3b4ee31c06",
  },
  {
    title: "Restaurant Name",
    description: "Short description of the restaurant.",
    imageUrl: "https://images.unsplash.com/photo-1541971875076-8f970d573be6",
  },
];

/*
  SectionGrid
  - Reusable card grid section
*/
const SectionGrid = ({ title }) => {
  return (
    <section className="section-grid">
      <div className="container">
        <h2 className="section-title">{title}</h2>

        <div className="grid">
          {SAMPLE_ITEMS.map(({ title, description, imageUrl }, index) => (
            <article key={index} className="card">
              <img src={imageUrl} alt={title} />
              <div className="card-body">
                <h3 className="card-title">{title}</h3>
                <p className="card-description">{description}</p>
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
};

export default SectionGrid;
