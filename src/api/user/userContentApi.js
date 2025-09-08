import axios from 'axios';
import { API_BASE_URL } from '../config';


// 내 여행 불러오기
export const fetchMyTravel = async (accessToken) => {
  const res = await axios.get(`${API_BASE_URL}/schedule`, {
    headers: { Authorization: `Bearer ${accessToken}` },
  });
  return res.data; 
};

// 내 여행일기 불러오기
export const fetchMyDiaries = async (accessToken) => {
  const res = await axios.get(`${API_BASE_URL}/board`, {
    headers: { Authorization: `Bearer ${accessToken}` },
  });
  return res.data;
};

// 내 저장 불러오기
// export const fetchMyBookmark = async (accessToken) => {
//   const res = await axios.get(`${API_BASE_URL}/관련 엔드포인트`, {
//     headers: { Authorization: `Bearer ${accessToken}` },
//   });
//   return res.data;
// };
