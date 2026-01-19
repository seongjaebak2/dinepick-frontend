/**
 * Kakao Maps Places Search Utility
 * 
 * 카카오 지도 API의 장소 검색(Places)을 Promise 기반으로 래핑
 */
import { loadKakaoMaps } from "./kakaoLoader";

/**
 * Kakao 카테고리명을 서비스 카테고리로 매핑
 * - CATEGORY_OPTIONS: KOREAN, CHINESE, JAPANESE, WESTERN, CAFE, ETC
 */
function mapKakaoCategory(rawCategory) {
    if (!rawCategory) return "ETC";

    // 1. 카페/디저트
    if (rawCategory.includes("카페") || rawCategory.includes("커피") || rawCategory.includes("디저트") || rawCategory.includes("제과") || rawCategory.includes("베이커리")) {
        return "CAFE";
    }

    // 2. 일식
    if (rawCategory.includes("일식") || rawCategory.includes("초밥") || rawCategory.includes("돈가스") || rawCategory.includes("소바") || rawCategory.includes("우동") || rawCategory.includes("이자카야")) {
        return "JAPANESE";
    }

    // 3. 중식
    if (rawCategory.includes("중식") || rawCategory.includes("중화요리") || rawCategory.includes("마라") || rawCategory.includes("딤섬")) {
        return "CHINESE";
    }

    // 4. 양식
    if (rawCategory.includes("양식") || rawCategory.includes("이탈리안") || rawCategory.includes("프랑스") || rawCategory.includes("피자") || rawCategory.includes("파스타") || rawCategory.includes("스테이크") || rawCategory.includes("패밀리레스토랑") || rawCategory.includes("버거") || rawCategory.includes("햄버거") || rawCategory.includes("샌드위치")) {
        return "WESTERN";
    }

    // 5. 한식
    if (rawCategory.includes("한식") || rawCategory.includes("고기") || rawCategory.includes("구이") || rawCategory.includes("찌개") || rawCategory.includes("국밥") || rawCategory.includes("냉면") || rawCategory.includes("분식") || rawCategory.includes("찜") || rawCategory.includes("도시락") || rawCategory.includes("죽")) {
        return "KOREAN";
    }

    // 6. 기타 (명시적으로 포함)
    // 치킨, 술집, 포장마차, 뷔페, 세계요리 등은 ETC로 분류
    return "ETC";
}

export async function searchKakaoPlaces(keyword, { lat, lng } = {}) {
    try {
        const kakao = await loadKakaoMaps();
        if (!kakao.maps?.services) {
            console.error("Kakao Maps Services library is missing.");
            return [];
        }

        const ps = new kakao.maps.services.Places();

        // 검색할 카테고리 그룹들: FD6(음식점), CE7(카페)
        const categoryGroups = ["FD6", "CE7"];

        // 각 카테고리별 검색을 위한 헬퍼 함수
        const fetchByCategory = (categoryGroupCode) => {
            return new Promise((resolve) => {
                const options = {
                    category_group_code: categoryGroupCode,
                    size: 15,
                };

                if (lat && lng) {
                    options.location = new kakao.maps.LatLng(lat, lng);
                    options.sort = kakao.maps.services.SortBy.DISTANCE;
                    options.radius = 10000;
                }

                let categoryData = [];
                ps.keywordSearch(keyword, (data, status, pagination) => {
                    if (status === kakao.maps.services.Status.OK) {
                        categoryData = [...categoryData, ...data];
                        // 최대 3페이지(45개)까지 가져옴
                        if (pagination.hasNextPage && pagination.current < 3) {
                            pagination.nextPage();
                        } else {
                            resolve(categoryData);
                        }
                    } else {
                        resolve(categoryData);
                    }
                }, options);
            });
        };

        // 모든 카테고리 그룹에 대해 병렬 검색 실행
        const resultsArray = await Promise.all(categoryGroups.map(fetchByCategory));

        // 결과 합치고 중복 제거 (ID 기준)
        const mergedData = [];
        const seenIds = new Set();

        for (const groupResults of resultsArray) {
            for (const item of groupResults) {
                if (!seenIds.has(item.id)) {
                    seenIds.add(item.id);
                    mergedData.push(item);
                }
            }
        }

        // 포맷팅
        const formattedResults = mergedData.map((item) => ({
            id: `kakao-${item.id}`,
            isExternal: true,
            name: item.place_name,
            address: item.road_address_name || item.address_name,
            phone: item.phone,
            category: mapKakaoCategory(item.category_name),
            x: item.x,
            y: item.y,
            placeUrl: item.place_url,
            thumbnailUrl: "",
            rating: null,
            reviewCount: 0,
        }));

        return formattedResults;
    } catch (err) {
        console.warn("Kakao Places Search Failed:", err);
        return [];
    }
}
