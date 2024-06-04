import * as React from "react";
import { connect, ConnectedProps } from "react-redux";
import { RootState } from "../../modules/index";
import { toggleDarkMode } from "../../modules/darkSlice";
import IconButton from "../button/IconButton";
import RulesModal from "../modal/RulesModal";
import { useRecoilState } from "recoil";
import { rulesModalState } from "../../recoil/recoil";
const { useEffect, useState } = React;

type Props = {
  children?: React.ReactNode;
};

type PropsFromRedux = ConnectedProps<typeof connector>;
type ComponentProps = Props & PropsFromRedux;

const Header = ({ dark, toggleDarkMode }: ComponentProps) => {

  const [play, setPlay] = useState(false)
  const [audio, setAudio] = useState<HTMLAudioElement>(new Audio('https://rr4---sn-3pm7kn7z.googlevideo.com/videoplayback?expire=1717540312&ei=eEFfZtXtF9Wji9oPs-GI2AY&ip=167.172.167.118&id=o-AHVgWoaXyY9iaQ75Vp1K7aHPEEzY_KdS65jz2Hfc5Y2f&itag=140&source=youtube&requiressl=yes&xpc=EgVo2aDSNQ%3D%3D&bui=AbKP-1M2I5U67Nd5vBVMwIfoUNYp4zoEGbf5mVfNxiuicQa0C9iYGjJ-YyqgrGXQpNLlVqJ-vGxxX1nG&spc=UWF9fzanhA98WDH-8H2AeiG5IY80dBfmSCQkRgDNme5nnJffdNQaHkAMzw&vprv=1&svpuc=1&mime=audio%2Fmp4&ns=TpfUfSBOrS3DVkIWOtjImD8Q&rqh=1&gir=yes&clen=607427681&dur=37532.825&lmt=1687252088977279&keepalive=yes&c=MWEB&sefc=1&txp=5532434&n=zonIiOEal32zAA&sparams=expire%2Cei%2Cip%2Cid%2Citag%2Csource%2Crequiressl%2Cxpc%2Cbui%2Cspc%2Cvprv%2Csvpuc%2Cmime%2Cns%2Crqh%2Cgir%2Cclen%2Cdur%2Clmt&sig=AJfQdSswRQIgNewMUe4kMdG9YN8rzt7tT_R7iZaKhJ1tJVlvZZeyO4YCIQCBbv1aoan3w8QMJuPmejWwCyX3SYD6KxnDU0Qx07IGWw%3D%3D&title=Playlist+%7C+%EC%8B%9C%EC%9B%90%ED%95%9C+%EB%B3%B4%EC%82%AC%EB%85%B8%EB%B0%94+%EC%9E%AC%EC%A6%88%EC%97%90+%ED%92%8D%EB%8D%A9%F0%9F%8C%8A+%7C+Summer+Bossa+Nova+Jazz&redirect_counter=1&rm=sn-4g5e6l7z&fexp=24350458,24350467,24350477&req_id=a056172f6809a3ee&cms_redirect=yes&cmsv=e&ipbypass=yes&mh=CC&mip=222.96.226.78&mm=31&mn=sn-3pm7kn7z&ms=au&mt=1717517541&mv=u&mvi=4&pl=13&lsparams=ipbypass,mh,mip,mm,mn,ms,mv,mvi,pl&lsig=AHlkHjAwRgIhAKyKCFSOwpH1hgyp5ks1a7jRcq3GLfO4zh3USxBm3wZcAiEArVDE7ub2HzpWaDg_SFnzd9MdKPeBltvbMU_YWunA5Eo%3D'))
  
  useEffect(() => {
    if (dark) {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
  }, [dark]);

    const handlePlayMusic = () => {
      // if (!audio) {
      //   console.log(audio)
      //   setAudio(new Audio('audio/mainpage_theme.mp3')) // 음악 파일 경로를 넣어주세요
      //   audio.loop = true; // 음악을 반복 재생하고 싶다면 설정
      // }
    
      if (!play) {
        setPlay(true)
        audio.loop = true
        audio.play();
      } else {
        setPlay(false)
        audio.loop= false
        audio.pause();
      }
      
  };

  const [, setIsOpen] = useRecoilState(rulesModalState);
  const openModal = () => {
    setIsOpen(true);
  };
  const closeModal = () => {
    setIsOpen(false);
  };
  
  return (
    <header className="m-5 z-50">
      <div className="flex justify-end z-50">
      <IconButton
          className="z-50 mr-3"
          size="md"
          onClick={() => {
            handlePlayMusic();
          }}
        >
          {play ? (<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" className="size-6">
              <path stroke-linecap="round" stroke-linejoin="round" d="M15.75 5.25v13.5m-7.5-13.5v13.5" />
            </svg>) : (<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" className="size-6">
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
      </div>
    </header>
  );
};

const connector = connect((state: RootState) => ({ dark: state.dark.isDark }), {
  toggleDarkMode,
});
export default connector(Header);
