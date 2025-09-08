// test
import http from '../../utils/authAxios';

export async function optimizeSchedule(scheduleId) {
  if (!scheduleId) throw new Error('scheduleId가 필요합니다.');
  const { data } = await http.post(`/schedule/optimize/${scheduleId}`);
  return data;
}
