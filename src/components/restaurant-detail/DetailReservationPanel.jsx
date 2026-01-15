import { useMemo, useState } from "react";
import { toast } from "react-toastify";
import { useAuth } from "../../contexts/AuthContext";
import {
  createReservation,
  checkReservationAvailability,
} from "../../api/reservations";
import ConfirmModal from "../common/ConfirmModal";
import "./DetailReservationPanel.css";
import { useNavigate, useLocation } from "react-router-dom";

/*
  예약 생성 폼
*/
const DetailReservationPanel = ({ restaurant }) => {
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  // restaurant props가 없으면 안전하게 렌더 중단
  if (!restaurant) return null;

  const {
    id: restaurantId,
    name = "",
    maxPeoplePerReservation = 6,
  } = restaurant;

  const [reservationDate, setReservationDate] = useState("");
  const [reservationTime, setReservationTime] = useState("11:30");
  const [reservationPeople, setReservationPeople] = useState("1");

  const [submitting, setSubmitting] = useState(false);

  // confirm modal 상태
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [confirmMessage, setConfirmMessage] = useState("");
  const [pendingPayload, setPendingPayload] = useState(null); // 확인 누르면 이걸로 예약 생성

  // 오늘 이전 날짜 선택 방지(UX)
  const minDate = useMemo(() => {
    const d = new Date();
    const yyyy = d.getFullYear();
    const mm = String(d.getMonth() + 1).padStart(2, "0");
    const dd = String(d.getDate()).padStart(2, "0");
    return `${yyyy}-${mm}-${dd}`;
  }, []);

  // 예약하기 버튼 클릭
  const handleReserve = async () => {
    if (!isAuthenticated) {
      // 로그인 후 다시 돌아오기 위해 현재 위치 저장
      navigate("/login", { state: { from: location } });
      toast.info("예약하려면 로그인이 필요합니다.");
      return;
    }

    if (!restaurantId) {
      toast.error("레스토랑 정보를 찾을 수 없습니다.");
      return;
    }

    if (!reservationDate) {
      toast.error("날짜를 선택해주세요.");
      return;
    }

    const peopleCount = Number(reservationPeople);
    if (!Number.isFinite(peopleCount) || peopleCount < 1) {
      toast.error("인원을 확인해주세요.");
      return;
    }

    // maxPeoplePerReservation도 한번 더 방어
    if (peopleCount > maxPeoplePerReservation) {
      toast.error(`최대 ${maxPeoplePerReservation}명까지 예약 가능합니다.`);
      return;
    }

    setSubmitting(true);
    try {
      // 1) 예약 가능 여부 먼저 체크 (availability)
      const availability = await checkReservationAvailability({
        restaurantId,
        date: reservationDate,
        time: reservationTime, // ✅ 초 빼고 그대로
        peopleCount,
      });

      // 2) 불가능하면 안내 후 종료
      if (!availability?.available) {
        toast.error(availability?.message || "예약이 불가능합니다.");
        return;
      }

      // 3) 가능하면 모달로 최종 확인
      const payload = {
        restaurantId,
        reservationDate,
        reservationTime, // ✅ 그대로
        peopleCount,
      };

      setPendingPayload(payload);

      setConfirmMessage(
        `${availability?.message || "예약 가능합니다."}\n\n` +
          `레스토랑: ${name || "레스토랑"}\n` +
          `날짜: ${reservationDate}\n` +
          `시간: ${reservationTime}\n` +
          `인원: ${peopleCount}명\n\n` +
          `이대로 예약을 진행할까요?`
      );

      setConfirmOpen(true);
    } catch (err) {
      const msg =
        err?.response?.data?.message ||
        err?.message ||
        "예약 가능 여부 확인에 실패했습니다.";
      toast.error(msg);
    } finally {
      setSubmitting(false);
    }
  };

  // 모달에서 "확인" 눌렀을 때 실제 예약 생성
  const handleConfirmReserve = async () => {
    if (!pendingPayload) return;

    setSubmitting(true);
    try {
      await createReservation(pendingPayload);
      toast.success(`${name || "레스토랑"} 예약 요청이 접수되었습니다!`);

      // UI 초기화
      setReservationDate("");
      // setReservationTime("11:30");
      // setReservationPeople("1");

      setConfirmOpen(false);
      setPendingPayload(null);
      setConfirmMessage("");
    } catch (err) {
      const msg =
        err?.response?.data?.message ||
        err?.message ||
        "예약 요청에 실패했습니다.";
      toast.error(msg);
    } finally {
      setSubmitting(false);
    }
  };

  const handleCloseModal = () => {
    if (submitting) return; // 처리중이면 닫기 방지(원하면 제거 가능)
    setConfirmOpen(false);
    setPendingPayload(null);
    setConfirmMessage("");
  };

  return (
    <div className="detail-reservation">
      <div className="detail-reservation-title">예약하기</div>

      <label className="detail-field">
        <span className="detail-field-label">날짜</span>
        <input
          className="detail-input"
          type="date"
          value={reservationDate}
          min={minDate}
          onChange={(e) => setReservationDate(e.target.value)}
          disabled={submitting}
        />
      </label>

      <label className="detail-field">
        <span className="detail-field-label">시간</span>
        <select
          className="detail-select"
          value={reservationTime}
          onChange={(e) => setReservationTime(e.target.value)}
          disabled={submitting}
        >
          {[
            "11:30",
            "12:00",
            "12:30",
            "13:00",
            "18:00",
            "18:30",
            "19:00",
            "19:30",
          ].map((time) => (
            <option key={time} value={time}>
              {time}
            </option>
          ))}
        </select>
      </label>

      <label className="detail-field">
        <span className="detail-field-label">인원</span>
        <select
          className="detail-select"
          value={reservationPeople}
          onChange={(e) => setReservationPeople(e.target.value)}
          disabled={submitting}
        >
          {Array.from({ length: maxPeoplePerReservation }, (_, i) => i + 1).map(
            (count) => (
              <option key={count} value={String(count)}>
                {count}명
              </option>
            )
          )}
        </select>
      </label>

      <button
        type="button"
        className="detail-primary-button"
        onClick={handleReserve}
        disabled={submitting}
      >
        {submitting ? "확인 중..." : "예약 문의하기"}
      </button>

      <p className="detail-reservation-note">
        예약 확정은 레스토랑 확인 후 진행됩니다.
      </p>

      {/* 예약 확인 모달 */}
      <ConfirmModal
        open={confirmOpen}
        title="예약 확인"
        message={confirmMessage}
        confirmText="예약 진행"
        cancelText="취소"
        loading={submitting}
        onConfirm={handleConfirmReserve}
        onClose={handleCloseModal}
      />
    </div>
  );
};

export default DetailReservationPanel;
