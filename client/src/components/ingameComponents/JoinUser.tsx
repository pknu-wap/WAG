import { ReactNode, forwardRef, useEffect, useState } from "react";
import { faUser } from "@fortawesome/free-regular-svg-icons";
import axios from "axios";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import IconButton from "../button/IconButton";
import { GameUserDto, IGetAnswerList, ReadyUserDto } from "../../types/dto";
import { faCrown } from "@fortawesome/free-solid-svg-icons";
import PopoverComponent from "../popover/Popover";

interface JoinUserProps {
  Nickname: string;
  isCaptain: boolean;
  isReady?: ReadyUserDto[];
  gameStart: boolean;
  currentCycle: number;
  gameUserDto: GameUserDto[];
  whoseTurn?: string;
  className: string;
  onClick?: () => void;
  children: ReactNode;
}

const JoinUser = forwardRef<HTMLDivElement, JoinUserProps>(
  ({ Nickname, isCaptain, isReady, gameStart, currentCycle, gameUserDto, whoseTurn, className, onClick, children }, ref) => {
    const roomId = localStorage.getItem("roomId");
    const myName = localStorage.getItem("nickName"); // 본인 이름 get
    const [userRank, setUserRank] = useState<number>(0) // 게임 시 먼저 맞췄을 때
    const [answer, setAnswer] = useState(""); // 정답어
    const [penaltyCount, setPenaltyCount] = useState(0); // 페널티 갯수 체크
    const [ready, setReady] = useState(false) // 레디 체크

    const [width, setWidth] = useState<number>(window.innerWidth); 
    
    const handleResize = () => {
      setWidth(window.innerWidth);
     };
  
    useEffect(() => {
      window.addEventListener("resize", handleResize);
      return () => {
        window.removeEventListener("resize", handleResize);
      }
    },[])
    
    const getGameAnswer = async () => {
      try {
        const response = await axios.get<IGetAnswerList>(
          "https://wwwag-backend.co.kr/answer/list",
          {
            params: {
              roomId: roomId,
              nickname: myName,
            },
          }
        );
        return response.data;
      } catch (error) {
        console.error("정답어 가져오기 중 오류발생 :", error);
        throw error;
      }
    };
    const findUserAnswer = async () => {
      const answerUsers = await getGameAnswer();
      answerUsers.answerUserDtos.forEach((dto) => {
        if (Nickname === dto.nickname) {
          setAnswer(dto.answer);
        }
      });
    };

    // 팝오버 버튼
    const [isPopoverOpen, setIsPopoverOpen] = useState(false);
    // 팝오버 열고 닫기
    const handleTogglePopover = () => {
      setIsPopoverOpen(!isPopoverOpen);
    };
    const openTollTip = () => {
      handleTogglePopover()
    }

    useEffect(() => {
      if (gameStart) {
        findUserAnswer();
      } else {
      }
    }, [currentCycle]);

    const checkIsReady = () => {
      isReady?.forEach((dto) => {
        if (Nickname === dto.roomNickname) {
          setReady(dto.ready)
        }
      })
    }
    useEffect(() => {
      checkIsReady()
    }, [isReady])

    // 패널티 갯수 확인
    const checkOtherPenalty = () => {
      gameUserDto.forEach((dto) => {
        if (Nickname === dto.roomNickname) {
          setPenaltyCount(dto.penalty);
          setIsPopoverOpen(false)
        }
      });
    };

    // 순위 확인
    const checkToRank = () => {
     gameUserDto.forEach((dto) => {
      if (Nickname === dto.roomNickname) {
        setUserRank(dto.ranking)
        if (1<= dto.ranking && dto.ranking <=3){
          setPenaltyCount(0)
        }
      }
     }) 
    }

    // 누구 턴인지 확인
    useEffect(() => {
      checkOtherPenalty();
      checkToRank();
    }, [gameUserDto]);

    return (
      <div
        ref={ref}
        className={`${className} flex flex-col justify-center items-center relative mx-1`}
      >
        {Nickname === whoseTurn ? ( // 내 턴일 때 주황색으로 프로필 색깔 바뀌도록
        <PopoverComponent 
          isOpen={isPopoverOpen} onToggle={handleTogglePopover}
          tooltipChildren={
            children
          }>
          <IconButton
          size="lg"
          className="items-center bg-[#FFA500] dark:bg-[#FFA500] relative"
          onClick={openTollTip}
          disabled={gameStart && myName !== Nickname && userRank === 0 ? false : true}
          >
            {gameStart ? (<>
              {width > 650 ? (
                <div className="w-20 h-6 rounded-md sm:text-lg text-[13px] text-[#FFA500] bg-[none] flex justify-center items-center sm:bottom-16 bottom-14 absolute">
                {answer}
              </div>
              ) : (
                <div className="w-20 h-6 rounded-md sm:text-lg text-[13px] text-[#FFA500] bg-[none] flex justify-center items-center sm:bottom-15 bottom-11 absolute">
                {answer}
              </div>
              )}
              </>
            ) : !gameStart && isCaptain ? ( // 대기방에서 방장 왕관
              <FontAwesomeIcon className="text-[#FFFF00] sm:bottom-14 bottom-10 absolute" icon={faCrown} />
            ) : (
              <div></div>
            )}
          <FontAwesomeIcon icon={faUser} size="xl" />
          </IconButton>
      </PopoverComponent>
        ) : (
          <PopoverComponent
            isOpen={isPopoverOpen} onToggle={handleTogglePopover}
            tooltipChildren={
              children
            }>
            <IconButton
            size="lg"
            className={`${gameStart || isCaptain || ready ? 
              "items-center bg-light-btn dark:bg-dark-btn relative" : 
              "items-center bg-[#A9A9A9] dark:bg-[#A9A9A9] relative"
            }`}
            onClick={openTollTip}
            disabled={gameStart && myName !== Nickname && userRank === 0 ? false : true}
            >
              {gameStart ? (
                <>
                {width > 650 ? (
                  <div className="w-20 h-6 rounded-md sm:text-lg text-[13px] text-[#FFA500] bg-[none] flex justify-center items-center sm:bottom-16 bottom-14 absolute z-50 ">
                  {answer}
                </div>
                ) : (
                  <div className="w-20 h-6 rounded-md sm:text-lg text-[13px] text-[#FFA500] bg-[none] flex justify-center items-center sm:bottom-15 bottom-11 absolute z-50">
                  {answer}
                </div>
                )}
                </>
              ) : !gameStart && isCaptain ? ( // 대기방에서 방장 왕관
                <FontAwesomeIcon className="text-[#FFFF00] sm:bottom-14 bottom-10 absolute z-50" icon={faCrown} />
              ) : (
                <div></div>
              )}
              <FontAwesomeIcon icon={faUser} size="xl" />
            </IconButton>
          </PopoverComponent>
        )}
        <div className="text-xs sm:text-sm lg:text-base text-base mt-2">{Nickname}</div>
        {penaltyCount === 0 ? (
          <div></div>
        ) : penaltyCount === 1 ? (
          <>
          {width > 650 ? (
            <div className="w-3 h-5 rounded absolute sm:top-12 sm:left-12 top-10 left-10 border-[0.1px] border-[#454141] bg-[#FFFF00]"></div>
          ) : (
            <div className="w-3 h-5 rounded absolute sm:top-12 sm:right-2 top-10 right-10 border-[0.1px] border-[#454141] bg-[#FFFF00]"></div>
          )}
          </>
          
        ) : penaltyCount === 2 ? (
          <>
          {width > 650 ? (
            <div className="absolute sm:top-12 sm:left-12 top-10 left-10 flex flex-column">
            <div className="w-3 h-5 rounded border-[0.1px] border-[#454141] rotate-[160deg] bg-[#FFFF00] relative"></div>
            <div className="w-3 h-5 rounded border-[0.1px] border-[#454141] rotate-[20deg] bg-[#FFFF00] left-[8px] top-[1px] absolute"></div>
          </div>
          ) : (
            <div className="absolute sm:top-12 sm:right-2 top-10 right-10 flex flex-column">
            <div className="w-3 h-5 rounded border-[0.1px] border-[#454141] rotate-[160deg] bg-[#FFFF00] relative"></div>
            <div className="w-3 h-5 rounded border-[0.1px] border-[#454141] rotate-[20deg] bg-[#FFFF00] left-[8px] top-[1px] absolute"></div>
          </div>
          )}
          
          </>
        ) : (
          <>
          {width > 650 ? (
            <div className="w-3 h-5 rounded absolute sm:top-12 sm:left-12 top-10 left-10 border-[0.1px] border-[#454141] bg-[#FF0000]"></div>
          ) : (
            <div className="w-3 h-5 rounded absolute sm:top-12 sm:right-2 top-10 right-10 border-[0.1px] border-[#454141] bg-[#FF0000]"></div>
          )}
          </>
          
        )}
        {userRank === 1 ? (
          <>
          {width > 650 ? (
            <div className="sm:w-12 w-10 sm:h-12 h-10 rounded absolute top-8 sm:left-11 left-7 z-10">
              <img className="z-10" src="/images/1st.png" alt="1st"></img>
          </div>
          ):(
            <div className="sm:w-12 w-10 sm:h-12 h-10 rounded absolute top-8 sm:right-10 right-12 z-10">
              <img className="z-10" src="/images/1st.png" alt="1st"></img>
          </div>
          )}
          </>
          
        ) : userRank === 2 ? (
          <>
          {width > 650 ? (
            <div className="sm:w-12 w-10 sm:h-12 h-10 rounded absolute top-8 sm:left-11 left-7 z-10">
            <img className="z-10" src="/images/2nd.png" alt="2nd"></img>
          </div>
          ):(
            <div className="sm:w-12 w-10 sm:h-12 h-10 rounded absolute top-8 sm:right-10 right-12 z-10">
            <img className="z-10" src="/images/2nd.png" alt="2nd"></img>
          </div>
          )}
          
          </>
        ) : userRank === 3 ? (
          <>
          {width > 650 ? (
            <div className="sm:w-12 w-10 sm:h-12 h-10 rounded absolute top-8 sm:left-11 left-7 z-10">
            <img className="z-10" src="/images/3rd.png" alt="3rd"></img>
          </div>
          ) :(
            <div className="sm:w-12 w-10 sm:h-12 h-10 rounded absolute top-8 sm:right-10 right-12 z-10">
            <img className="z-10" src="/images/3rd.png" alt="3rd"></img>
          </div>
          )}
          
          </>
        ) : (
          <div>
          </div>
        )}
      </div>
    );
  }
);

export default JoinUser;
