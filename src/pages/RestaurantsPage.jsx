import { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import Layout from "../components/layout/Layout";
import FilterBar from "../components/restaurants/FilterBar";
import RestaurantGrid from "../components/restaurants/RestaurantGrid";
import Pagination from "../components/restaurants/Pagination";
import { fetchRestaurants } from "../api/restaurants";

const PAGE_SIZE = 6;

const RestaurantsPage = () => {
  const [searchParams] = useSearchParams();
  const keyword = searchParams.get("region") ?? "";

  const [page, setPage] = useState(0);
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    setLoading(true);
    fetchRestaurants({
      keyword,
      page,
      size: PAGE_SIZE,
    })
      .then(setData)
      .finally(() => setLoading(false));
  }, [keyword, page]);

  const items = data?.content ?? [];
  const totalPages = data?.totalPages ?? 1;
  const totalElements = data?.totalElements ?? 0;

  return (
    <Layout>
      <div className="container" style={{ padding: "22px 0" }}>
        <h1 style={{ margin: "0 0 6px", letterSpacing: "-0.3px" }}>
          {keyword ? `"${keyword}" 검색 결과` : "Restaurants"}
        </h1>
        <p style={{ margin: 0, color: "#6b7280", fontSize: 14 }}>
          {totalElements} results found
        </p>

        {/* FilterBar는 UI만 유지 (정렬/카테고리는 나중에 API 확장) */}
        <FilterBar
          region={keyword}
          selectedCategory="All"
          sortOption="recommended"
          onCategoryChange={() => {}}
          onSortChange={() => {}}
        />

        {loading ? (
          <div style={{ padding: 20 }}>불러오는 중...</div>
        ) : (
          <RestaurantGrid items={items} />
        )}

        <Pagination
          currentPage={page + 1} // UI는 1부터
          totalPages={totalPages}
          onChange={({ nextPage }) => setPage(nextPage - 1)}
        />
      </div>
    </Layout>
  );
};

export default RestaurantsPage;
