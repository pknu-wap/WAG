import * as React from "react";
import { connect, ConnectedProps } from "react-redux";
import { RootState } from "../../modules/index";
import { toggleDarkMode } from "../../modules/darkSlice";
import IconButton from "../button/IconButton";
import RulesModal from "../modal/RulesModal";
import { useRecoilState } from "recoil";
import { rulesModalState, soundEffectStatus } from "../../recoil/recoil";
import { faTruckField } from "@fortawesome/free-solid-svg-icons";
const { useEffect, useState, useRef } = React;

type Props = {
  children?: React.ReactNode;
};

type PropsFromRedux = ConnectedProps<typeof connector>;
type ComponentProps = Props & PropsFromRedux;

const Header = ({ dark, toggleDarkMode }: ComponentProps) => {

  const [play, setPlay] = useState(false);
  const [isClicked, setIsClicked] = useState(false)
  const audioRef = useRef<HTMLAudioElement>(null);

  useEffect(() => {
    if (dark) {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
  }, [dark]);

  const [playSoundEffect, setPlaySoundEffect] = useRecoilState(soundEffectStatus);
  const handlePlaySoundEffect = () => {
    //console.log(!playSoundEffect)
    setPlaySoundEffect(!playSoundEffect)
  }

  const handlePlayMusic = () => {
    const audio = audioRef.current;
    if (audio) {
      if (play) {
        audio.pause();
      } else {
        audio.play().catch((error) => {
          console.error('오디오 재생 오류:', error);
        });
      }
      setPlay(!play);
    }
  };

  const [, setIsOpen] = useRecoilState(rulesModalState);
  const openModal = () => {
    setIsOpen(true);
  };
  const closeModal = () => {
    setIsOpen(false);
  };

  function isChrome() {
    const userAgent = window.navigator.userAgent;
    //console.log(userAgent);
    return userAgent.includes('Chrome') || userAgent.includes('Safari');
  }

  const handleLightLogoClick = () => {
    
    const playSound = () => {
      const audio = new Audio('audio/lightmode_wag.mp3'); // 새로운 audio 요소 생성
      audio.play(); // 소리를 재생합니다.
    };
    
    if (playSoundEffect){
      playSound();
    }
    
  }

  const handleDarkLogoClick = () => {
    
    const playSound = () => {
      const audio = new Audio('audio/darkmode_wag.mp3'); // 새로운 audio 요소 생성
      audio.play(); // 소리를 재생합니다.
    };
    
    if (playSoundEffect){
      playSound();
    }
    
  }

  return (
    <header className="m-5 z-50">
      <div className="flex justify-between z-50">
        <div className="relative top-2">
      {dark ? (

<img className={`w-20 h-16 ${isClicked ? 'clicked' : ''}`} src="images/WAG_dark.2.png" 
  alt="logo dark mode"
  onClick={() => {
    handleDarkLogoClick();
    setIsClicked(true); // 클릭될 때마다 isClicked 상태를 true로 설정하여 애니메이션을 발생시킵니다.
    setTimeout(() => setIsClicked(false), 200);
    }}>

  </img>
  
    ) : (
      <img className={`w-20 h-16 ${isClicked ? 'clicked' : ''}`} src="images/WAG_white.2.png" 
      alt="logo light mode"
      onClick={() => {
        handleLightLogoClick();
        setIsClicked(true); // 클릭될 때마다 isClicked 상태를 true로 설정하여 애니메이션을 발생시킵니다.
        setTimeout(() => setIsClicked(false), 200);
        }}>

      </img>
    )}
    </div>
    <div className="flex justify-between z-50">
        <audio ref={audioRef} src='audio/main_theme.mp3' loop />
        {isChrome() ? (
          <>
              <IconButton
              className="z-50 mr-3"
              size="md"
              onClick={() => {
                handlePlaySoundEffect();
              }}
            >
              {playSoundEffect ? (
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" className="size-6">
                  <path stroke-linecap="round" stroke-linejoin="round" d="M19.114 5.636a9 9 0 0 1 0 12.728M16.463 8.288a5.25 5.25 0 0 1 0 7.424M6.75 8.25l4.72-4.72a.75.75 0 0 1 1.28.53v15.88a.75.75 0 0 1-1.28.53l-4.72-4.72H4.51c-.88 0-1.704-.507-1.938-1.354A9.009 9.009 0 0 1 2.25 12c0-.83.112-1.633.322-2.396C2.806 8.756 3.63 8.25 4.51 8.25H6.75Z" />
              </svg>
              
              ) : (
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" className="size-6">
                  <path stroke-linecap="round" stroke-linejoin="round" d="M17.25 9.75 19.5 12m0 0 2.25 2.25M19.5 12l2.25-2.25M19.5 12l-2.25 2.25m-10.5-6 4.72-4.72a.75.75 0 0 1 1.28.53v15.88a.75.75 0 0 1-1.28.53l-4.72-4.72H4.51c-.88 0-1.704-.507-1.938-1.354A9.009 9.009 0 0 1 2.25 12c0-.83.112-1.633.322-2.396C2.806 8.756 3.63 8.25 4.51 8.25H6.75Z" />
                </svg>
              )}
            </IconButton>

            <IconButton
              className="z-50 mr-3"
              size="md"
              onClick={() => {
                handlePlayMusic();
              }}
            >
              {play ? (
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" className="size-6">
                  <path stroke-linecap="round" stroke-linejoin="round" d="M15.75 5.25v13.5m-7.5-13.5v13.5" />
                </svg>
              ) : (
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" className="size-6">
                  <path stroke-linecap="round" stroke-linejoin="round" d="m9 9 10.5-3m0 6.553v3.75a2.25 2.25 0 0 1-1.632 2.163l-1.32.377a1.803 1.803 0 1 1-.99-3.467l2.31-.66a2.25 2.25 0 0 0 1.632-2.163Zm0 0V2.25L9 5.25v10.303m0 0v3.75a2.25 2.25 0 0 1-1.632 2.163l-1.32.377a1.803 1.803 0 0 1-.99-3.467l2.31-.66A2.25 2.25 0 0 0 9 15.553Z" />
                </svg>
              )}
            </IconButton>

            <IconButton
              className="z-50 mr-3"
              size="md"
              onClick={() => {
                openModal();
              }}
            >
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" className="size-6">
                <path stroke-linecap="round" stroke-linejoin="round" d="M12 6.042A8.967 8.967 0 0 0 6 3.75c-1.052 0-2.062.18-3 .512v14.25A8.987 8.987 0 0 1 6 18c2.305 0 4.408.867 6 2.292m0-14.25a8.966 8.966 0 0 1 6-2.292c1.052 0 2.062.18 3 .512v14.25A8.987 8.987 0 0 0 18 18a8.967 8.967 0 0 0-6 2.292m0-14.25v14.25" />
              </svg>
            </IconButton>

            <IconButton
              className="z-50"
              size="md"
              onClick={() => {
                toggleDarkMode("");
              }}
            >
              {dark ? (
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="size-6">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M21.752 15.002A9.72 9.72 0 0 1 18 15.75c-5.385 0-9.75-4.365-9.75-9.75 0-1.33.266-2.597.748-3.752A9.753 9.753 0 0 0 3 11.25C3 16.635 7.365 21 12.75 21a9.753 9.753 0 0 0 9.002-5.998Z" />
                </svg>
              ) : (
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="size-6">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 3v2.25m6.364.386-1.591 1.591M21 12h-2.25m-.386 6.364-1.591-1.591M12 18.75V21m-4.773-4.227-1.591 1.591M5.25 12H3m4.227-4.773L5.636 5.636M15.75 12a3.75 3.75 0 1 1-7.5 0 3.75 3.75 0 0 1 7.5 0Z" />
                </svg>
              )}
            </IconButton>
            

            <RulesModal onRequestClose={closeModal}>
              <div className="text-light-text dark:text-dark-text flex justify-center items-center">
                <div className="p-10 justify-center items-center">
                  <div className="text-2xl font-bold mb-5">🎉 양세찬 게임을 즐기는 방법! 👍</div>

                  <div className="text-base mb-3">1. 크롬 브라우저로 접속하시고, 방에 입장하시거나 방을 생성합니다.</div>
                  <div className="text-base mb-3">2. 방장은 방의 모든 유저가 "준비 완료" 되면 시작이 가능합니다.</div>
                  <div className="text-base mb-3">3. 게임 시작 시 유저마다 인물/캐릭터가 배당됩니다.</div>
                  <div className="text-base mb-3">4. 자신의 턴에 질문과 정답이 각각 1번씩 가능합니다.</div>
                  <div className="text-base mb-5">5. 다만, 1라운드에는 질문만 가능합니다!</div>
                  <div className="text-sm font-bold mb-5">⚠️ 편안한 게임 환경을 위해 Chrome 브라우저로 접속하시는 것을 권장드립니다</div>
                  <div className="text-sm font-bold mb-5">🙋 더 자세한 설명은 <a className="italic underline" href="https://charming-scooter-24d.notion.site/d36c86d7665247e2bcf2a73a02e096b4">이 링크</a> 를 참고해주세요!</div>
                </div>
              </div>
            </RulesModal>
          </>
        ) : null}
        </div>
      </div>
    </header>
  );
};

const connector = connect((state: RootState) => ({ dark: state.dark.isDark }), {
  toggleDarkMode,
});
export default connector(Header);
