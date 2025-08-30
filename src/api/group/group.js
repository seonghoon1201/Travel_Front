// src/api/group.js
import http from '../../utils/authAxios';

/**
 * 그룹/초대 관련 API 래퍼
 * - 모든 함수는 예외 발생 시 throw 하므로, 호출 측에서 try/catch로 처리하세요.
 */
const GroupAPI = {
  /**
   * 그룹 생성
   * @param {string} groupName
   * @returns {Promise<{groupId: string}>}
   */
  async create(groupName) {
    const { data } = await http.post('/group/create', { groupName });
    // 응답이 { groupId: '...' } 형태라고 가정
    return data;
  },

  /**
   * 내 그룹 목록
   * @returns {Promise<Array<{groupId: string, groupName: string, users: Array<{userId:string, username:string}>}>>}
   */
  async list() {
    const { data } = await http.get('/group/list');
    return Array.isArray(data) ? data : [];
  },

  /**
   * 특정 그룹 정보(목록에서 검색)
   * @param {string} groupId
   */
  async getById(groupId) {
    const list = await this.list();
    return list.find((g) => g.groupId === groupId) || null;
  },

  /**
   * 특정 그룹 멤버 목록만 추출
   * @param {string} groupId
   * @returns {Promise<Array<{userId:string, username:string}>>}
   */
  async members(groupId) {
    const g = await this.getById(groupId);
    return g?.users || [];
  },

  /**
   * 멤버 추가 (서버 라우트 오타 대비: /member → 실패 시 /meber 재시도)
   * @param {string} groupId
   * @param {string} userId
   * @returns {Promise<void>}
   */
  async addMember(groupId, userId) {
    try {
      await http.put(`/group/${groupId}/member/${userId}`);
    } catch (e) {
      // 서버가 오타로 열려 있는 경우 폴백
      await http.put(`/group/${groupId}/meber/${userId}`);
    }
  },
};

export default GroupAPI;
