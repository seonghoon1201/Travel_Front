// src/api/schedule/schedule.js
import http from '../../utils/authAxios';

/** 일정 생성 */
export async function createSchedule(payload) {
  const { data } = await http.post('/schedule/create', payload);
  return data;
}

/** 일정 상세 조회 (공개/비공개 통합) */
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

/** 일정 삭제 (Swagger 스펙: DELETE /schedule/delete, body: { scheduleId }) */
export async function deleteSchedule(scheduleId) {
  if (!scheduleId) throw new Error('scheduleId가 필요합니다.');
  // axios에서 DELETE 본문은 { data } 키로 전달
  const { data } = await http.delete('/schedule/delete', {
    data: { scheduleId },
  });
  return data; // {} 빈 객체 응답(200) 기대
}

/** 초대 수락(현재 로그인 유저를 참여자로 추가) */
export async function joinSchedule(scheduleId) {
  if (!scheduleId) throw new Error('scheduleId가 필요합니다.');
  const { data } = await http.post(`/schedule/${scheduleId}/join`);
  return data;
}

export async function getParticipantCount(scheduleId) {
  if (!scheduleId) throw new Error('scheduleId가 필요합니다.');
  const { data } = await http.get(`/schedule/${scheduleId}/count`);
  return data;
}
