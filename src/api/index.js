// src/api/index.js

// 그룹
export { default as GroupAPI } from './group/group';

// 게시판
export { deleteDiary } from './board/deleteDiary';
export { getDiary } from './board/getDiary';
export { getDiaryDetail } from './board/getDiaryDetail';
export { updateDiary } from './board/updateDiary';
export { writeDiary } from './board/writeDiary';

// 파일 업로드
export { uploadProfileImage } from './file/uploadProfileImage';

// 투어
export { searchTours } from './tour/searchTour';
export { searchTours as searchTour } from './tour/searchTour';

// 유저
export { fetchMyDiaries, fetchMyTravel } from './user/userContentApi';

export { userprofileUpdate as userProfileUpdate } from './user/userProfileUpdate';


// 날씨
export { getWeather } from './weather/getWeather';

// 지역
export { getRegions } from './region/getRegions';

// 카트
export { default as CartAPI } from './cart/cart';

// 장소
export { getPlacesByRegionTheme } from './place/getPlacesByTheme';

// 일정
export { createSchedule } from './schedule/createSchedule';
export { optimizeSchedule } from './schedule/optimizeSchedule';
export { getSchedule } from './schedule/getSchedule';

// 공통 설정 & 유저 유틸
export { API_BASE_URL } from './config';
export { updateUserProfile } from './user';
