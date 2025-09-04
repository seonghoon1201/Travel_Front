import axios from 'axios';
import { API_BASE_URL } from '../config';
import { getItem } from '../../utils/localStorage';

/**
 * 법정동 코드로 지역별 장소 검색
 * @param {object} params
 * @param {string} params.ldongRegnCd  시/도 코드 (예: 강원특별자치도=51)
 * @param {string} params.ldongSignguCd 시/군/구 코드 (예: 속초시=210)
 * @param {number} params.page
 * @param {number} params.size
 */
export const getPlacesByRegion = async ({
  ldongRegnCd,
  ldongSignguCd,
  page = 0,
  size = 20,
}) => {
  const accessToken = getItem('accessToken');

  try {
    const res = await axios.get(`${API_BASE_URL}/places/region`, {
     params: { lDongRegnCd: ldongRegnCd, lDongSignguCd: ldongSignguCd, page, size },
      headers: accessToken ? { Authorization: `Bearer ${accessToken}` } : {},
    });

    return { success: true, data: res.data };
  } catch (error) {
    console.error('지역별 장소 조회 실패:', error.response?.data || error.message);
    return { success: false, error: error.response?.data || '지역별 장소 조회 실패' };
  }
};
