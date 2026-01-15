import "./ReservationsSection.css";

/*
  예약 섹션
  - 다가오는 예약/지난 예약을 월별로 묶어서 표시
*/

// YYYY-MM 키 만들기
function monthKey(dateStr) {
  if (!dateStr) return "unknown";
  return String(dateStr).slice(0, 7); // "2026-01-20" -> "2026-01"
}

// "2026-01" -> "2026년 1월"
function monthLabel(key) {
  if (!key || key === "unknown") return "기타";
  const [y, m] = key.split("-");
  return `${y}년 ${Number(m)}월`;
}

// 월별 그룹핑
function groupByMonth(list) {
  const map = new Map();
  for (const r of list) {
    const key = monthKey(r?.date);
    if (!map.has(key)) map.set(key, []);
    map.get(key).push(r);
  }
  return map;
}

export default function ReservationsSection(props) {
  const upcomingReservations = Array.isArray(props?.upcomingReservations)
    ? props.upcomingReservations
    : [];
  const pastReservations = Array.isArray(props?.pastReservations)
    ? props.pastReservations
    : [];

  const onCancel =
    typeof props?.onCancel === "function" ? props.onCancel : null;
  const cancelLoadingId = props?.cancelLoadingId ?? null;

  const onEdit = typeof props?.onEdit === "function" ? props.onEdit : null;
  const editLoadingId = props?.editLoadingId ?? null;

  const hasUpcoming = upcomingReservations.length > 0;
  const hasPast = pastReservations.length > 0;

  const fallbackImage = "/sushi.jpg";

  const ReservationCard = ({ r, showActions }) => (
    <article
      className={`reservation-card ${
        r?.status === "지난 예약" ? "reservation-past" : ""
      }`}
    >
      {r?.imageUrl ? (
        <img
          className="reservation-image"
          src={r.imageUrl}
          alt={r?.title ? `${r.title} 예약 이미지` : "예약 이미지"}
          loading="lazy"
          onError={(e) => {
            e.currentTarget.onerror = null;
            e.currentTarget.src = fallbackImage;
          }}
        />
      ) : (
        <div className="reservation-image placeholder" aria-hidden="true" />
      )}

      <div className="reservation-content">
        <div className="reservation-body">
          <div className="reservation-title">{r?.title ?? "예약"}</div>

          <div className="reservation-meta">
            {(r?.date ?? "-") +
              " · " +
              (r?.time ?? "-") +
              " · " +
              (r?.people ?? 0) +
              "명"}
          </div>

          <div className="reservation-status">{r?.status ?? ""}</div>
        </div>

        {showActions && (onEdit || onCancel) && (
          <div className="reservation-action">
            {onEdit && (
              <button
                type="button"
                className="reservation-edit-btn"
                onClick={(e) => {
                  e.stopPropagation();
                  onEdit(r);
                }}
                disabled={editLoadingId === r?.id || cancelLoadingId === r?.id}
              >
                {editLoadingId === r?.id ? "수정 중..." : "예약 수정"}
              </button>
            )}

            {onCancel && (
              <button
                type="button"
                className="reservation-cancel-btn"
                onClick={(e) => {
                  e.stopPropagation();
                  onCancel(r);
                }}
                disabled={cancelLoadingId === r?.id || editLoadingId === r?.id}
              >
                {cancelLoadingId === r?.id ? "취소 중..." : "예약 취소"}
              </button>
            )}
          </div>
        )}
      </div>
    </article>
  );

  //  월별 그룹 렌더 + 정렬 방향 옵션
  const renderMonthlyGroups = (list, showActions, order = "asc") => {
    const grouped = groupByMonth(list);

    const keys = Array.from(grouped.keys()).sort((a, b) => {
      if (order === "desc") return b.localeCompare(a);
      return a.localeCompare(b);
    });

    return keys.map((key) => (
      <div key={key} className="month-group">
        <div className="month-header">{monthLabel(key)}</div>

        <div className="reservations-grid">
          {grouped.get(key).map((r) => (
            <ReservationCard
              key={
                r?.id ??
                `${r?.title ?? "reservation"}-${r?.date ?? ""}-${
                  r?.time ?? ""
                }-${r?.createdAt ?? ""}`
              }
              r={r}
              showActions={showActions}
            />
          ))}
        </div>
      </div>
    ));
  };

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
      <header className="reservations-header">
        <h2 className="reservations-title">예약 내역</h2>
        <p className="reservations-sub">
          다가오는 예약과 지난 예약을 확인하세요.
        </p>
      </header>

      <div className="reservations-block">
        <h3 className="reservations-block-title">다가오는 예약</h3>

        {hasUpcoming ? (
          renderMonthlyGroups(upcomingReservations, true, "asc")
        ) : (
          <div className="empty">예정된 예약이 없습니다.</div>
        )}
      </div>

      <div className="reservations-block">
        <h3 className="reservations-block-title">지난 예약</h3>

        {hasPast ? (
          renderMonthlyGroups(pastReservations, false, "desc")
        ) : (
          <div className="empty">지난 예약이 없습니다.</div>
        )}
      </div>
    </section>
  );
}
