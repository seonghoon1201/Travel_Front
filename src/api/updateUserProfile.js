import axios from 'axios';
import { getItem, setItem } from '../utils/localStorage';

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

    // 로컬스토리지 갱신
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
