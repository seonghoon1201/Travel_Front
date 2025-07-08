import axios from 'axios';
import { getItem } from '../utils/localStorage';

export const updateUserProfile = async ({ userNickname, userProfileImage }) => {
  const accessToken = getItem('accessToken');

  try {
    const response = await axios.put(
      'http://localhost:8080/user/update',
      { userNickname, userProfileImage },
      {
        headers: {
          Authorization: `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
        },
      }
    );
    return response.data;
  } catch (error) {
    console.error('유저 정보 업데이트 실패:', error);
    throw error;
  }
};
