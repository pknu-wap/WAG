/** @type {import('tailwindcss').Config} */
// 색상 토큰은 Figma "WAG Design" 파일 기준입니다. (design/figma/README.md 참고)
module.exports = {
  content: ['./src/**/*.{html,js,ts,tsx}'],
  darkMode: 'class',
  theme: {
    extend: {
      fontFamily: {
        galmuri: ['Galmuri11', 'sans-serif'],
        galmuri14: ['Galmuri14', 'Galmuri11', 'sans-serif'],
      },
      boxShadow: {
        wag: '0 4px 4px rgba(0, 0, 0, 0.25)',
        soft: '0 2px 6px rgba(0, 0, 0, 0.15)',
      },
      keyframes: {
        shake: {
          '0%': { transform: 'translate(1px, 1px) rotate(0deg)' },
          '20%': { transform: 'translate(-3px, 0px) rotate(1deg)' },
          '40%': { transform: 'translate(1px, -1px) rotate(1deg)' },
          '60%': { transform: 'translate(-3px, 1px) rotate(0deg)' },
          '80%': { transform: 'translate(-1px, -1px) rotate(1deg)' },
          '100%': { transform: 'translate(1px, -2px) rotate(-1deg)' },
        },
        drift: {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-12px)' },
        },
      },
      animation: {
        shake: 'shake 0.3s infinite linear',
        drift: 'drift 9s ease-in-out infinite',
      },
    },
    colors: {
      transparent: 'transparent',
      current: 'currentColor',
      white: '#FFFFFF',
      black: '#000000',
      // 라이트 테마
      light: {
        bg: '#FFE5E5',
        text: '#000000',
        btn: '#B931FC',
        btn_hover: '#C34BF8',
        chat: '#FFCCFF', // 말풍선
        modal: '#FBE6E5',
        icon: '#FFE5E5', // 헤더 아이콘 원
        banner: '#A63BED', // 결과 화면 상단
      },
      // 다크 테마
      dark: {
        bg: '#595959',
        text: '#FFFFFF',
        btn: '#FF6AC2',
        btn_hover: '#FF7CCB',
        chat: '#FF6AC2',
        modal: '#595959',
        icon: '#595959',
        banner: '#FF6AC2',
      },
      // 테마와 무관하게 고정인 색
      wag: {
        panel: '#A072BC', // 채팅 패널
        status: '#FFCCFF', // 가운데 상태 박스
        asker: '#FFA500', // 질문자 (아바타, 말풍선, 정답어 라벨)
        askerText: '#5B33DE',
        answerText: '#C93290',
        timerTrack: '#DCD6FF',
        timerFill: '#8377C9',
        disabled: '#4D5562',
        idle: '#A9A9A9', // 준비 안 한 아바타
        placeholder: '#7A808D',
        line: '#BEBEBE',
        checked: '#A63BED',
        thumb: '#F2A480',
        toggleOff: '#BDBDBD',
        muted: '#9F9F9F',
        notice: '#808080',
        ok: '#33B3FF',
        bad: '#FF0000',
        hint: '#D98E0D',
        card: '#FFFF00',
        cross: '#FE585D',
        success: '#61BA47',
        field: '#FFFFFF',
        fieldLine: '#6B7280',
        arrow: '#FFF8F8',
      },
    },
  },
  plugins: [
    require('@tailwindcss/forms'),
    function ({ addUtilities }) {
      addUtilities(
        {
          '.scrollbar-thin': {
            '::-webkit-scrollbar': { width: '8px' },
            '::-webkit-scrollbar-thumb': { background: '#B931FC', 'border-radius': '8px' },
            'scrollbar-width': 'thin',
            'scrollbar-color': '#B931FC transparent',
          },
        },
        ['responsive']
      );
    },
  ],
};
