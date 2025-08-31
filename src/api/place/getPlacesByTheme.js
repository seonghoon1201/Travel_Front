import http from '../../utils/authAxios';

/**
 * 지역(법정동/시군구) + 테마로 장소 조회
 * 필수: ldongRegnCd, ldongSignguCd, theme
 * page는 있을 때만 전송
 */
export async function getPlacesByRegionTheme({
  ldongRegnCd,
  ldongSignguCd,
  theme,
  page = 0,
  size = 20,
}) {
  const params = {
    // 스웨거와 정확히 같은 키(대문자 I + D)
    lDongRegnCd: String(ldongRegnCd ?? ''),
    lDongSignguCd: String(ldongSignguCd ?? ''),
    theme: String(theme ?? ''),
    page: Number.isFinite(page) ? Number(page) : 0,
    size: Number.isFinite(size) ? Number(size) : 20,
  };
  const { data } = await http.get('/places/region/theme', { params });
  return data;
}
