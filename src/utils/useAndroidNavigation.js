// src/hooks/useAndroidNavigation.js
import { useState, useEffect } from 'react';

export const useAndroidNavigation = () => {
  const [navigationType, setNavigationType] = useState('unknown');
  const [bottomPadding, setBottomPadding] = useState(0);

  useEffect(() => {
    const detectNavigationType = () => {
      // 안드로이드가 아니면 일반 처리
      if (!/Android/i.test(navigator.userAgent)) {
        setNavigationType('not-android');
        setBottomPadding(0);
        return;
      }

      // 방법 1: safe-area-inset-bottom 값으로 판단
      const testDiv = document.createElement('div');
      testDiv.style.position = 'fixed';
      testDiv.style.bottom = '0';
      testDiv.style.left = '0';
      testDiv.style.width = '1px';
      testDiv.style.height = 'env(safe-area-inset-bottom)';
      testDiv.style.pointerEvents = 'none';
      testDiv.style.visibility = 'hidden';
      
      document.body.appendChild(testDiv);
      const safeAreaHeight = testDiv.offsetHeight;
      document.body.removeChild(testDiv);

      console.log('Safe area bottom height:', safeAreaHeight);

      // 방법 2: 화면 크기와 뷰포트 크기 비교
      const screenHeight = window.screen.height;
      const windowHeight = window.innerHeight;
      const heightDifference = screenHeight - windowHeight;

      console.log('Screen height:', screenHeight);
      console.log('Window height:', windowHeight);
      console.log('Height difference:', heightDifference);

      // 방법 3: CSS env() 값 직접 확인
      const rootStyle = getComputedStyle(document.documentElement);
      const cssEnvValue = rootStyle.getPropertyValue('--safe-area-bottom') || '0px';
      console.log('CSS env value:', cssEnvValue);

      // 판단 로직
      let detectedType = 'gesture';
      let padding = 8; // 기본 여백

      if (safeAreaHeight > 15) {
        // safe-area-inset-bottom이 15px 이상이면 버튼바
        detectedType = 'button';
        padding = safeAreaHeight + 8; // safe-area + 추가 여백
      } else if (heightDifference > 120) {
        // 화면과 뷰포트 차이가 크면 버튼바 (상태바 + 네비게이션바)
        detectedType = 'button';
        padding = 28; // 버튼바 예상 높이
      } else {
        // 제스처바
        detectedType = 'gesture';
        padding = Math.max(safeAreaHeight, 8); // 최소 8px
      }

      console.log('Detected navigation type:', detectedType);
      console.log('Applied padding:', padding);

      setNavigationType(detectedType);
      setBottomPadding(padding);

      // body에 클래스 추가로 CSS에서도 활용 가능
      document.body.classList.remove('android-gesture', 'android-button');
      document.body.classList.add(`android-${detectedType}`);
    };

    // 초기 감지
    detectNavigationType();

    // 화면 회전이나 크기 변경시 재감지
    const handleResize = () => {
      setTimeout(detectNavigationType, 100); // 약간의 딜레이
    };

    window.addEventListener('resize', handleResize);
    window.addEventListener('orientationchange', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
      window.removeEventListener('orientationchange', handleResize);
    };
  }, []);

  return {
    navigationType, // 'gesture', 'button', 'not-android', 'unknown'
    bottomPadding,  // 적용할 하단 패딩 값 (px)
    isGesture: navigationType === 'gesture',
    isButton: navigationType === 'button',
    isAndroid: navigationType !== 'not-android'
  };
};