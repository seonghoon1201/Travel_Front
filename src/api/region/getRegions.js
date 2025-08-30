// 모든 지역 목록 조회
// 응답 스키마: { regions: [{ regionId, regionName, regionCode, regionImage, description }], totalCount }
import http from '../../utils/authAxios';

export async function getRegions() {
  const { data } = await http.get('/regions');
  // data.regions 가 없을 수도 있으니 방어적으로 반환
  return Array.isArray(data?.regions) ? data.regions : [];
}
