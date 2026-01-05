import { useState } from "react";
import "./DetailReservationPanel.css";

/*
  DetailReservationPanel
  - Sticky reservation form
*/
const DetailReservationPanel = ({ restaurant }) => {
  if (!restaurant) return null;

  const {
    name = "",
    maxPeoplePerReservation = 6, // 백엔드에 있음
  } = restaurant;

  const [reservationDate, setReservationDate] = useState("");
  const [reservationTime, setReservationTime] = useState("11:30");
  const [reservationPeople, setReservationPeople] = useState("1");

  const handleReserve = () => {
    // Placeholder for API integration later
    // eslint-disable-next-line no-alert
    alert(
      `Reservation request
- Restaurant: ${name || "(unknown)"}
- Date: ${reservationDate || "(not selected)"}
- Time: ${reservationTime}
- People: ${reservationPeople}`
    );
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
          onChange={(e) => setReservationDate(e.target.value)}
        />
      </label>

      <label className="detail-field">
        <span className="detail-field-label">시간</span>
        <select
          className="detail-select"
          value={reservationTime}
          onChange={(e) => setReservationTime(e.target.value)}
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
      >
        예약 문의하기
      </button>

      <p className="detail-reservation-note">
        예약 확정은 레스토랑 확인 후 진행됩니다.
      </p>
    </div>
  );
};

export default DetailReservationPanel;
