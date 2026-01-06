import { useEffect, useState } from "react";
import "./SectionGrid.css";
import { fetchRestaurants } from "../../api/restaurants";
import { useNavigate } from "react-router-dom";

const FALLBACK_IMG = "/sushi.jpg"; // public/sushi.jpg

const SectionGrid = ({ title, keyword = "", page = 0, size = 6 }) => {
  const navigate = useNavigate();
  const [items, setItems] = useState([]);
  const [pageInfo, setPageInfo] = useState({
    totalPages: 0,
    totalElements: 0,
    number: 0,
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    let alive = true;

    (async () => {
      try {
        setLoading(true);
        setError("");

        const data = await fetchRestaurants({ keyword, page, size });
        if (!alive) return;

        setItems(Array.isArray(data?.content) ? data.content : []);
        setPageInfo({
          totalPages: data?.totalPages ?? 0,
          totalElements: data?.totalElements ?? 0,
          number: data?.number ?? 0,
        });
      } catch (e) {
        console.error(e);
        if (!alive) return;
        setError("레스토랑을 불러오지 못했어요.");
        setItems([]);
      } finally {
        if (!alive) return;
        setLoading(false);
      }
    })();

    return () => {
      alive = false;
    };
  }, [keyword, page, size]);

  return (
    <section className="section-grid">
      <div className="container">
        <div className="section-head">
          <h2 className="section-title">{title}</h2>
          <p className="section-sub">
            총 {pageInfo.totalElements}개 · {pageInfo.number + 1}/
            {pageInfo.totalPages || 1} 페이지
          </p>
        </div>

        {loading && <p className="section-grid-state">불러오는 중...</p>}
        {!loading && error && <p className="section-grid-state">{error}</p>}
        {!loading && !error && items.length === 0 && (
          <p className="section-grid-state">표시할 레스토랑이 없습니다.</p>
        )}

        <div className="grid">
          {items.map((r) => (
            <article
              key={r.id}
              className="card"
              role="button"
              tabIndex={0}
              onClick={() => navigate(`/restaurants/${r.id}`)}
              onKeyDown={(e) => {
                if (e.key === "Enter" || e.key === " ")
                  navigate(`/restaurants/${r.id}`);
              }}
            >
              <img
                src={FALLBACK_IMG}
                alt={r.name}
                onError={(e) => (e.currentTarget.src = FALLBACK_IMG)}
              />
              <div className="card-body">
                <h3 className="card-title">{r.name}</h3>
                <p className="card-description">{r.description}</p>
                <p className="card-meta">
                  {r.address} · 최대 {r.maxPeoplePerReservation}명
                </p>
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
};

export default SectionGrid;
