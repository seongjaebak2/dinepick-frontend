import { http } from "./api";

// 예약 생성 API
// POST /api/reservations
export async function createReservation({
  restaurantId,
  reservationDate,
  reservationTime,
  peopleCount,
}) {
  const res = await http.post("/api/reservations", {
    restaurantId,
    reservationDate,
    reservationTime,
    peopleCount,
  });

  return res.data;
}

// 예약 취소 API
// DELETE /api/reservations/{reservationId}
export async function cancelReservation(reservationId) {
  try {
    const res = await http.delete(`/api/reservations/${reservationId}`);
    return res.data;
  } catch (err) {
    console.error("[cancelReservation] failed", {
      url: err?.config?.url,
      status: err?.response?.status,
      data: err?.response?.data,
    });
    throw err;
  }
}

// 내 예약 목록 조회 API
// GET /api/reservations/my
export async function fetchMyReservations({ page = 0, size = 10 } = {}) {
  const res = await http.get("/api/reservations/my", {
    params: { page, size },
  });
  return res.data;
}

// 예약 가능 여부 조회
// GET /api/reservations/availability
export async function checkReservationAvailability({
  restaurantId,
  date,
  time,
  peopleCount,
}) {
  const res = await http.get("/api/reservations/availability", {
    params: {
      restaurantId,
      date,
      time,
      peopleCount,
    },
  });
  return res.data; // { available: boolean, message: string }
}

// 예약 수정 API
// PUT /api/reservations/{reservationId}
export async function updateReservation(
  reservationId,
  { reservationDate, reservationTime, peopleCount }
) {
  const res = await http.put(`/api/reservations/${reservationId}`, {
    reservationDate,
    reservationTime,
    peopleCount,
  });
  return res.data;
}
