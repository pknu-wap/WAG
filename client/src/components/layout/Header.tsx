import * as React from "react";
import { useLocation } from "react-router-dom";
import { connect, ConnectedProps } from "react-redux";
import { RootState } from "../../modules/index";
import { toggleDarkMode } from "../../modules/darkSlice";
import { IconButton } from '../../shared';
import RulesModal from "../modal/RulesModal";
import { useRecoilState } from "recoil";
import { rulesModalState, soundEffectStatus } from "../../recoil/recoil";
import { faTruckField } from "@fortawesome/free-solid-svg-icons";
import Footer from "./Footer";
import "./MusicButtonAnim.css";
import { trackEvent, GA_EVENT } from '../../shared';


const { useEffect, useState, useRef } = React;

type Props = {
  children?: React.ReactNode;
};

type PropsFromRedux = ConnectedProps<typeof connector>;
type ComponentProps = Props & PropsFromRedux;

const Header = ({ dark, toggleDarkMode }: ComponentProps) => {
  const location = useLocation();
  // Click Me 텍스트 노출 여부 (localStorage로 영구 저장)
  const [showClickMe, setShowClickMe] = useState(() => {
    return localStorage.getItem('hideMusicClickMe') !== 'true';
  });

  // 버튼 클릭 시 Click Me 텍스트 숨김
  const handleMusicButtonClick = () => {
    handlePlayMusic();
    if (showClickMe) {
      setShowClickMe(false);
      localStorage.setItem('hideMusicClickMe', 'true');
    }
  };

  const [play, setPlay] = useState(false);
  const [musicIndex, setMusicIndex] = useState(0); // 0: 1번, 1: 2번
  const [isClicked, setIsClicked] = useState(false)
  const audioRef = useRef<HTMLAudioElement>(null);
  const [audioSrc, setAudioSrc] = useState("/audio/main_theme.mp3");

  useEffect(() => {
    if (dark) {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
  }, [dark]);

  const [playSoundEffect, setPlaySoundEffect] = useRecoilState(soundEffectStatus);
  const handlePlaySoundEffect = () => {
    setPlaySoundEffect(!playSoundEffect);

    trackEvent({
      action: GA_EVENT.HEADER.TOGGLE_SOUND,
      category: "header",
      label: !playSoundEffect ? "on" : "off",
    });
  };


  const handlePlayMusic = () => {
    const audio = audioRef.current;
    const files = [
      "/audio/main_theme_chirstmas_1_cut.mp3",
      "/audio/main_theme_chirstmas_2_cut.mp3"
    ];
    if (audio) {
      if (play) {
        audio.pause();
      } else {
        // 순서대로 재생
        setAudioSrc(files[musicIndex]);
        setTimeout(() => {
          if (audioRef.current) {
            audioRef.current.load();
            audioRef.current.play().catch((error) => {
              console.error("오디오 재생 오류:", error);
            });
          }
        }, 0);
        setMusicIndex((prev) => (prev + 1) % files.length);
      }
      setPlay(!play);
      trackEvent({
        action: GA_EVENT.HEADER.TOGGLE_MUSIC,
        category: "header",
        label: !play ? "on" : "off",
      });
    }
  };


  const [, setIsOpen] = useRecoilState(rulesModalState);
  // 어떤 버튼에서 RulesModal을 열었는지 구분하는 state 추가
  const [rulesModalType, setRulesModalType] = useState<'logo' | 'default' | null>(null);

  // 기존 버튼에서 모달 오픈
  const openModal = () => {
    setIsOpen(true);
    setRulesModalType('default');
    trackEvent({
      action: GA_EVENT.HEADER.VIEW_TUTORIAL,
      category: "header",
    });
  };
  // 로고에서 모달 오픈
  const openLogoModal = () => {
    setIsOpen(true);
    setRulesModalType('logo');
  };

  const closeModal = () => {
    setIsOpen(false);
    setRulesModalType(null);
  };

  function isChrome() {
    const userAgent = window.navigator.userAgent;
    //console.log(userAgent);
    return userAgent.includes('Chrome') || userAgent.includes('Safari');
  }

  const handleLightLogoClick = () => {

    const playSound = () => {
      const audio = new Audio('/audio/lightmode_wag.mp3'); // 새로운 audio 요소 생성
      audio.play(); // 소리를 재생합니다.
    };

    if (playSoundEffect) {
      playSound();
    }

  }

  const handleDarkLogoClick = () => {

    const playSound = () => {
      const audio = new Audio('/audio/darkmode_wag.mp3'); // 새로운 audio 요소 생성
      audio.play(); // 소리를 재생합니다.
    };

    if (playSoundEffect) {
      playSound();
    }

  }

  // Event! 텍스트 노출 여부 (localStorage로 영구 저장)

  const [showEventText, setShowEventText] = useState(true);
  useEffect(() => {
    if (localStorage.getItem('hideEventText') === 'true') {
      setShowEventText(false);
    }
  }, []);

  const handleLogoClick = (mode: 'dark' | 'light') => {
    if (mode === 'dark') handleDarkLogoClick();
    else handleLightLogoClick();
    setIsClicked(true);
    setTimeout(() => {
      setIsClicked(false);
      if (showEventText) {
        localStorage.setItem('hideEventText', 'true');
        setShowEventText(false);
      }
    }, 200);
    if (location.pathname === '/') {
      openLogoModal(); // 첫 화면에서만 모달 오픈
    }
  };

  return (
    <header className="m-5 z-50">
      <div className="flex justify-between z-50">
        <div className="relative top-2 flex flex-col items-center">
          {dark ? (
            <img
              className={`w-24 h-20 -mt-5 ${isClicked ? 'clicked' : ''}`}
              src="/images/WAG_dark.2.png"
              alt="logo dark mode"
              onClick={() => handleLogoClick('dark')}
            />
          ) : (
            <img
              className={`w-24 h-20 -mt-5 ${isClicked ? 'clicked' : ''}`}
              src="/images/WAG_white.2.png"
              alt="logo light mode"
              onClick={() => handleLogoClick('light')}
            />
          )}
          {showEventText && (
            <span
              className="-mt-3 text-xs font-bold text-[#ff5252] dark:text-[#2ecc40] animate-bounce select-none"
              style={{
                animationDuration: '0.8s',
                animationTimingFunction: 'cubic-bezier(.68,-0.55,.27,1.55)',
                userSelect: 'none',
              }}
            >
              Event!
            </span>
          )}
        </div>
        <div className="flex justify-between z-50">
          <audio ref={audioRef} src={audioSrc} loop />
          {isChrome() ? (
            <>
              <IconButton
                className={`z-50 mr-3 transition-colors duration-200
                bg-[#2ecc40] dark:bg-[#b71c1c] 
                hover:bg-[#27ae60] dark:hover:bg-[#c62828]
                active:bg-[#229d3a] dark:active:bg-[#8e0000]
                shadow-lg`}
                size="md"
                onClick={() => {
                  handlePlaySoundEffect();
                }}
              >
                {/* 눈꽃 or 기존 아이콘 - 크리스마스 느낌 색상 */}
                {playSoundEffect ? (
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor" className="size-6 text-white dark:text-yellow-300 drop-shadow-[0_1px_4px_rgba(0,0,0,0.3)]">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M19.114 5.636a9 9 0 0 1 0 12.728M16.463 8.288a5.25 5.25 0 0 1 0 7.424M6.75 8.25l4.72-4.72a.75.75 0 0 1 1.28.53v15.88a.75.75 0 0 1-1.28.53l-4.72-4.72H4.51c-.88 0-1.704-.507-1.938-1.354A9.009 9.009 0 0 1 2.25 12c0-.83.112-1.633.322-2.396C2.806 8.756 3.63 8.25 4.51 8.25H6.75Z" />
                  </svg>
                ) : (
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor" className="size-6 text-white dark:text-yellow-300 drop-shadow-[0_1px_4px_rgba(0,0,0,0.3)]">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M17.25 9.75 19.5 12m0 0 2.25 2.25M19.5 12l2.25-2.25M19.5 12l-2.25 2.25m-10.5-6 4.72-4.72a.75.75 0 0 1 1.28.53v15.88a.75.75 0 0 1-1.28.53l-4.72-4.72H4.51c-.88 0-1.704-.507-1.938-1.354A9.009 9.009 0 0 1 2.25 12c0-.83.112-1.633.322-2.396C2.806 8.756 3.63 8.25 4.51 8.25H6.75Z" />
                  </svg>
                )}
              </IconButton>

                  <div className="mr-3 flex flex-col items-center">
                    <IconButton
                      className={`z-50 music-anim-btn transition-colors duration-200
                      bg-[#2ecc40] dark:bg-[#b71c1c] 
                      hover:bg-[#27ae60] dark:hover:bg-[#c62828]
                      active:bg-[#229d3a] dark:active:bg-[#8e0000]
                      shadow-lg`}
                      size="md"
                      onClick={handleMusicButtonClick}
                    >
                      {/* 눈꽃 아이콘 SVG - 크리스마스 느낌 색상 */}
                      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5"
                        stroke="currentColor"
                        className="size-6 text-white dark:text-yellow-300 drop-shadow-[0_1px_4px_rgba(0,0,0,0.3)]"
                      >
                        <path strokeLinecap="round" strokeLinejoin="round" d="M12 2v20m10-10H2m16.95-6.95-13.9 13.9m0-13.9 13.9 13.9" />
                      </svg>
                    </IconButton>
                    {/* Click Me! 통통 튀는 텍스트 */}
                    {showClickMe && (
                      <span
                        className="mt-2 text-xs font-bold text-[#2ecc40] dark:text-[#ff5252] animate-bounce"
                        style={{
                          animationDuration: '0.8s',
                          animationTimingFunction: 'cubic-bezier(.68,-0.55,.27,1.55)',
                          userSelect: 'none',
                        }}
                      >
                        Music!
                      </span>
                    )}
                  </div>

              <IconButton
                className={`z-50 mr-3 transition-colors duration-200
                bg-[#2ecc40] dark:bg-[#b71c1c] 
                hover:bg-[#27ae60] dark:hover:bg-[#c62828]
                active:bg-[#229d3a] dark:active:bg-[#8e0000]
                shadow-lg`}
                size="md"
                onClick={() => {
                  openModal();
                }}
              >
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor" className="size-6 text-white dark:text-yellow-300 drop-shadow-[0_1px_4px_rgba(0,0,0,0.3)]">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 6.042A8.967 8.967 0 0 0 6 3.75c-1.052 0-2.062.18-3 .512v14.25A8.987 8.987 0 0 1 6 18c2.305 0 4.408.867 6 2.292m0-14.25a8.966 8.966 0 0 1 6-2.292c1.052 0 2.062.18 3 .512v14.25A8.987 8.987 0 0 0 18 18a8.967 8.967 0 0 0-6 2.292m0-14.25v14.25" />
                </svg>
              </IconButton>

              <IconButton
                className={`z-50 transition-colors duration-200
                bg-[#2ecc40] dark:bg-[#b71c1c] 
                hover:bg-[#27ae60] dark:hover:bg-[#c62828]
                active:bg-[#229d3a] dark:active:bg-[#8e0000]
                shadow-lg`}
                size="md"
                onClick={() => {
                  toggleDarkMode("");
                }}
              >
                {dark ? (
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="size-6 text-white dark:text-yellow-300 drop-shadow-[0_1px_4px_rgba(0,0,0,0.3)]">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M21.752 15.002A9.72 9.72 0 0 1 18 15.75c-5.385 0-9.75-4.365-9.75-9.75 0-1.33.266-2.597.748-3.752A9.753 9.753 0 0 0 3 11.25C3 16.635 7.365 21 12.75 21a9.753 9.753 0 0 0 9.002-5.998Z" />
                  </svg>
                ) : (
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor" className="size-6 text-white dark:text-yellow-300 drop-shadow-[0_1px_4px_rgba(0,0,0,0.3)]">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 3v2.25m6.364.386-1.591 1.591M21 12h-2.25m-.386 6.364-1.591-1.591M12 18.75V21m-4.773-4.227-1.591 1.591M5.25 12H3m4.227-4.773L5.636 5.636M15.75 12a3.75 3.75 0 1 1-7.5 0 3.75 3.75 0 0 1 7.5 0Z" />
                  </svg>
                )}
              </IconButton>


              <RulesModal onRequestClose={closeModal}>
                {rulesModalType === 'logo' ? (
                  <div className="text-light-text dark:text-dark-text flex justify-center items-center">
                    <div className="justify-center items-center">
                      <div className="w-full max-w-xl bg-white dark:bg-[#222] rounded-2xl shadow-lg border border-red-200 dark:border-red-400 p-6 mb-6 mt-8 animate-fade-in">
                        <div className="flex items-center justify-center mb-2">
                          <span className="text-2xl md:text-3xl">🎄</span>
                          <span className="text-xl md:text-2xl font-extrabold text-red-600 ml-2">크리스마스 이벤트</span>
                          <span className="text-2xl md:text-3xl ml-2">🎄</span>
                        </div>
                        <div className="text-center text-base md:text-lg font-semibold text-[#2ecc40] dark:text-[#b2ffb2] mb-4">WAG에 눈 내리는 크리스마스가 왔어요!<br/>어떤 이벤트가 있는지 볼까요?</div>
                        <hr className="border-t-2 border-dashed border-red-300 mb-4" />
                        <div className="mb-6 flex flex-col gap-6">
                          {/* 인스타그램 팔로우 이벤트 카드 */}
                          <div className="bg-gradient-to-br from-pink-100 via-white to-blue-100 dark:from-[#3a2a3a] dark:via-[#222] dark:to-[#2a3a4a] rounded-xl p-5 shadow-md border border-pink-200 dark:border-pink-400">
                            <div className="flex items-center mb-2">
                              <span className="inline-block px-3 py-1 bg-pink-500 text-white text-xs font-bold rounded-full mr-2">EVENT 1</span>
                              <span className="text-base md:text-lg font-bold text-pink-600">WAG 인스타그램 계정 팔로우 이벤트</span>
                              <span className="ml-2">💌</span>
                            </div>
                            <div className="flex justify-center mb-3">
                              <a
                                href="https://www.instagram.com/wag_game?igsh=MTJzeXFlcjJ4cjd2cg%3D%3D&utm_source=qr"
                                target="_blank"
                                rel="noopener noreferrer"
                                className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-pink-400 to-pink-600 hover:from-pink-500 hover:to-pink-700 text-white font-bold rounded-full shadow transition-colors duration-200"
                              >
                                <img src="/images/instagram.png" alt="Instagram" className="w-5 h-5 mr-1" style={{minWidth:'20px', minHeight:'20px'}} />
                                <span>WAG 인스타그램 바로가기</span>
                              </a>
                            </div>
                            <div className="text-sm md:text-base font-semibold text-gray-800 dark:text-gray-100 mb-2">
                              <span className="inline-block px-2 py-1 bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-200 rounded mr-2">1단계</span>
                              WAG 인스타그램 계정 <span className="font-bold text-blue-600">팔로우</span> & 모든 게시물 <span className="font-bold text-pink-500">좋아요</span>
                            </div>
                            <div className="text-sm md:text-base font-semibold text-gray-800 dark:text-gray-100 mb-2">
                              <span className="inline-block px-2 py-1 bg-green-100 dark:bg-green-900 text-green-700 dark:text-green-200 rounded mr-2">2단계</span>
                              5명의 다른 플레이어와 <span className="font-bold text-green-600">같이 게임</span>한 <span className="font-bold text-yellow-600">스크린샷</span>을 DM으로 보내주세요!
                            </div>
                            <div className="flex flex-col items-center justify-center gap-2 mt-4 mb-2">
                              <div className="flex flex-col items-center w-full max-w-xs">
                                <span className="inline-block w-full text-center px-4 py-2 mb-1 bg-gradient-to-r from-yellow-200 via-yellow-100 to-yellow-300 dark:from-yellow-900 dark:via-yellow-800 dark:to-yellow-900 text-yellow-900 dark:text-yellow-200 rounded-xl text-base font-extrabold shadow-sm border border-yellow-300 dark:border-yellow-700">🏆 1등 : <span className="text-blue-700 dark:text-blue-200">배달의민족 상품권 5만원</span></span>
                                <span className="inline-block w-full text-center px-4 py-2 mb-1 bg-gradient-to-r from-blue-100 via-white to-blue-200 dark:from-blue-900 dark:via-blue-800 dark:to-blue-900 text-blue-800 dark:text-blue-100 rounded-xl text-base font-bold shadow-sm border border-blue-200 dark:border-blue-700">🥈 2등 : <span className="text-blue-700 dark:text-blue-200">배달의민족 상품권 3만원</span></span>
                                <span className="inline-block w-full text-center px-4 py-2 mb-1 bg-gradient-to-r from-gray-100 via-white to-gray-200 dark:from-gray-800 dark:via-gray-700 dark:to-gray-900 text-gray-800 dark:text-gray-100 rounded-xl text-base font-bold shadow-sm border border-gray-200 dark:border-gray-700">🥉 3등 : <span className="text-blue-700 dark:text-blue-200">배달의민족 상품권 1만원</span></span>
                                <span className="inline-block w-full text-center px-4 py-2 mt-1 bg-gradient-to-r from-red-100 via-white to-pink-200 dark:from-red-900 dark:via-red-800 dark:to-pink-900 text-red-700 dark:text-red-200 rounded-xl text-base font-bold shadow-sm border border-red-200 dark:border-red-700">🎁 마지막 통과자 : <span className="text-red-500 dark:text-red-200">??? (히든 선물)</span></span>
                              </div>
                            </div>
                          </div>
                          {/* 산타를 찾아라 카드 */}
                          <div className="bg-gradient-to-br from-green-100 via-white to-yellow-100 dark:from-[#2a3a2a] dark:via-[#222] dark:to-[#3a3a2a] rounded-xl p-5 shadow-md border border-green-200 dark:border-green-400">
                            <div className="flex items-center mb-2">
                              <span className="inline-block px-3 py-1 bg-green-600 text-white text-xs font-bold rounded-full mr-2">EVENT 2</span>
                              <span className="text-base md:text-lg font-bold text-green-700">산타를 찾아라!</span>
                              <span className="ml-2">🎅</span>
                            </div>
                            <div className="text-sm md:text-base font-semibold text-gray-800 dark:text-gray-100 mb-2">
                              <span className="inline-block px-2 py-1 bg-red-100 dark:bg-red-900 text-red-700 dark:text-red-200 rounded mr-2">조건 : </span>
                              본인의 정답어가 <span className="font-bold text-red-500">“산타”</span>였다면?
                            </div>
                            <div className="text-sm md:text-base font-semibold text-gray-800 dark:text-gray-100 mb-2">
                              <span className="inline-block px-2 py-1 bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-200 rounded mr-2">참여 : </span>
                              WAG 인스타그램 <span className="font-bold text-blue-600">팔로우</span> 후, <span className="font-bold text-yellow-600">정답 인증 사진</span>을 DM으로 보내주세요!
                            </div>
                            <div className="flex flex-wrap gap-2 mt-3 mb-2">
                              <span className="inline-block w-full text-center px-4 py-2 mt-1 bg-gradient-to-r from-red-100 via-white to-pink-200 dark:from-red-900 dark:via-red-800 dark:to-pink-900 text-red-700 dark:text-red-200 rounded-xl text-base font-bold shadow-sm border border-red-200 dark:border-red-700">🎁 당첨자 : <span className="text-red-500 dark:text-red-200">??? (히든 선물)</span></span>
                            </div>
                          </div>
                        </div>
                        <hr className="border-t-2 border-dashed border-green-400 mb-4" />
                        <div className="text-center text-base md:text-lg font-bold text-green-700 dark:text-green-300 mb-2">
                          이벤트 기간 : <span className="underline">12월 24일 밤 10시 ~ 12월 26일 밤 10시</span>
                        </div>
                                                    <div className="flex justify-center mb-3">
                              <a
                                href="https://www.instagram.com/wag_game?igsh=MTJzeXFlcjJ4cjd2cg%3D%3D&utm_source=qr"
                                target="_blank"
                                rel="noopener noreferrer"
                                className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-pink-400 to-pink-600 hover:from-pink-500 hover:to-pink-700 text-white font-bold rounded-full shadow transition-colors duration-200"
                              >
                                <img src="/images/instagram.png" alt="Instagram" className="w-5 h-5 mr-1" style={{minWidth:'20px', minHeight:'20px'}} />
                                <span>WAG 인스타그램 바로가기</span>
                              </a>
                            </div>
                        
                      </div>
                      <Footer />
                    </div>
                  </div>
                ) : rulesModalType === 'default' ? (
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
                      <Footer />
                    </div>
                  </div>
                ) : null}
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
