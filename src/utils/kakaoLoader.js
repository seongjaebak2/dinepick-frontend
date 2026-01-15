let kakaoPromise = null;

export function loadKakaoMaps() {
  if (window.kakao?.maps) return Promise.resolve(window.kakao);
  if (kakaoPromise) return kakaoPromise;

  const key = import.meta.env.VITE_KAKAO_MAP_KEY;
  if (!key) return Promise.reject(new Error("VITE_KAKAO_MAP_KEY가 없습니다."));

  kakaoPromise = new Promise((resolve, reject) => {
    const existing = document.querySelector('script[data-kakao-maps="1"]');
    if (existing) {
      existing.addEventListener("load", () => resolve(window.kakao));
      existing.addEventListener("error", reject);
      return;
    }

    const script = document.createElement("script");
    script.dataset.kakaoMaps = "1";
    script.async = true;

    // ✅ Geocoder 위해 services 필요
    script.src = `https://dapi.kakao.com/v2/maps/sdk.js?appkey=${key}&autoload=false&libraries=services`;

    script.onload = () => window.kakao.maps.load(() => resolve(window.kakao));
    script.onerror = () => reject(new Error("카카오맵 SDK 로드 실패"));
    document.head.appendChild(script);
  });

  return kakaoPromise;
}
