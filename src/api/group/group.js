// src/api/group.js
import http from '../../utils/authAxios';

const GroupAPI = {
  async create(groupName) {
    const { data } = await http.post('/group/create', { groupName });
    // { groupId } 또는 문자열로 올 수도 있으니 방어
    const groupId =
      data?.groupId ?? (typeof data === 'string' ? data : undefined);
    return { groupId };
  },

  async list() {
    const { data } = await http.get('/group/list');
    const arr = Array.isArray(data) ? data : [];
    // users[].userName → username 로 노멀라이즈
    return arr.map((g) => ({
      ...g,
      users: (g.users || []).map((u) => ({
        userId: u.userId,
        username: u.userName ?? u.username ?? '',
      })),
    }));
  },

  async getById(groupId) {
    const list = await this.list();
    return list.find((g) => g.groupId === groupId) || null;
  },

  async members(groupId) {
    const g = await this.getById(groupId);
    return g?.users || [];
  },

  async addMember(groupId, userId) {
    await http.put(`/group/${groupId}/member/${userId}`);
  },

  async removeMember(groupId, userId) {
    await http.delete(`/group/${groupId}/member/${userId}`);
  },

  async count(groupId) {
    const { data } = await http.get(`/group/count/${groupId}`);
    return data?.memberCount ?? 0;
  },

  async delete(groupId) {
    await http.delete(`/group/${groupId}`);
  },
};

export default GroupAPI;
