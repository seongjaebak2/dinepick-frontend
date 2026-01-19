import { useEffect, useMemo, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { loadKakaoMaps } from "../../utils/kakaoLoader";
import { useGeolocation } from "../../hooks/useGeolocation";
import { fetchNearbyRestaurants } from "../../api/restaurants";
import "./nearMeMap.css";

// fallback (원하면 변경)
const DEFAULT_POS = { lat: 35.1577583, lng: 129.0593167 }; // 서면역

function clampRadiusKm(v) {
  const n = Number(v);
  if (Number.isNaN(n)) return 10;
  return Math.min(Math.max(n, 0.1), 30);
}

async function mapWithConcurrency(items, mapper, concurrency = 5) {
  const results = new Array(items.length);
  let idx = 0;

  async function worker() {
    while (idx < items.length) {
      const cur = idx++;
      results[cur] = await mapper(items[cur], cur);
    }
  }

  const workers = Array.from(
    { length: Math.min(concurrency, items.length) },
    worker
  );
  await Promise.all(workers);
  return results;
}

export default function NearMeMap({
  radiusKm = 10,
  keyword = "",
  category = "ALL",
  page = 0,
  size = 30, // 리스트 없음 → 마커용으로 넉넉히
  height = 420,
  useFallbackWhenDenied = true,
}) {
  const navigate = useNavigate();
  const { loaded, coords, error } = useGeolocation();

  const [q, setQ] = useState("");

  const safeRadiusKm = useMemo(() => clampRadiusKm(radiusKm), [radiusKm]);

  const containerRef = useRef(null);

  const kakaoRef = useRef(null);
  const mapRef = useRef(null);
  const geocoderRef = useRef(null);

  const markersRef = useRef([]); // restaurant markers
  const overlayRef = useRef(null); // restaurant info overlay (single)

  // my location pulse overlay
  const myLocationOverlayRef = useRef(null);
  const injectedPulseCssRef = useRef(false);

  // address -> {lat,lng} cache
  const geoCacheRef = useRef(new Map());

  const [mapStatus, setMapStatus] = useState("idle"); // idle|loading|ready|error
  const [loadingData, setLoadingData] = useState(false);
  const [apiError, setApiError] = useState(null);

  const basePos = useMemo(() => {
    // 1순위: GPS 위치 (허용 시)
    if (coords) return coords;
    // 2순위: GPS 실패/거부 시 기본 위치 (서면역)
    if (loaded && !coords && useFallbackWhenDenied) return DEFAULT_POS;
    return null;
  }, [coords, loaded, useFallbackWhenDenied]);

  const ensurePulseCss = () => {
    if (injectedPulseCssRef.current) return;
    injectedPulseCssRef.current = true;

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

  const clearOverlay = () => {
    if (overlayRef.current) {
      overlayRef.current.setMap(null);
      overlayRef.current = null;
    }
  };

  const clearRestaurantMarkers = () => {
    clearOverlay();
    markersRef.current.forEach((m) => m.setMap(null));
    markersRef.current = [];
  };

  const setMyLocationPulse = (pos) => {
    const kakao = kakaoRef.current;
    const map = mapRef.current;
    if (!kakao || !map) return;

    ensurePulseCss();

    const ll = new kakao.maps.LatLng(pos.lat, pos.lng);

    // 있으면 위치만 갱신
    if (myLocationOverlayRef.current) {
      myLocationOverlayRef.current.setPosition(ll);
      myLocationOverlayRef.current.setMap(map);
      return;
    }

    const el = document.createElement("div");
    el.className = "my-loc";

    // 오버레이 내부 이벤트가 지도 이벤트로 전파되지 않도록
    ["click", "mousedown", "mouseup", "touchstart", "touchend"].forEach(
      (evt) => {
        el.addEventListener(evt, (e) => e.stopPropagation());
      }
    );

    myLocationOverlayRef.current = new kakao.maps.CustomOverlay({
      position: ll,
      content: el,
      xAnchor: 0.5,
      yAnchor: 0.5,
      zIndex: 10,
    });

    myLocationOverlayRef.current.setMap(map);
  };

  const geocodeAddress = (address) => {
    const kakao = kakaoRef.current;
    const geocoder = geocoderRef.current;
    if (!kakao || !geocoder) return Promise.resolve(null);

    const key = String(address || "").trim();
    if (!key) return Promise.resolve(null);

    const cached = geoCacheRef.current.get(key);
    if (cached) return Promise.resolve(cached);

    return new Promise((resolve) => {
      geocoder.addressSearch(key, (result, st) => {
        if (st !== kakao.maps.services.Status.OK || !result?.length) {
          resolve(null);
          return;
        }
        const { y, x } = result[0]; // y: lat, x: lng
        const coord = { lat: Number(y), lng: Number(x) };
        geoCacheRef.current.set(key, coord);
        resolve(coord);
      });
    });
  };

  const showRestaurantOverlay = (restaurant, positionLatLng) => {
    const kakao = kakaoRef.current;
    const map = mapRef.current;
    if (!kakao || !map) return;

    clearOverlay();

    // ====== wrapper ======
    const wrap = document.createElement("div");
    wrap.style.background = "white";
    wrap.style.border = "1px solid rgba(0,0,0,0.08)";
    wrap.style.borderRadius = "16px";
    wrap.style.boxShadow = "0 16px 40px rgba(0,0,0,0.16)";
    wrap.style.padding = "12px 12px 10px";
    wrap.style.minWidth = "260px";
    wrap.style.maxWidth = "320px";
    wrap.style.fontSize = "13px";
    wrap.style.lineHeight = "1.25";

    // ✅ 오버레이 내부 클릭이 지도 이벤트로 전파되지 않게 차단 + 클릭 시 중심 이동
    ["click", "mousedown", "mouseup", "touchstart", "touchend"].forEach(
      (evt) => {
        wrap.addEventListener(evt, (e) => {
          e.stopPropagation();
          if (evt === "click") {
            map.panTo(positionLatLng); // ✅ 말풍선 클릭 시 지도 중심 이동
          }
        });
      }
    );

    // ====== header row ======
    const header = document.createElement("div");
    header.style.display = "flex";
    header.style.alignItems = "flex-start";
    header.style.justifyContent = "space-between";
    header.style.gap = "10px";

    const left = document.createElement("div");
    left.style.flex = "1";
    left.style.minWidth = "0";

    const title = document.createElement("div");
    title.textContent = restaurant.name || "Restaurant";
    title.style.fontWeight = "900";
    title.style.fontSize = "14px";
    title.style.letterSpacing = "-0.2px";
    title.style.whiteSpace = "nowrap";
    title.style.overflow = "hidden";
    title.style.textOverflow = "ellipsis";

    const sub = document.createElement("div");
    sub.style.marginTop = "6px";
    sub.style.display = "flex";
    sub.style.flexWrap = "wrap";
    sub.style.gap = "6px";

    // ====== chips ======
    const makeChip = (text, variant = "neutral") => {
      const chip = document.createElement("span");
      chip.textContent = text;
      chip.style.display = "inline-flex";
      chip.style.alignItems = "center";
      chip.style.gap = "6px";
      chip.style.padding = "5px 8px";
      chip.style.borderRadius = "999px";
      chip.style.fontSize = "12px";
      chip.style.fontWeight = "700";
      chip.style.border = "1px solid rgba(0,0,0,0.08)";

      if (variant === "dark") {
        chip.style.background = "#111";
        chip.style.color = "white";
        chip.style.border = "1px solid #111";
      } else if (variant === "blue") {
        chip.style.background = "rgba(26,115,232,0.10)";
        chip.style.color = "#1a73e8";
      } else {
        chip.style.background = "rgba(0,0,0,0.04)";
        chip.style.color = "rgba(0,0,0,0.78)";
      }
      return chip;
    };

    const dist =
      restaurant.distance != null
        ? `${Number(restaurant.distance).toFixed(2)}km`
        : null;
    if (dist) sub.appendChild(makeChip(dist, "blue"));

    if (restaurant.category)
      sub.appendChild(makeChip(restaurant.category, "neutral"));

    left.appendChild(title);
    left.appendChild(sub);

    // ====== close button (X) ======
    const closeIcon = document.createElement("button");
    closeIcon.type = "button";
    closeIcon.setAttribute("aria-label", "닫기");
    closeIcon.textContent = "✕";
    closeIcon.style.width = "28px";
    closeIcon.style.height = "28px";
    closeIcon.style.borderRadius = "10px";
    closeIcon.style.border = "1px solid rgba(0,0,0,0.08)";
    closeIcon.style.background = "white";
    closeIcon.style.cursor = "pointer";
    closeIcon.style.fontSize = "14px";
    closeIcon.style.lineHeight = "1";
    closeIcon.style.opacity = "0.85";
    closeIcon.onclick = (e) => {
      e.stopPropagation();
      clearOverlay();
    };

    header.appendChild(left);
    header.appendChild(closeIcon);

    // ====== address row ======
    const addrRow = document.createElement("div");
    addrRow.style.marginTop = "10px";
    addrRow.style.display = "flex";
    addrRow.style.gap = "8px";
    addrRow.style.alignItems = "flex-start";
    addrRow.style.paddingTop = "10px";
    addrRow.style.borderTop = "1px solid rgba(0,0,0,0.06)";

    const pin = document.createElement("div");
    pin.textContent = "📍";
    pin.style.fontSize = "14px";
    pin.style.marginTop = "1px";

    const addr = document.createElement("div");
    addr.textContent = restaurant.address || "주소 정보 없음";
    addr.style.color = "rgba(0,0,0,0.72)";
    addr.style.fontSize = "12.5px";
    addr.style.wordBreak = "keep-all";
    addr.style.overflowWrap = "anywhere";

    addrRow.appendChild(pin);
    addrRow.appendChild(addr);

    // ====== CTA buttons ======
    const actions = document.createElement("div");
    actions.style.display = "flex";
    actions.style.gap = "8px";
    actions.style.marginTop = "12px";

    const detailBtn = document.createElement("button");
    detailBtn.type = "button";

    // 외부 데이터면 문구 및 동작 변경
    const isExternal = !!restaurant.isExternal;
    detailBtn.textContent = isExternal ? "카카오맵 결과" : "상세보기";

    // 외부 데이터면 노란색 테마
    if (isExternal) {
      detailBtn.style.background = "#fae100";
      detailBtn.style.color = "#3b1e1e";
      detailBtn.style.border = "1px solid #fae100";
    } else {
      detailBtn.style.background = "#111";
      detailBtn.style.color = "white";
      detailBtn.style.border = "1px solid #111";
    }

    detailBtn.style.flex = "1";
    detailBtn.style.padding = "10px 12px";
    detailBtn.style.borderRadius = "12px";
    detailBtn.style.cursor = "pointer";
    detailBtn.style.fontWeight = "800";
    detailBtn.style.letterSpacing = "-0.1px";
    detailBtn.onclick = (e) => {
      e.stopPropagation();
      clearOverlay();
      if (isExternal && restaurant.placeUrl) {
        window.open(restaurant.placeUrl, "_blank");
      } else {
        navigate(`/restaurants/${restaurant.id}`);
      }
    };

    const dismissBtn = document.createElement("button");
    dismissBtn.type = "button";
    dismissBtn.textContent = "닫기";
    dismissBtn.style.padding = "10px 12px";
    dismissBtn.style.borderRadius = "12px";
    dismissBtn.style.border = "1px solid rgba(0,0,0,0.08)";
    dismissBtn.style.background = "white";
    dismissBtn.style.cursor = "pointer";
    dismissBtn.style.fontWeight = "800";
    dismissBtn.onclick = (e) => {
      e.stopPropagation();
      clearOverlay();
    };

    actions.appendChild(detailBtn);
    actions.appendChild(dismissBtn);

    // ====== compose ======
    wrap.appendChild(header);
    wrap.appendChild(addrRow);
    wrap.appendChild(actions);

    overlayRef.current = new kakao.maps.CustomOverlay({
      position: positionLatLng,
      content: wrap,
      yAnchor: 1.18,
      zIndex: 20,
    });

    overlayRef.current.setMap(map);
  };

  // 1) 지도 초기화 (최초 1회)
  useEffect(() => {
    let cancelled = false;

    (async () => {
      try {
        setMapStatus("loading");
        const kakao = await loadKakaoMaps();
        if (cancelled) return;

        kakaoRef.current = kakao;

        if (!mapRef.current && containerRef.current) {
          const center = new kakao.maps.LatLng(
            DEFAULT_POS.lat,
            DEFAULT_POS.lng
          );
          mapRef.current = new kakao.maps.Map(containerRef.current, {
            center,
            level: 4,
          });

          // ✅ 지도 클릭 시 오버레이 닫기
          kakao.maps.event.addListener(mapRef.current, "click", () => {
            clearOverlay();
          });

          // ✅ 지도 드래그 시작 시 오버레이 닫기
          kakao.maps.event.addListener(mapRef.current, "dragstart", () => {
            clearOverlay();
          });
        }

        if (!geocoderRef.current) {
          geocoderRef.current = new kakao.maps.services.Geocoder();
        }

        setMapStatus("ready");
      } catch (e) {
        console.error(e);
        setMapStatus("error");
      }
    })();

    return () => {
      cancelled = true;
    };
  }, []);

  // 2) 데이터 로드 + 마커 렌더
  useEffect(() => {
    const kakao = kakaoRef.current;
    const map = mapRef.current;

    if (!kakao || !map) return;
    if (mapStatus !== "ready") return;
    if (!loaded) return;
    if (!basePos) return;

    const run = async () => {
      try {
        setApiError(null);
        setLoadingData(true);

        clearRestaurantMarkers();

        // 내 위치(펄스)
        setMyLocationPulse(basePos);

        // 1. DB Search
        const pageResp = await fetchNearbyRestaurants({
          lat: basePos.lat,
          lng: basePos.lng,
          radiusKm: safeRadiusKm,
          keyword: keyword?.trim() || undefined,
          category,
          page,
          size,
        });

        const rawDb = pageResp?.content || [];

        // 2. Kakao Search (Hybrid)
        let rawKakao = [];
        // 키워드가 없으면 "맛집" 으로 검색
        // (단, category가 ALL이 아니면 카테고리명을 키워드로 쓸 수도 있음)
        try {
          const { searchKakaoPlaces } = await import("../../utils/kakaoPlaces");
          const searchKw = keyword?.trim() || (category === "ALL" ? "맛집" : category);
          rawKakao = await searchKakaoPlaces(searchKw, { lat: basePos.lat, lng: basePos.lng });
        } catch (err) {
          console.warn("Kakao search failed", err);
        }

        // DB Data: 주소 -> 좌표 변환 필요
        const candidatesDb = rawDb.filter((r) => {
          const a = String(r.address || "").trim();
          return a.length > 0;
        });

        const mappedDb = await mapWithConcurrency(
          candidatesDb,
          async (r) => {
            const coord = await geocodeAddress(r.address);
            if (!coord) return null;
            return { ...r, coord };
          },
          5
        );

        // Kakao Data: 이미 좌표(x,y)가 있으므로 coord 포맷만 맞춤
        const mappedKakao = rawKakao.map(k => ({
          ...k,
          coord: { lat: Number(k.y), lng: Number(k.x) }
        }));

        // Merge (DB 우선)
        const okItems = [...mappedDb.filter(Boolean), ...mappedKakao];

        const bounds = new kakao.maps.LatLngBounds();
        bounds.extend(new kakao.maps.LatLng(basePos.lat, basePos.lng));

        // ✅ 반경 원(Circle) 그리기
        const circle = new kakao.maps.Circle({
          center: new kakao.maps.LatLng(basePos.lat, basePos.lng),
          radius: safeRadiusKm * 1000, // m 단위
          strokeWeight: 1,
          strokeColor: '#00a0e9',
          strokeOpacity: 0.1,
          strokeStyle: 'solid',
          fillColor: '#00a0e9',
          fillOpacity: 0.05
        });
        circle.setMap(map);
        markersRef.current.push(circle);

        okItems.forEach((r) => {
          const pos = new kakao.maps.LatLng(r.coord.lat, r.coord.lng);
          bounds.extend(pos);

          // ✅ 마커 이미지 설정 (Kakao=노란별)
          let markerImage = null;
          if (r.isExternal) {
            const imageSrc = "https://t1.daumcdn.net/localimg/localimages/07/mapapidoc/markerStar.png";
            const imageSize = new kakao.maps.Size(24, 35);
            markerImage = new kakao.maps.MarkerImage(imageSrc, imageSize);
          }

          const marker = new kakao.maps.Marker({
            position: pos,
            image: markerImage
          });
          marker.setMap(map);

          kakao.maps.event.addListener(marker, "click", () => {
            map.panTo(pos);
            showRestaurantOverlay(r, pos);
          });

          markersRef.current.push(marker);
        });

        // 🎯 [Centering Strategy]
        // 1. 키워드가 있으면 결과 마커들을 모두 보여주는 범위로 (setBounds)
        // 2. 키워드 없이 '내 주변' 모드면 내 위치 중심 + 적절한 줌 레벨 (setCenter)
        if (keyword?.trim() && okItems.length > 0) {
          map.setBounds(bounds);
        } else {
          const center = new kakao.maps.LatLng(basePos.lat, basePos.lng);
          map.setCenter(center);
          map.setLevel(4); // 약 500m~1km 범위
        }
      } catch (e) {
        console.error(e);
        setApiError(e?.response?.data?.message || e?.message || String(e));
      } finally {
        setLoadingData(false);
      }
    };

    run();
  }, [mapStatus, loaded, basePos, safeRadiusKm, keyword, category, page, size]);

  // 3) 언마운트 정리
  useEffect(() => {
    return () => {
      clearRestaurantMarkers();
      if (myLocationOverlayRef.current) {
        myLocationOverlayRef.current.setMap(null);
        myLocationOverlayRef.current = null;
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  /* 
    Smart Search Logic:
    1. 검색어가 있으면 -> 주소(지역명)인지 먼저 확인 (Geocoding)
    2. 좌표가 나오면 -> "그 좌표 기준 가까운순"으로 이동 (/restaurants?lat=...&lng=...&sort=distance&locName=...)
    3. 좌표 없으면 -> "키워드 검색"으로 이동 (/restaurants?keyword=...)
  */
  const handleNearbySearchSubmit = (e) => {
    e.preventDefault();
    const kw = q.trim();

    if (!kw) {
      // 1) 검색어 없음 -> 내 위치 기준 가까운순 (기존 로직)
      const params = new URLSearchParams();
      params.set("sort", "distance");
      navigate(`/restaurants?${params.toString()}`);
      return;
    }

    // 2) 검색어 있음 -> 주소 검색 시도
    const geocoder = new window.kakao.maps.services.Geocoder();
    geocoder.addressSearch(kw, (result, status) => {
      // 2-1) 주소/지역명 검색 성공
      if (status === window.kakao.maps.services.Status.OK && result.length > 0) {
        const { x, y } = result[0]; // lng, lat
        // 좌표 기준 검색으로 이동
        const params = new URLSearchParams();
        params.set("lat", y);
        params.set("lng", x);
        params.set("sort", "distance");
        params.set("locName", kw); // "부산", "강남구" 등 표시용
        navigate(`/restaurants?${params.toString()}`);
      } else {
        // 2-2) 주소 아님 -> 일반 키워드(메뉴/가게명) 검색
        const params = new URLSearchParams();
        params.set("keyword", kw);
        navigate(`/restaurants?${params.toString()}`);
      }
    });
  };
  return (
    <section className="nearby-section">
      <div className="nearby-search-wrap">
        <form className="nearby-search" onSubmit={handleNearbySearchSubmit}>
          <input
            type="text"
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="내 주변 맛집 검색"
            aria-label="근처 식당 검색"
          />
          <button type="submit">{q.trim() ? "검색" : "전체보기"}</button>
        </form>
      </div>

      {mapStatus === "error" && (
        <div className="nearby-message error">
          지도 로드 실패 (VITE_KAKAO_MAP_KEY 확인)
        </div>
      )}

      {apiError && (
        <div className="nearby-message error">API ERROR: {apiError}</div>
      )}

      {loaded && error && !coords && !useFallbackWhenDenied && (
        <div className="nearby-message info">위치 권한이 필요합니다.</div>
      )}

      <div ref={containerRef} className="nearby-map" style={{ height }} />
    </section>
  );
}
