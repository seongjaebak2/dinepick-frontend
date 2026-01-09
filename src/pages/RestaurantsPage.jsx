import { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import Layout from "../components/layout/Layout";
import FilterBar from "../components/restaurants/FilterBar";
import RestaurantGrid from "../components/restaurants/RestaurantGrid";
import Pagination from "../components/restaurants/Pagination";
import { fetchRestaurants } from "../api/restaurants";

const PAGE_SIZE = 6;

const RestaurantsPage = () => {
  const [searchParams, setSearchParams] = useSearchParams();

  const keyword = searchParams.get("keyword") ?? "";
  const category = searchParams.get("category") ?? "ALL";

  const [page, setPage] = useState(0);
  const [sortOption, setSortOption] = useState("recommended");

  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);

  // keyword/category 바뀌면 첫 페이지로
  useEffect(() => {
    setPage(0);
  }, [keyword, category]);

  useEffect(() => {
    setLoading(true);
    fetchRestaurants({
      keyword,
      category,
      page,
      size: PAGE_SIZE,
    })
      .then(setData)
      .finally(() => setLoading(false));
  }, [keyword, category, page]);

  // 검색어 submit: 빈값이면 전체보기
  const handleKeywordSubmit = (nextKeyword) => {
    const params = new URLSearchParams(searchParams);

    if (!nextKeyword) params.delete("keyword");
    else params.set("keyword", nextKeyword);

    setSearchParams(params);
  };

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

        <FilterBar
          keyword={keyword}
          selectedCategory={category}
          sortOption={sortOption}
          onCategoryChange={({ category: nextCategory }) => {
            const params = new URLSearchParams(searchParams);
            if (nextCategory === "ALL") params.delete("category");
            else params.set("category", nextCategory);
            setSearchParams(params);
          }}
          onSortChange={({ sort }) => setSortOption(sort)}
          onKeywordSubmit={handleKeywordSubmit}
        />

        {loading ? (
          <div style={{ padding: 20 }}>불러오는 중...</div>
        ) : (
          <RestaurantGrid items={items} />
        )}

        <Pagination
          currentPage={page + 1}
          totalPages={totalPages}
          onChange={({ nextPage }) => setPage(nextPage - 1)}
        />
      </div>
    </Layout>
  );
};

export default RestaurantsPage;
