// src/pages/auth/SignUpPage.jsx
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { message, Drawer } from 'antd';

import CommonModal from '../../components/modal/CommonModal';
import PrimaryButton from '../../components/common/PrimaryButton';
import profileDefault from '../../assets/profile_default.png';
import BackHeader from '../../components/header/BackHeader';
import { Eye, EyeOff } from 'lucide-react';
import DefaultLayout from '../../layouts/DefaultLayout';

import {
  checkEmail,
  sendAuthCode,
  verifyAuthCode,
  uploadProfileImage,
  registerUser,
} from '../../api';

const TERMS_TEXT = (
  <div className="space-y-3 text-sm leading-6">
    <h3 className="text-base font-bold">여담 서비스 이용약관</h3>
    <p>
      본 약관은 여담(이하 “회사”)이 제공하는 서비스의 이용과 관련하여 회사와
      이용자 간의 권리·의무 및 책임사항을 규정합니다.
    </p>

    <h4 className="font-semibold">1. 계정 및 가입</h4>
    <ul className="list-disc pl-5">
      <li>이용자는 정확한 정보를 제공하여 회원가입을 완료해야 합니다.</li>
      <li>타인의 정보를 도용하거나 허위 정보를 기재할 수 없습니다.</li>
    </ul>

    <h4 className="font-semibold">2. 서비스 이용</h4>
    <ul className="list-disc pl-5">
      <li>서비스는 개인적·비상업적 용도에 한해 사용할 수 있습니다.</li>
      <li>
        법령 위반, 서버·네트워크 장애 유발, 크롤링/스크래핑 등은 금지됩니다.
      </li>
    </ul>

    <h4 className="font-semibold">3. 사용자 콘텐츠</h4>
    <ul className="list-disc pl-5">
      <li>이용자가 게시한 콘텐츠의 저작권은 이용자에게 있습니다.</li>
      <li>
        이용자는 회사가 서비스 운영·홍보를 위해 비독점적으로 콘텐츠를 이용(저장,
        노출, 수정 크기 조정 등)할 수 있도록 허락합니다.
      </li>
      <li>
        타인의 권리를 침해하는 콘텐츠 게시 시 법적 책임은 이용자에게 있습니다.
      </li>
    </ul>

    <h4 className="font-semibold">4. 서비스 변경 및 중단</h4>
    <ul className="list-disc pl-5">
      <li>
        회사는 운영상·기술상 필요에 따라 서비스의 전부 또는 일부를 변경·중단할
        수 있습니다.
      </li>
      <li>유료 서비스 변경·중단 시 관계 법령에 따른 조치를 취합니다.</li>
    </ul>

    <h4 className="font-semibold">5. 책임의 제한</h4>
    <ul className="list-disc pl-5">
      <li>
        회사는 천재지변, 장애, 제3자 행위 등 불가항력으로 인한 손해에 대해
        책임을 지지 않습니다.
      </li>
      <li>이용자의 귀책사유로 인한 손해에 대해 회사는 책임을 지지 않습니다.</li>
    </ul>

    <h4 className="font-semibold">6. 계약 해지(회원 탈퇴)</h4>
    <ul className="list-disc pl-5">
      <li>
        이용자는 언제든지 서비스 내 기능을 통해 회원 탈퇴를 요청할 수 있습니다.
      </li>
      <li>
        약관 위반 시 회사는 사전 통지 후 이용을 제한하거나 계약을 해지할 수
        있습니다.
      </li>
    </ul>

    <h4 className="font-semibold">7. 준거법 및 분쟁 해결</h4>
    <p>
      본 약관은 대한민국 법을 준거법으로 하며, 분쟁은 민사소송법상 관할법원의
      전속 관할로 합니다.
    </p>

    <p className="text-xs text-gray-500">시행일: 2025-01-01</p>
  </div>
);

const PRIVACY_TEXT = (
  <div className="space-y-3 text-sm leading-6">
    <h3 className="text-base font-bold">개인정보 수집·이용 동의</h3>
    <p>회사는 다음과 같은 목적과 범위 내에서 개인정보를 수집·이용합니다.</p>

    <h4 className="font-semibold">1. 수집 항목</h4>
    <ul className="list-disc pl-5">
      <li>필수: 이메일, 비밀번호(암호화 저장), 닉네임/이름</li>
      <li>선택: 프로필 이미지, 마케팅 수신 동의 여부</li>
      <li>자동 수집: 접속 로그, 접속 IP, 기기 정보, 쿠키</li>
    </ul>

    <h4 className="font-semibold">2. 이용 목적</h4>
    <ul className="list-disc pl-5">
      <li>회원 관리, 본인확인 및 로그인(소셜 로그인 포함)</li>
      <li>서비스 제공 및 맞춤형 추천, 고객 지원</li>
      <li>서비스 품질 개선을 위한 통계·분석</li>
      <li>마케팅 정보 제공(선택 동의 시)</li>
    </ul>

    <h4 className="font-semibold">3. 보유 및 이용 기간</h4>
    <ul className="list-disc pl-5">
      <li>
        회원 탈퇴 시 지체 없이 파기합니다. 단, 관련 법령에 따라 일정 기간 보관될
        수 있습니다.
      </li>
    </ul>

    <h4 className="font-semibold">4. 제3자 제공 및 처리 위탁</h4>
    <ul className="list-disc pl-5">
      <li>
        결제/인증/알림 발송 등 서비스 운영을 위해 필요한 범위에서 위탁할 수
        있으며, 위탁사는 계약을 통해 개인정보 보호 의무를 부담합니다.
      </li>
      <li>
        법령에 근거하거나 수사기관의 적법한 요청이 있는 경우 제공될 수 있습니다.
      </li>
    </ul>

    <h4 className="font-semibold">5. 이용자의 권리</h4>
    <ul className="list-disc pl-5">
      <li>
        개인정보 열람, 정정·삭제, 처리정지 요구권이 있으며, 앱 내 또는
        고객지원으로 문의할 수 있습니다.
      </li>
    </ul>

    <h4 className="font-semibold">6. 안전성 확보 조치</h4>
    <ul className="list-disc pl-5">
      <li>
        암호화 저장, 접근권한 통제, 침입 차단 등 합리적 보호조치를 시행합니다.
      </li>
    </ul>

    <p className="text-xs text-gray-500">시행일: 2025-01-01</p>
  </div>
);

const MARKETING_TEXT = (
  <div className="space-y-3 text-sm leading-6">
    <h3 className="text-base font-bold">마케팅 정보 수신 동의(선택)</h3>
    <p>
      회사는 이용자에게 더 나은 혜택과 정보를 제공하기 위해 아래와 같이 광고성
      정보를 발송할 수 있습니다.
    </p>

    <h4 className="font-semibold">1. 발송 내용</h4>
    <ul className="list-disc pl-5">
      <li>이벤트/프로모션, 할인·쿠폰, 신규 기능·서비스 안내, 맞춤 추천</li>
    </ul>

    <h4 className="font-semibold">2. 발송 채널</h4>
    <ul className="list-disc pl-5">
      <li>이메일, 앱 푸시, 문자(SMS/MMS)</li>
    </ul>

    <h4 className="font-semibold">3. 수신 철회</h4>
    <ul className="list-disc pl-5">
      <li>
        설정 화면 또는 각 메시지의 수신거부 링크를 통해 언제든지 철회할 수
        있습니다.
      </li>
    </ul>

    <h4 className="font-semibold">4. 보관 기간</h4>
    <ul className="list-disc pl-5">
      <li>
        철회 또는 회원 탈퇴 시 까지, 혹은 법령상 보관기간 경과 시 파기합니다.
      </li>
    </ul>

    <p className="text-xs text-gray-500">
      수신 동의는 선택이며, 미동의 시에도 핵심 서비스 이용에는 제한이 없습니다.
    </p>
  </div>
);

const SignUpPage = () => {
  const [terms, setTerms] = useState(false);
  const [privacy, setPrivacy] = useState(false);
  const [marketing, setMarketing] = useState(false);
  const [allChecked, setAllChecked] = useState(false);

  const [email, setEmail] = useState('');
  const [authCode, setAuthCode] = useState('');
  const [isCodeSent, setIsCodeSent] = useState(false);
  const [isEmailVerified, setIsEmailVerified] = useState(false);

  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [userName, setUserName] = useState('');
  const [userNickname, setUserNickname] = useState('');
  const [profileImage, setProfileImage] = useState(null);
  const [profileImageUrl, setProfileImageUrl] = useState('');

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // loading flags
  const [sendingCode, setSendingCode] = useState(false);
  const [verifyingCode, setVerifyingCode] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  // 약관 Drawer
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [drawerType, setDrawerType] = useState(null);

  const [msg, contextHolder] = message.useMessage();
  const navigate = useNavigate();

  const syncAllChecked = (nextTerms, nextPrivacy, nextMarketing) => {
    setAllChecked(Boolean(nextTerms && nextPrivacy && nextMarketing));
  };

  const handleAllAgreeChange = () => {
    const next = !allChecked;
    setAllChecked(next);
    setTerms(next);
    setPrivacy(next);
    setMarketing(next);
  };

  const passwordsMatch = confirmPassword && password === confirmPassword;
  const passwordsMismatch = confirmPassword && password !== confirmPassword;

  // 이메일 중복 확인 + 인증코드 발송
  const handleSendAuthCode = async () => {
    if (!email) {
      msg.warning('이메일을 입력해 주세요.');
      return;
    }

    try {
      setSendingCode(true);
      const hide = msg.loading('이메일 확인 중...', 0);
      const isDuplicate = await checkEmail({ email });
      if (isDuplicate) {
        hide();
        msg.error('이미 등록된 이메일입니다. 다른 이메일을 사용해 주세요.');
        setEmail('');
        return;
      }

      await sendAuthCode({ email });
      hide();
      msg.success('인증코드가 이메일로 전송되었습니다.');
      setIsCodeSent(true);
    } catch (error) {
      msg.error('이메일 확인 또는 인증코드 전송에 실패했습니다.');
    } finally {
      setSendingCode(false);
    }
  };

  // 인증코드 검증
  const handleVerifyAuthCode = async () => {
    if (!authCode) {
      msg.warning('인증코드를 입력해 주세요.');
      return;
    }
    try {
      setVerifyingCode(true);
      const hide = msg.loading('인증코드 확인 중...', 0);
      await verifyAuthCode({ token: authCode });
      hide();
      setIsEmailVerified(true);
      msg.success('이메일 인증이 완료되었습니다.');
    } catch (error) {
      msg.error(error?.response?.data?.message || '인증에 실패했습니다.');
    } finally {
      setVerifyingCode(false);
    }
  };

  // 프로필 이미지 업로드
  const handleImageUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setProfileImage(URL.createObjectURL(file));

    try {
      setUploading(true);
      const hide = msg.loading('이미지 업로드 중...', 0);
      const { success, imageUrl, error } = await uploadProfileImage(file);
      hide();
      if (success) {
        setProfileImageUrl(imageUrl || '');
        msg.success('이미지를 업로드했습니다.');
      } else {
        setProfileImage(null);
        setProfileImageUrl('');
        msg.error(error || '프로필 이미지 업로드에 실패했습니다.');
      }
    } finally {
      setUploading(false);
    }
  };

  const handleSignUpSuccess = () => setIsModalOpen(true);
  const handleConfirm = () => {
    setIsModalOpen(false);
    navigate('/login');
  };

  // 회원가입 제출
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!email || !password || !confirmPassword || !userName || !userNickname) {
      msg.warning('모든 필수 정보를 입력해 주세요.');
      return;
    }
    if (password !== confirmPassword) {
      msg.warning('비밀번호가 일치하지 않습니다.');
      return;
    }
    if (!terms || !privacy) {
      msg.warning('필수 약관에 동의해 주세요.');
      return;
    }
    if (!isEmailVerified) {
      msg.warning('이메일 인증을 완료해 주세요.');
      return;
    }

    const payload = {
      email,
      password,
      userName,
      userNickname,
      userProfileImage: profileImageUrl || '',
    };

    try {
      setSubmitting(true);
      const hide = msg.loading('회원가입 처리 중...', 0);
      await registerUser(payload);
      hide();
      handleSignUpSuccess();
    } catch (error) {
      msg.error(
        error?.response?.data?.message || '회원가입 중 문제가 발생했습니다.'
      );
    } finally {
      setSubmitting(false);
    }
  };

  // Drawer 열기/닫기
  const openDrawer = (type) => {
    setDrawerType(type);
    setDrawerOpen(true);
  };
  const closeDrawer = () => setDrawerOpen(false);

  const drawerTitle =
    drawerType === 'terms'
      ? '이용약관'
      : drawerType === 'privacy'
      ? '개인정보 수집·이용 동의'
      : '마케팅 정보 수신 동의';

  const drawerContent =
    drawerType === 'terms'
      ? TERMS_TEXT
      : drawerType === 'privacy'
      ? PRIVACY_TEXT
      : MARKETING_TEXT;

  const agreeFromDrawer = () => {
    if (drawerType === 'terms') {
      const next = true;
      setTerms(next);
      syncAllChecked(next, privacy, marketing);
    } else if (drawerType === 'privacy') {
      const next = true;
      setPrivacy(next);
      syncAllChecked(terms, next, marketing);
    } else if (drawerType === 'marketing') {
      const next = true;
      setMarketing(next);
      syncAllChecked(terms, privacy, next);
    }
    setDrawerOpen(false);
  };

  return (
    <DefaultLayout>
      {contextHolder}
      <BackHeader title="회원가입" />
      <p className="font-noonnu font-semibold mb-4 text-center">반갑습니다!</p>
      <div className="flex justify-center mb-4">
        <div className="flex flex-col items-center">
          <img
            key={profileImage}
            src={profileImage || profileDefault}
            alt="기본 프로필"
            className="w-20 h-20 rounded-full bg-white object-cover"
          />
          <label className="text-blue-500 mt-1 text-sm cursor-pointer">
            {uploading ? '업로드 중...' : '업로드'}
            <input
              type="file"
              accept="image/*"
              onChange={handleImageUpload}
              className="hidden"
              disabled={uploading}
            />
          </label>
        </div>
      </div>

      <div className="w-full max-w-md mx-auto px-4">
        <form onSubmit={handleSubmit}>
          {/* 이메일 */}
          <label className="block text-sm font-medium mb-1">
            이메일 <span className="text-red-500">*</span>
          </label>
          <div className="flex gap-2 mb-3">
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="이메일을 입력해 주세요."
              className="border w-full px-3 py-2 rounded text-sm"
              disabled={sendingCode || submitting}
            />
            <button
              type="button"
              onClick={handleSendAuthCode}
              className="text-sm border px-3 py-2 rounded text-blue-500 whitespace-nowrap disabled:opacity-60"
              disabled={!email || sendingCode || submitting}
            >
              {sendingCode ? '전송 중...' : '이메일 중복 확인'}
            </button>
          </div>

          {/* 인증코드 */}
          {isCodeSent && (
            <>
              <label className="block text-sm font-medium mb-1">
                인증코드 입력 <span className="text-red-500">*</span>
              </label>
              <div className="flex gap-2 mb-3">
                <input
                  type="text"
                  value={authCode}
                  onChange={(e) => setAuthCode(e.target.value)}
                  placeholder="인증코드를 입력해 주세요."
                  className="border w-full px-3 py-2 rounded text-sm"
                  disabled={verifyingCode || submitting}
                />
                <button
                  type="button"
                  onClick={handleVerifyAuthCode}
                  className="text-sm border px-3 py-2 rounded text-blue-500 whitespace-nowrap disabled:opacity-60"
                  disabled={!authCode || verifyingCode || submitting}
                >
                  {verifyingCode ? '확인 중...' : '인증하기'}
                </button>
              </div>
            </>
          )}

          {/* 비밀번호 */}
          <label className="block text-sm font-medium mb-1">
            비밀번호 <span className="text-red-500">*</span>
          </label>
          <div className="relative mb-3">
            <input
              type={showPassword ? 'text' : 'password'}
              placeholder="비밀번호를 입력해 주세요."
              className="border w-full px-3 py-2 rounded text-sm pr-10"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              disabled={submitting}
            />
            <button
              type="button"
              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500"
              onClick={() => setShowPassword(!showPassword)}
              disabled={submitting}
            >
              {showPassword ? (
                <EyeOff className="w-4 h-4" />
              ) : (
                <Eye className="w-4 h-4" />
              )}
            </button>
          </div>

          {/* 비밀번호 확인 */}
          <label className="block text-sm font-medium mb-1">
            비밀번호 확인 <span className="text-red-500">*</span>
          </label>
          <div className="relative mb-1">
            <input
              type={showConfirmPassword ? 'text' : 'password'}
              placeholder="비밀번호를 다시 입력해 주세요."
              className="border w-full px-3 py-2 rounded text-sm pr-10"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              disabled={submitting}
            />
            <button
              type="button"
              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500"
              onClick={() => setShowConfirmPassword(!showConfirmPassword)}
              disabled={submitting}
            >
              {showConfirmPassword ? (
                <EyeOff className="w-4 h-4" />
              ) : (
                <Eye className="w-4 h-4" />
              )}
            </button>
          </div>
          {passwordsMismatch && (
            <p className="text-sm text-red-500">
              비밀번호가 일치하지 않습니다.
            </p>
          )}
          {passwordsMatch && (
            <p className="text-sm text-green-600">비밀번호가 일치합니다!</p>
          )}

          {/* 이름 */}
          <label className="block text-sm font-medium mt-4 mb-1">
            이름 <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            value={userName}
            onChange={(e) => setUserName(e.target.value)}
            placeholder="이름을 입력해 주세요."
            className="border w-full px-3 py-2 rounded text-sm mb-3"
            disabled={submitting}
          />

          {/* 닉네임 */}
          <label className="block text-sm font-medium mb-1">
            닉네임 <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            value={userNickname}
            onChange={(e) => setUserNickname(e.target.value)}
            placeholder="닉네임을 입력해 주세요."
            className="border w-full px-3 py-2 rounded text-sm mb-5"
            disabled={submitting}
          />

          {/* 약관 */}
          <div className="border-t border-gray-200 my-4" />
          <div className="text-sm font-medium mb-2">이용 약관</div>
          <div className="mb-2">
            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={allChecked}
                onChange={handleAllAgreeChange}
                disabled={submitting}
              />
              모두 동의합니다
            </label>
          </div>
          <div className="space-y-2 text-sm pl-5">
            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={terms}
                onChange={(e) => {
                  setTerms(e.target.checked);
                  syncAllChecked(e.target.checked, privacy, marketing);
                }}
                disabled={submitting}
              />
              [필수] 이용약관{' '}
              <button
                type="button"
                className="text-blue-500 underline underline-offset-2"
                onClick={() => openDrawer('terms')}
              >
                [보기]
              </button>
            </label>
            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={privacy}
                onChange={(e) => {
                  setPrivacy(e.target.checked);
                  syncAllChecked(terms, e.target.checked, marketing);
                }}
                disabled={submitting}
              />
              [필수] 개인정보 수집·이용 동의{' '}
              <button
                type="button"
                className="text-blue-500 underline underline-offset-2"
                onClick={() => openDrawer('privacy')}
              >
                [보기]
              </button>
            </label>
            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={marketing}
                onChange={(e) => {
                  setMarketing(e.target.checked);
                  syncAllChecked(terms, privacy, e.target.checked);
                }}
                disabled={submitting}
              />
              [선택] 마케팅 정보 수신 동의{' '}
              <button
                type="button"
                className="text-blue-500 underline underline-offset-2"
                onClick={() => openDrawer('marketing')}
              >
                [보기]
              </button>
            </label>
          </div>

          <div className="mt-6">
            <PrimaryButton type="submit" disabled={submitting}>
              {submitting ? '가입 중...' : '여담 가입하기'}
            </PrimaryButton>
          </div>
        </form>
      </div>

      {/* 약관 Drawer */}
      <Drawer
        title={drawerTitle}
        placement="bottom"
        height="70%"
        open={drawerOpen}
        onClose={closeDrawer}
        destroyOnClose
      >
        {/* ⬇️ 텍스트와 버튼을 하나의 스크롤 영역으로 묶음 */}
        <div className="h-full overflow-y-auto pr-1">
          {/* 약관 본문 */}
          <div className="space-y-3 text-sm leading-6">{drawerContent}</div>

          {/* 스크롤을 끝까지 내려야 보이는 버튼 */}
          <div className="mt-6 mb-2 flex gap-2">
            <button
              type="button"
              onClick={agreeFromDrawer}
              className="px-4 py-2 rounded-md bg-blue-500 text-white text-sm"
            >
              동의하고 닫기
            </button>
            <button
              type="button"
              onClick={closeDrawer}
              className="px-4 py-2 rounded-md border text-sm"
            >
              닫기
            </button>
          </div>
        </div>
      </Drawer>

      <CommonModal
        isOpen={isModalOpen}
        message={`여담의 여행자가 되신 걸 진심으로 환영합니다.\n 로그인을 진행해 주세요! \n이제, 여행 준비는 저희가 도와드릴게요 🎉`}
        onConfirm={handleConfirm}
      />
    </DefaultLayout>
  );
};

export default SignUpPage;
