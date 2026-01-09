import { useEffect, useMemo, useState } from "react";
import { useParams } from "react-router-dom";
import Layout from "../components/layout/Layout";
import { fetchRestaurantById, fetchRestaurants } from "../api/restaurants";

import DetailHero from "../components/restaurant-detail/DetailHero";
import DetailInfoCard from "../components/restaurant-detail/DetailInfoCard";
import DetailMenuCard from "../components/restaurant-detail/DetailMenuCard";
import DetailMapCard from "../components/restaurant-detail/DetailMapCard";
import DetailReviewsCard from "../components/restaurant-detail/DetailReviewsCard";
import DetailReservationPanel from "../components/restaurant-detail/DetailReservationPanel";
import DetailRelatedSection from "../components/restaurant-detail/DetailRelatedSection";
import "./RestaurantDetailPage.css";

/*
  식당 상세 페이지
  - Container page that composes sections
*/
const RestaurantDetailPage = () => {
  const { id } = useParams();

  const [restaurant, setRestaurant] = useState(null);
  const [relatedItems, setRelatedItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);

  // 상세 불러오기
  useEffect(() => {
    let alive = true;
    setLoading(true);
    setNotFound(false);

    fetchRestaurantById(id)
      .then((data) => {
        if (!alive) return;
        setRestaurant(data);
      })
      .catch(() => {
        if (!alive) return;
        setNotFound(true);
        setRestaurant(null);
      })
      .finally(() => {
        if (!alive) return;
        setLoading(false);
      });

    return () => {
      alive = false;
    };
  }, [id]);

  // 관련 레스토랑(임시): 목록에서 3개만 가져와서 현재 id 제외
  useEffect(() => {
    let alive = true;

    fetchRestaurants({ page: 0, size: 6 })
      .then((pageData) => {
        if (!alive) return;
        const items = (pageData?.content ?? [])
          .filter((x) => String(x.id) !== String(id))
          .slice(0, 3);
        setRelatedItems(items);
      })
      .catch(() => {
        if (!alive) return;
        setRelatedItems([]);
      });

    return () => {
      alive = false;
    };
  }, [id]);

  // 로딩
  if (loading) {
    return (
      <Layout>
        <div className="container detail-container">
          <h2 className="detail-not-found-title">로딩중...</h2>
        </div>
      </Layout>
    );
  }

  // 없음(404/에러)
  if (notFound || !restaurant) {
    return (
      <Layout>
        <div className="container detail-container">
          <h2 className="detail-not-found-title">Restaurant not found</h2>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="container detail-container">
        <DetailHero restaurant={restaurant} />

        <section className="detail-grid">
          <div className="detail-left">
            <DetailInfoCard restaurant={restaurant} />
            <DetailMenuCard restaurant={restaurant} />
            <DetailMapCard restaurant={restaurant} />
            <DetailReviewsCard restaurant={restaurant} />
            <DetailRelatedSection items={relatedItems} />
          </div>

          <aside className="detail-right">
            <DetailReservationPanel restaurant={restaurant} />
          </aside>
        </section>
      </div>
    </Layout>
  );
};

export default RestaurantDetailPage;
