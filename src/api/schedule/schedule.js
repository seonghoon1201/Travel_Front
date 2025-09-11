import http from '../../utils/authAxios';

/** 일정 생성 */
export async function createSchedule(payload) {
  const { data } = await http.post('/schedule/create', payload);
  return data;
}

/** 일정 상세 조회 */
export async function getSchedule(scheduleId) {
  if (!scheduleId) throw new Error('scheduleId가 필요합니다.');
  const { data } = await http.get(`/schedule/details/${scheduleId}`);
  return data;
}

/** 일정 최적화 요청 */
export async function optimizeSchedule(scheduleId) {
  if (!scheduleId) throw new Error('scheduleId가 필요합니다.');
  const { data } = await http.post(`/schedule/optimize/${scheduleId}`);
  return data;
}

// 백엔드: PUT /schedule/update
export async function updateScheduleAll(payload) {
  const { data } = await http.put('/schedule/update', payload);
  return data ?? null;
}

/**
 * ✅ 일정 나가기/삭제 (새 스펙)
 * - DELETE /schedule/{scheduleId}
 * - 현재 사용자만 스케줄에서 제외
 * - 마지막 참여자면 스케줄 자체가 삭제됨
 */
export async function deleteSchedule(scheduleId) {
  if (!scheduleId) throw new Error('scheduleId가 필요합니다.');
  const { data } = await http.delete(`/schedule/${scheduleId}`);
  return data ?? null; // 보통 200 OK (본문 없을 수 있음)
}

/** 초대 수락(현재 로그인 유저를 참여자로 추가) */
export async function joinSchedule(scheduleId) {
  if (!scheduleId) throw new Error('scheduleId가 필요합니다.');
  const { data } = await http.post(`/schedule/${scheduleId}/join`);
  return data;
}

/** 참여자 수 조회 */
export async function getParticipantCount(scheduleId) {
  if (!scheduleId) throw new Error('scheduleId가 필요합니다.');
  const { data } = await http.get(`/schedule/${scheduleId}/count`);
  return data;
}
