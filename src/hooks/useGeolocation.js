import { useEffect, useState } from "react";

export function useGeolocation(options = {}) {
  const [state, setState] = useState({
    loaded: false,
    coords: null,
    error: null,
  });

  useEffect(() => {
    if (!("geolocation" in navigator)) {
      setState({
        loaded: true,
        coords: null,
        error: new Error("Geolocation not supported"),
      });
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setState({
          loaded: true,
          coords: {
            lat: pos.coords.latitude,
            lng: pos.coords.longitude,
          },
          error: null,
        });
      },
      (err) => {
        console.log("GEO ERROR", err.code, err.message);
        setState({
          loaded: true,
          coords: null,
          error: err,
        });
      },
      {
        enableHighAccuracy: false, // 초기 타임아웃 방지
        timeout: 15000, // 타임아웃 15초
        maximumAge: 60000, // 1분 캐시 허용
        ...options, // 필요하면 컴포넌트에서 덮어쓰기 가능
      }
    );
  }, []);

  return state;
}
