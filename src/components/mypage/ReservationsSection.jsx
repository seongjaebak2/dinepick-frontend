// src/components/mypage/ReservationsSection.jsx
import "./ReservationsSection.css";

/*
  ReservationsSection
  - 예약 내역(예정 / 지난) 표시
  - props 없어도 안전하게 렌더
*/
export default function ReservationsSection(props) {
  // 예정 / 지난 예약 배열 (없으면 빈 배열)
  const upcomingReservations = Array.isArray(props?.upcomingReservations)
    ? props.upcomingReservations
    : [];
  const pastReservations = Array.isArray(props?.pastReservations)
    ? props.pastReservations
    : [];

  const hasUpcoming = upcomingReservations.length > 0;
  const hasPast = pastReservations.length > 0;

  // 예약 카드 컴포넌트
  const ReservationCard = ({ r }) => (
    <article className="reservation-card">
      {/* 예약 이미지 (없으면 placeholder) */}
      {r?.imageUrl ? (
        <img className="reservation-image" src={r.imageUrl} alt={r.title} />
      ) : (
        <div className="reservation-image placeholder" />
      )}

      <div className="reservation-body">
        {/* 식당명 */}
        <div className="reservation-title">{r?.title ?? "예약"}</div>

        {/* 예약 정보 */}
        <div className="reservation-meta">
          {(r?.date ?? "-") +
            " · " +
            (r?.time ?? "-") +
            " · " +
            (r?.people ?? 0) +
            "명"}
        </div>

        {/* 예약 상태 */}
        <div className="reservation-status">{r?.status ?? ""}</div>
      </div>
    </article>
  );

  // 예약이 하나도 없을 때
  if (!hasUpcoming && !hasPast) {
    return (
      <section className="reservations">
        <header className="reservations-header">
          <h2 className="reservations-title">예약 내역</h2>
          <p className="reservations-sub">예정/지난 예약이 없습니다.</p>
        </header>

        <div className="empty">예약 내역이 없습니다.</div>
      </section>
    );
  }

  return (
    <section className="reservations">
      {/* 섹션 헤더 */}
      <header className="reservations-header">
        <h2 className="reservations-title">예약 내역</h2>
        <p className="reservations-sub">예정 예약과 지난 예약을 확인하세요.</p>
      </header>

      {/* 예정 예약 영역 */}
      <div className="reservations-block">
        <h3 className="reservations-block-title">예정 예약</h3>

        {hasUpcoming ? (
          <div className="reservations-grid">
            {upcomingReservations.map((r) => (
              <ReservationCard key={r.id ?? `${r.title}-${r.date}`} r={r} />
            ))}
          </div>
        ) : (
          <div className="empty">예정된 예약이 없습니다.</div>
        )}
      </div>

      {/* 지난 예약 영역 */}
      <div className="reservations-block">
        <h3 className="reservations-block-title">지난 예약</h3>

        {hasPast ? (
          <div className="reservations-grid">
            {pastReservations.map((r) => (
              <ReservationCard key={r.id ?? `${r.title}-${r.date}`} r={r} />
            ))}
          </div>
        ) : (
          <div className="empty">지난 예약이 없습니다.</div>
        )}
      </div>
    </section>
  );
}
