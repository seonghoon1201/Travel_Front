// tailwind.config.js
/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./src/**/*.{js,jsx,ts,tsx}'],
  theme: {
    extend: {
      colors: {
        background: '#F8FBFF',
        text: '#333333',
        primary: '#76C9F2',
        subtle: '#DDF1FB',
        accent: '#A6E3D7',
        warning: '#FFA099',
        link: '#B6B4F4',
        button: '#00AEFF',
      },
      keyframes: {
        fadeOut: {
          '0%': { opacity: '1' },
          '100%': { opacity: '0' },
        },
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
      },
      animation: {
        fadeIn: 'fadeIn 1s ease-out',
        fadeOut: 'fadeOut 1s ease-in',
      },
      fontFamily: {
        /* 언제 쓰징 */
        jalnongothic: ['JalnanGothic', 'sans-serif'],
        /* 제목들은 이 폰트 이용 */
        noonnu: ['NoonnuBasicGothicRegular', 'sans-serif'],
        /* 대부분의 모든 글씨체들 디폴트 */
        sans: ['Pretendard-Regular', 'sans-serif'],
      },
    },
  },
  plugins: [],
};
