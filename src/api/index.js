// src/api/index.js

// ✅ 그룹
export { default as GroupAPI } from './group/group';

// ✅ 게시판 (각 파일이 named export)
export { deleteDiary } from './board/deleteDiary';
export { getDiary } from './board/getDiary';
export { getDiaryDetail } from './board/getDiaryDetail';
export { updateDiary } from './board/updateDiary';
export { writeDiary } from './board/writeDiary';

// ✅ 파일 업로드 (named export)
export { uploadProfileImage } from './file/uploadProfileImage';

// ✅ 투어 (파일이 searchTours 라는 이름으로 export 함 → alias도 함께 제공)
export { searchTours } from './tour/searchTour';
export { searchTours as searchTour } from './tour/searchTour'; // 필요 시 단수 이름으로도 사용 가능

// ✅ 유저 (userContentApi.js가 fetchMyDiaries, fetchMyTravel 두 개를 named export)
export { fetchMyDiaries, fetchMyTravel } from './user/userContentApi';

// ⚠️ 파일명 대소문자 주의: 에러 메시지에 따르면 실제 파일은 userprofileUpdate.js (p 소문자)
//    그리고 이 파일이 무엇을 export 하는지에 따라 아래를 골라 쓰세요.
//    1) named export인 경우:
export { userprofileUpdate as userProfileUpdate } from './user/userProfileUpdate';
//    2) 만약 default export 라면 위 줄을 주석 처리하고 아래 줄 사용:
// export { default as userProfileUpdate } from './user/userprofileUpdate';

// ✅ 날씨 (named export)
export { getWeather } from './weather/getWeather';

// ✅ 공통 설정 & 유저 유틸 (둘 다 named export)
export { API_BASE_URL } from './config';
export { updateUserProfile } from './user';
