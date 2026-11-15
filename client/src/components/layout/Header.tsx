import { useEffect, useRef, useState } from 'react';
import { connect, ConnectedProps } from 'react-redux';
import { useRecoilState } from 'recoil';
import { RootState } from '../../modules/index';
import { toggleDarkMode } from '../../modules/darkSlice';
import { IconButton, useSound, trackEvent, GA_EVENT } from '../../shared';
import { rulesModalState, soundEffectStatus } from '../../recoil/recoil';
import RulesModal from './RulesModal';

type PropsFromRedux = ConnectedProps<typeof connector>;

const icon = 'w-[19px] h-[19px]';

const SoundOnIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={icon}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M19.114 5.636a9 9 0 0 1 0 12.728M16.463 8.288a5.25 5.25 0 0 1 0 7.424M6.75 8.25l4.72-4.72a.75.75 0 0 1 1.28.53v15.88a.75.75 0 0 1-1.28.53l-4.72-4.72H4.51c-.88 0-1.704-.507-1.938-1.354A9.009 9.009 0 0 1 2.25 12c0-.83.112-1.633.322-2.396C2.806 8.756 3.63 8.25 4.51 8.25H6.75Z" />
  </svg>
);
const SoundOffIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={icon}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M17.25 9.75 19.5 12m0 0 2.25 2.25M19.5 12l2.25-2.25M19.5 12l-2.25 2.25m-10.5-6 4.72-4.72a.75.75 0 0 1 1.28.53v15.88a.75.75 0 0 1-1.28.53l-4.72-4.72H4.51c-.88 0-1.704-.507-1.938-1.354A9.009 9.009 0 0 1 2.25 12c0-.83.112-1.633.322-2.396C2.806 8.756 3.63 8.25 4.51 8.25H6.75Z" />
  </svg>
);
const MusicIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={icon}>
    <path strokeLinecap="round" strokeLinejoin="round" d="m9 9 10.5-3m0 6.553v3.75a2.25 2.25 0 0 1-1.632 2.163l-1.32.377a1.803 1.803 0 1 1-.99-3.467l2.31-.66a2.25 2.25 0 0 0 1.632-2.163Zm0 0V2.25L9 5.25v10.303m0 0v3.75a2.25 2.25 0 0 1-1.632 2.163l-1.32.377a1.803 1.803 0 0 1-.99-3.467l2.31-.66A2.25 2.25 0 0 0 9 15.553Z" />
  </svg>
);
const PauseIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={icon}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 5.25v13.5m-7.5-13.5v13.5" />
  </svg>
);
const BookIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={icon}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M12 6.042A8.967 8.967 0 0 0 6 3.75c-1.052 0-2.062.18-3 .512v14.25A8.987 8.987 0 0 1 6 18c2.305 0 4.408.867 6 2.292m0-14.25a8.966 8.966 0 0 1 6-2.292c1.052 0 2.062.18 3 .512v14.25A8.987 8.987 0 0 0 18 18a8.967 8.967 0 0 0-6 2.292m0-14.25v14.25" />
  </svg>
);
const MoonIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={icon}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M21.752 15.002A9.72 9.72 0 0 1 18 15.75c-5.385 0-9.75-4.365-9.75-9.75 0-1.33.266-2.597.748-3.752A9.753 9.753 0 0 0 3 11.25C3 16.635 7.365 21 12.75 21a9.753 9.753 0 0 0 9.002-5.998Z" />
  </svg>
);
const SunIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={icon}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M12 3v2.25m6.364.386-1.591 1.591M21 12h-2.25m-.386 6.364-1.591-1.591M12 18.75V21m-4.773-4.227-1.591 1.591M5.25 12H3m4.227-4.773L5.636 5.636M15.75 12a3.75 3.75 0 1 1-7.5 0 3.75 3.75 0 0 1 7.5 0Z" />
  </svg>
);

/** 상단 바: 로고 + 효과음 · BGM · 설명 · 테마 버튼 */
const Header = ({ dark, toggleDarkMode }: PropsFromRedux) => {
  const [bgmPlaying, setBgmPlaying] = useState(false);
  const [logoClicked, setLogoClicked] = useState(false);
  const audioRef = useRef<HTMLAudioElement>(null);
  const [soundOn, setSoundOn] = useRecoilState(soundEffectStatus);
  const [rulesOpen, setRulesOpen] = useRecoilState(rulesModalState);
  const playSound = useSound();

  useEffect(() => {
    document.documentElement.classList.toggle('dark', dark);
  }, [dark]);

  const toggleSound = () => {
    setSoundOn(!soundOn);
    trackEvent({ action: GA_EVENT.HEADER.TOGGLE_SOUND, category: 'header', label: !soundOn ? 'on' : 'off' });
  };

  const toggleMusic = () => {
    const audio = audioRef.current;
    if (!audio) return;
    if (bgmPlaying) audio.pause();
    else audio.play().catch((error) => console.error('오디오 재생 오류:', error));
    setBgmPlaying(!bgmPlaying);
    trackEvent({ action: GA_EVENT.HEADER.TOGGLE_MUSIC, category: 'header', label: !bgmPlaying ? 'on' : 'off' });
  };

  const openRules = () => {
    setRulesOpen(true);
    trackEvent({ action: GA_EVENT.HEADER.VIEW_TUTORIAL, category: 'header' });
  };

  const onLogoClick = () => {
    playSound(dark ? 'logoDark' : 'logoLight');
    setLogoClicked(true);
    window.setTimeout(() => setLogoClicked(false), 200);
  };

  return (
    <header className="relative z-30 mx-auto flex w-full max-w-[806px] items-center justify-between px-6 pt-5 pb-3 sm:px-0">
      <audio ref={audioRef} src="/audio/main_theme.mp3" loop />
      <button type="button" onClick={onLogoClick} className={`h-[27px] sm:h-[22px] ${logoClicked ? 'clicked' : ''}`} aria-label="WAG">
        <img className="h-full w-auto" src={dark ? '/images/WAG_dark.2.png' : '/images/WAG_white.2.png'} alt="WAG" />
      </button>

      <div className="flex items-center gap-3">
        <IconButton label={soundOn ? '효과음 끄기' : '효과음 켜기'} onClick={toggleSound}>
          {soundOn ? <SoundOnIcon /> : <SoundOffIcon />}
        </IconButton>
        <IconButton label={bgmPlaying ? '배경음악 멈추기' : '배경음악 재생'} onClick={toggleMusic}>
          {bgmPlaying ? <PauseIcon /> : <MusicIcon />}
        </IconButton>
        <IconButton label="게임 설명" onClick={openRules}>
          <BookIcon />
        </IconButton>
        <IconButton label={dark ? '라이트 모드' : '다크 모드'} onClick={() => toggleDarkMode('')}>
          {dark ? <MoonIcon /> : <SunIcon />}
        </IconButton>
      </div>

      <RulesModal open={rulesOpen} onClose={() => setRulesOpen(false)} />
    </header>
  );
};

const connector = connect((state: RootState) => ({ dark: state.dark.isDark }), { toggleDarkMode });
export default connector(Header);
