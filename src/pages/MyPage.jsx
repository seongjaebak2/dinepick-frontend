import { useCallback, useEffect, useMemo, useState } from "react";
import Layout from "../components/layout/Layout";
import ProfileBanner from "../components/mypage/ProfileBanner";

import MyPageTabs from "../components/mypage/MyPageTabs";
import ReservationsSection from "../components/mypage/ReservationsSection";
import FavoritesSection from "../components/mypage/FavoritesSection";
import ReviewsSection from "../components/mypage/ReviewsSection";
import { useAuth } from "../contexts/AuthContext";
import {
  cancelReservation,
  fetchMyReservations,
  updateReservation,
} from "../api/reservations";
import { toast } from "react-toastify";
import "./MyPage.css";
import EditModal from "../components/common/EditModal";

function toCard(item) {
  return {
    id: item.reservationId,
    restaurantId: item.restaurantId, // ⭐ 이게 있어야 함
    title: item.restaurantName,
    date: item.reservationDate,
    time: String(item.reservationTime).slice(0, 5),
    people: item.peopleCount,
    status: "",
    imageUrl: null,
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
  const t = timeStr.length === 5 ? `${timeStr}:00` : timeStr;
  const dt = new Date(`${dateStr}T${t}`);
  if (Number.isNaN(dt.getTime())) return false;
  return dt.getTime() < Date.now();
}

const MyPage = () => {
  const { user } = useAuth();

  // 탭 상태
  const [activeTab, setActiveTab] = useState("reservations");

  // 예약 페이지 상태
  const [page, setPage] = useState(0);
  const size = 10;

  const [cancelLoadingId, setCancelLoadingId] = useState(null);
  const [resPage, setResPage] = useState(null);
  const [loadingReservations, setLoadingReservations] = useState(false);

  // ProfileBanner fallback user (객체 재생성 방지)
  const fallbackUser = useMemo(() => ({ name: "게스트", email: "" }), []);

  // API 로딩 함수 useCallback으로 고정 (eslint-disable 제거)
  const loadMyReservations = useCallback(async () => {
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
  }, [page, size]);

  // 탭이 예약 탭일 때만 호출
  useEffect(() => {
    if (activeTab !== "reservations") return;
    loadMyReservations();
  }, [activeTab, loadMyReservations]);

  // 예약 취소 핸들러
  const handleCancelReservation = useCallback(
    async (r) => {
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
    },
    [loadMyReservations]
  );

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

  // 아직 연동 전이면 favorites/reviews는 undefined로 두는게 낫다
  // - FavoritesSection이 favorites를 받으면 API 호출을 안 하도록 만들어졌기 때문
  const favorites = undefined;
  const reviews = [];

  // 예약 수정 상태
  const [editOpen, setEditOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [editLoadingId, setEditLoadingId] = useState(null);

  const handleOpenEdit = useCallback((r) => {
    setEditing(r);
    setEditOpen(true);
  }, []);

  const handleCloseEdit = useCallback(() => {
    if (editLoadingId) return;
    setEditOpen(false);
    setEditing(null);
  }, [editLoadingId]);

  const handleSubmitEdit = useCallback(
    async (payload) => {
      if (!editing?.id) return;

      setEditLoadingId(editing.id);
      try {
        await updateReservation(editing.id, payload);

        toast.success("예약이 수정되었습니다.");
        setEditOpen(false);
        setEditing(null);

        await loadMyReservations();
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
    },
    [editing, loadMyReservations]
  );

  const totalPages = Math.max(resPage?.totalPages ?? 1, 1);

  return (
    <Layout>
      <div className="container mypage">
        <ProfileBanner user={user ?? fallbackUser} />

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
              maxPeople={6}
              loading={!!editLoadingId}
              onClose={handleCloseEdit}
              onSubmit={handleSubmitEdit}
            />

            {resPage && (
              <nav className="pager-minimal" aria-label="예약 페이지네이션">
                <button
                  className="pager-btn"
                  disabled={resPage.first || page <= 0}
                  onClick={() => setPage((p) => Math.max(0, p - 1))}
                >
                  이전
                </button>

                <span className="pager-text">
                  {page + 1} / {totalPages}
                </span>

                <button
                  className="pager-btn"
                  disabled={resPage.last || page + 1 >= totalPages}
                  onClick={() =>
                    setPage((p) => Math.min(totalPages - 1, p + 1))
                  }
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
