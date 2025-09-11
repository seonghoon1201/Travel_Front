// src/api/index.js

// 인증/메일
export { checkEmail, sendAuthCode, verifyAuthCode } from './auth/mail';
export { sendAuthCode as sendEmailCode } from './auth/mail';
export { verifyAuthCode as verifyEmailToken } from './auth/mail';

// 인증/회원
export { registerUser, loginUser, resetPassword } from './auth/user';

// 카카오
export { getKakaoLoginUrl, kakaoCallback } from './auth/kakao';

// 게시판
export {  getDiary,getDiaryDetail, updateDiary, writeDiary} from './board/diary';
export { getComments, createComment, deleteComment, updateComment } from './comment/comment';


// 파일 업로드
export { uploadProfileImage } from './file/uploadProfileImage';

// 투어
export { searchTours } from './tour/searchTour';
export { searchTours as searchTour } from './tour/searchTour';
export { getTourDetail } from './tour/getTourDetail';

// 유저 컨텐츠
export { fetchMyDiaries, fetchMyTravel } from './user/userContentApi';
export { userProfileUpdate } from './user/userProfileUpdate';

// 날씨
export { getWeather } from './weather/getWeather';

// 지역
export { getRegions } from './region/getRegions';

// 카트
export { default as CartAPI } from './cart/cart';

// 장소
export { getPlacesByRegionTheme } from './place/getPlacesByTheme';

// 스케줄
export {
  createSchedule,
  optimizeSchedule,
  getSchedule,
  deleteSchedule,
  updateScheduleAll,
  joinSchedule
} from './schedule/schedule';

// 스케줄 아이템 (명시적)
export { createScheduleItem } from './scheduleItem/scheduleItems';
export { updateScheduleItem } from './scheduleItem/scheduleItems';
export { deleteScheduleItem } from './scheduleItem/scheduleItems';

// 공통 설정
export { API_BASE_URL } from './config';
