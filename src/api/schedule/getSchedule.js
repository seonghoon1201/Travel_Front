// test
import http from '../../utils/authAxios';

export async function getSchedule(scheduleId) {
  if (!scheduleId) throw new Error('scheduleId가 필요합니다.');
  const { data } = await http.get(`/schedule/details/${scheduleId}`);
  return data;
}
