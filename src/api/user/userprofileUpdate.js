import axios from 'axios';
import { getItem, setItem } from '../../utils/localStorage';
import { API_BASE_URL } from '../config';

export const userProfileUpdate = async ({ userNickname, userProfileImage }) => {
  const accessToken = getItem('accessToken');

  try {
    const response = await axios.put(
      `${API_BASE_URL}/user/update`,
      { userNickname, userProfileImage },
      {
        headers: {
          Authorization: `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
        },
      }
    );

    if (userNickname) setItem('nickname', userNickname);
    if (userProfileImage) setItem('profileImageUrl', userProfileImage);

    return {
      success: true,
      data: response.data,
    };
  } catch (error) {
    console.error(
      '유저 정보 업데이트 실패:',
      error.response?.data || error.message
    );
    return {
      success: false,
      error: error.response?.data || '프로필 업데이트 실패',
    };
  }
};
