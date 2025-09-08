// test

import http from '../../utils/authAxios';

export async function createSchedule(payload) {
  const { data } = await http.post('/schedule/create', payload);
  return data;
}
