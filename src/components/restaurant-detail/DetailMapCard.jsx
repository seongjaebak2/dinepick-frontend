import { useEffect, useRef, useState } from "react";
import { loadKakaoMaps } from "../../utils/kakaoLoader";
import "./DetailMapCard.css";

/*
  DetailMapCard (Address-based)
  - Always geocode restaurant.address -> LatLng
  - Set map center + marker by geocoded result
  - Add "My Location" pulsing dot overlay (optional, if geolocation available)
*/
const DetailMapCard = ({ restaurant }) => {
  const mapContainerRef = useRef(null);
  const mapRef = useRef(null);
  const markerRef = useRef(null);

  // my location overlay refs
  const myLocOverlayRef = useRef(null);
  const injectedPulseCssRef = useRef(false);

  const [hint, setHint] = useState("");

  if (!restaurant) return null;

  const { name = "", address = "" } = restaurant;

  const ensurePulseCss = () => {
    if (injectedPulseCssRef.current) return;
    injectedPulseCssRef.current = true;

    // 이미 다른 컴포넌트에서 넣었을 수도 있으니 중복 방지
    if (document.querySelector('style[data-my-location-pulse="1"]')) return;

    const style = document.createElement("style");
    style.setAttribute("data-my-location-pulse", "1");
    style.textContent = `
      .my-loc {
        position: relative;
        width: 12px;
        height: 12px;
        border-radius: 999px;
        background: #1a73e8;
        box-shadow: 0 0 0 2px rgba(255,255,255,0.95);
      }
      .my-loc::after {
        content: "";
        position: absolute;
        left: 50%;
        top: 50%;
        width: 12px;
        height: 12px;
        transform: translate(-50%, -50%);
        border-radius: 999px;
        background: rgba(26,115,232,0.35);
        animation: myloc-pulse 1.6s ease-out infinite;
      }
      @keyframes myloc-pulse {
        0%   { transform: translate(-50%, -50%) scale(1); opacity: 0.85; }
        70%  { transform: translate(-50%, -50%) scale(3.6); opacity: 0.00; }
        100% { transform: translate(-50%, -50%) scale(3.6); opacity: 0.00; }
      }
    `;
    document.head.appendChild(style);
  };

  const clearMyLoc = () => {
    if (myLocOverlayRef.current) {
      myLocOverlayRef.current.setMap(null);
      myLocOverlayRef.current = null;
    }
  };

  const showMyLocPulse = (kakao, map, lat, lng) => {
    if (!kakao || !map) return;

    ensurePulseCss();

    const ll = new kakao.maps.LatLng(lat, lng);

    if (myLocOverlayRef.current) {
      myLocOverlayRef.current.setPosition(ll);
      myLocOverlayRef.current.setMap(map);
      return;
    }

    const el = document.createElement("div");
    el.className = "kakao-overlay my-loc-wrap"; // wrapper 클래스 추가

    const dot = document.createElement("div");
    dot.className = "my-loc";
    el.appendChild(dot);
    // 지도 클릭 이벤트로 전파 방지
    ["click", "mousedown", "mouseup", "touchstart", "touchend"].forEach(
      (evt) => {
        el.addEventListener(evt, (e) => e.stopPropagation());
      }
    );

    myLocOverlayRef.current = new kakao.maps.CustomOverlay({
      position: ll,
      content: el,
      xAnchor: 0.5,
      yAnchor: 0.5,
      zIndex: 10,
    });

    myLocOverlayRef.current.setMap(map);
  };

  useEffect(() => {
    let mounted = true;

    const init = async () => {
      setHint("");

      try {
        const kakao = await loadKakaoMaps();
        if (!mounted || !mapContainerRef.current) return;

        // 1) 지도 먼저 생성 (fallback center)
        const fallback = new kakao.maps.LatLng(37.5665, 126.978); // Seoul City Hall
        const map = new kakao.maps.Map(mapContainerRef.current, {
          center: fallback,
          level: 3,
        });
        mapRef.current = map;

        // 2) 레스토랑 마커 (fallback)
        const marker =
          markerRef.current || new kakao.maps.Marker({ position: fallback });
        marker.setMap(map);
        marker.setPosition(fallback);
        markerRef.current = marker;

        // 2.5) 내 위치 도트 표시 시도 (권한 거부면 그냥 무시)
        if (navigator.geolocation) {
          navigator.geolocation.getCurrentPosition(
            (pos) => {
              if (!mounted) return;
              showMyLocPulse(
                kakao,
                map,
                pos.coords.latitude,
                pos.coords.longitude
              );
            },
            () => {
              // 권한 거부/실패 시 조용히 무시
            },
            { enableHighAccuracy: true, timeout: 15000, maximumAge: 0 }
          );
        }

        // 3) 주소 없으면 안내 후 종료
        if (!address?.trim()) {
          setHint("주소 정보가 없어 기본 위치로 표시됩니다.");
          return;
        }

        // 4) 주소 -> 좌표 (Geocoder)
        // libraries=services 가 로더에 포함돼야 함
        const geocoder = new kakao.maps.services.Geocoder();

        geocoder.addressSearch(address, (result, status) => {
          if (!mounted) return;

          if (status !== kakao.maps.services.Status.OK || !result?.length) {
            setHint("주소를 찾을 수 없습니다. 기본 위치로 표시됩니다.");
            return;
          }

          const { x, y } = result[0]; // x: lng, y: lat
          const pos = new kakao.maps.LatLng(Number(y), Number(x));

          map.setCenter(pos);
          marker.setPosition(pos);

          // (선택) 인포윈도우
          if (name) {
            const iw = new kakao.maps.InfoWindow({
              content: `<div style="padding:6px 8px;font-size:12px;">${name}</div>`,
            });
            iw.open(map, marker);
          }
        });

        // 5) 렌더 타이밍 이슈 대비 relayout
        setTimeout(() => {
          if (!mounted) return;
          map.relayout();
          map.setCenter(map.getCenter());
        }, 0);
      } catch (e) {
        setHint(e?.message || "지도 초기화 실패");
      }
    };

    init();

    return () => {
      mounted = false;
      if (markerRef.current) markerRef.current.setMap(null);
      markerRef.current = null;
      mapRef.current = null;

      // my location overlay cleanup
      clearMyLoc();
    };
  }, [address, name]);

  return (
    <article className="detail-card">
      <header className="detail-card-header">
        <h2 className="detail-card-title">위치</h2>
      </header>

      {/* 지도 히어로 영역 */}
      <div className="detail-map-hero">
        <div ref={mapContainerRef} className="detail-map-hero-bg" />

        {/* 오버레이 카드 */}
        <div className="detail-map-hero-overlay">
          <div className="detail-map-text">
            <div className="detail-map-name">{name || " "}</div>
            <div className="detail-map-address">{address || " "}</div>
          </div>
        </div>
      </div>

      <div className="detail-map-hint">{hint}</div>
    </article>
  );
};

export default DetailMapCard;
