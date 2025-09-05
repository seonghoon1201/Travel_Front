import http from '../../utils/authAxios';

export async function createScheduleItem(scheduleId, body) {
  const { data } = await http.post(
    `/schedule/items/create/${scheduleId}`,
    body
  );
  return data;
}

export async function updateScheduleItem(body) {
  const { data } = await http.put(`/schedule/items/update`, body);
  return data;
}

export async function deleteScheduleItem(scheduleId, scheduleItemId) {
  const { data } = await http.delete(
    `/schedule/items/delete/${scheduleId}/${scheduleItemId}`
  );
  return data;
}
