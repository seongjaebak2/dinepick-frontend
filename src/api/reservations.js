import { http } from "./api";

// 예약 생성 API
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
