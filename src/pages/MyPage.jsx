import { useEffect, useMemo, useState } from "react";
import Layout from "../components/layout/Layout";
import ProfileBanner from "../components/mypage/ProfileBanner";
import StatsCards from "../components/mypage/StatsCards";
import MyPageTabs from "../components/mypage/MyPageTabs";
import ReservationsSection from "../components/mypage/ReservationsSection";
import FavoritesSection from "../components/mypage/FavoritesSection";
import ReviewsSection from "../components/mypage/ReviewsSection";
import { useAuth } from "../contexts/AuthContext";
import { cancelReservation, fetchMyReservations } from "../api/reservations";
import { toast } from "react-toastify";
import "./MyPage.css";
import { updateReservation } from "../api/reservations";
import EditModal from "../components/common/EditModal";

function toCard(item) {
  return {
    id: item.reservationId,
    title: item.restaurantName,
    date: item.reservationDate,
    time: String(item.reservationTime).slice(0, 5), // "18:00"
    people: item.peopleCount,
    status: "", // 아래에서 예정/지난 채움
    imageUrl: null, // 응답에 없으니 placeholder
    createdAt: item.createdAt,
  };
}

// 날짜 + 시간 기준 오름차순 정렬
function sortByDateTimeAsc(list = []) {
  return [...list].sort((a, b) => {
    const aDt = new Date(`${a.date}T${a.time}`);
    const bDt = new Date(`${b.date}T${b.time}`);
    return aDt - bDt;
  });
}

// 날짜 + 시간 기준 내림차순 정렬
function sortByDateTimeDesc(list = []) {
  return [...list].sort((a, b) => {
    const aDt = new Date(`${a.date}T${a.time}`);
    const bDt = new Date(`${b.date}T${b.time}`);
    return bDt - aDt;
  });
}

function isPast(dateStr, timeStr) {
  if (!dateStr || !timeStr) return false;
  const t = timeStr.length === 5 ? `${timeStr}:00` : timeStr; // "18:00" -> "18:00:00"
  const dt = new Date(`${dateStr}T${t}`);
  if (Number.isNaN(dt.getTime())) return false;
  return dt.getTime() < Date.now();
}

const MyPage = () => {
  const { user } = useAuth();

  // 탭 상태
  const [activeTab, setActiveTab] = useState("reservations");

  // 내 예약 페이지 응답
  const [page, setPage] = useState(0);
  const [size] = useState(10);
  const [cancelLoadingId, setCancelLoadingId] = useState(null);
  const [resPage, setResPage] = useState(null);
  const [loadingReservations, setLoadingReservations] = useState(false);

  const loadMyReservations = async () => {
    setLoadingReservations(true);
    try {
      const data = await fetchMyReservations({ page, size });
      setResPage(data);
    } catch (err) {
      const status = err?.response?.status;
      if (status === 401) toast.error("로그인이 필요합니다.");
      else toast.error("예약 내역을 불러오지 못했습니다.");
    } finally {
      setLoadingReservations(false);
    }
  };

  // 예약 취소 핸들러
  const handleCancelReservation = async (r) => {
    if (!r?.id) return;

    const ok = window.confirm("예약을 취소할까요?");
    if (!ok) return;

    setCancelLoadingId(r.id);
    try {
      await cancelReservation(r.id);
      toast.success("예약이 취소되었습니다.");
      await loadMyReservations();
    } catch (err) {
      const status = err?.response?.status;
      if (status === 401) toast.error("로그인이 필요합니다.");
      else if (status === 403)
        toast.error("본인 예약 또는 관리자만 취소할 수 있습니다.");
      else if (status === 404) toast.error("예약을 찾을 수 없습니다.");
      else toast.error("예약 취소 실패");
    } finally {
      setCancelLoadingId(null);
    }
  };
  // 탭이 예약 탭일 때만 불러오게 (불필요한 호출 방지)
  useEffect(() => {
    if (activeTab !== "reservations") return;
    loadMyReservations();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeTab, page, size]);

  const { upcomingReservations, pastReservations } = useMemo(() => {
    const content = resPage?.content ?? [];
    const mapped = content.map(toCard);

    const upcoming = [];
    const past = [];

    for (const r of mapped) {
      if (isPast(r.date, r.time)) past.push({ ...r, status: "지난 예약" });
      else upcoming.push({ ...r, status: "예정 예약" });
    }

    return {
      upcomingReservations: sortByDateTimeAsc(upcoming),
      pastReservations: sortByDateTimeDesc(past),
    };
  }, [resPage]);

  // StatsCards 임시: 서버 연동 전까지 안전한 값
  const stats = useMemo(() => {
    const total = resPage?.totalElements ?? 0;
    return {
      reservations: total,
      favorites: 0,
      reviews: 0,
    };
  }, [resPage]);

  // favorites/reviews는 아직 연동 전이면 빈 배열로 안전하게
  const favorites = useMemo(() => [], []);
  const reviews = useMemo(() => [], []);

  // 예약 수정 상태 관리 및 핸들러
  const [editOpen, setEditOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [editLoadingId, setEditLoadingId] = useState(null);

  const handleOpenEdit = (r) => {
    setEditing(r);
    setEditOpen(true);
  };

  const handleCloseEdit = () => {
    if (editLoadingId) return;
    setEditOpen(false);
    setEditing(null);
  };

  const handleSubmitEdit = async (payload) => {
    if (!editing?.id) return;

    setEditLoadingId(editing.id);
    try {
      await updateReservation(editing.id, payload);

      toast.success("예약이 수정되었습니다.");
      setEditOpen(false);
      setEditing(null);

      await loadMyReservations(); // 수정 후 목록 갱신
    } catch (err) {
      const status = err?.response?.status;
      const msg = err?.response?.data?.message;

      if (status === 401) toast.error("로그인이 필요합니다.");
      else if (status === 403)
        toast.error("본인 예약 또는 관리자만 수정할 수 있습니다.");
      else if (status === 404) toast.error("예약을 찾을 수 없습니다.");
      else toast.error(msg || "예약 수정에 실패했습니다.");
    } finally {
      setEditLoadingId(null);
    }
  };
  return (
    <Layout>
      <div className="container mypage">
        <ProfileBanner user={user ?? { name: "게스트", email: "" }} />

        <StatsCards stats={stats} />

        <MyPageTabs activeTab={activeTab} onChangeTab={setActiveTab} />

        {activeTab === "reservations" && (
          <>
            {loadingReservations && (
              <div style={{ padding: 12 }}>예약 내역 로딩중...</div>
            )}

            <ReservationsSection
              upcomingReservations={upcomingReservations}
              pastReservations={pastReservations}
              onCancel={handleCancelReservation}
              cancelLoadingId={cancelLoadingId}
              onEdit={handleOpenEdit}
              editLoadingId={editLoadingId}
            />
            <EditModal
              open={editOpen}
              initial={editing}
              maxPeople={6} // 식당 maxPeoplePerReservation을 예약 데이터에 붙여서 넘기면 더 정확
              loading={!!editLoadingId}
              onClose={handleCloseEdit}
              onSubmit={handleSubmitEdit}
            />

            {/* 간단 페이지네이션 */}
            {resPage && (
              <nav className="pager-minimal" aria-label="예약 페이지네이션">
                <button
                  className="pager-btn"
                  disabled={resPage.first}
                  onClick={() => setPage((p) => Math.max(0, p - 1))}
                >
                  이전
                </button>

                <span className="pager-text">
                  {resPage.number + 1} / {Math.max(resPage.totalPages, 1)}
                </span>

                <button
                  className="pager-btn"
                  disabled={resPage.last}
                  onClick={() => setPage((p) => p + 1)}
                >
                  다음
                </button>
              </nav>
            )}
          </>
        )}

        {activeTab === "favorites" && (
          <FavoritesSection favorites={favorites} />
        )}

        {activeTab === "reviews" && <ReviewsSection reviews={reviews} />}
      </div>
    </Layout>
  );
};

export default MyPage;
