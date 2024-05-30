import { ReactNode, forwardRef, useEffect, useState } from "react";
import { faUser } from "@fortawesome/free-regular-svg-icons";
import axios from "axios";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import IconButton from "../button/IconButton";
import { GameUserDto, IGetAnswerList, ReadyUserDto } from "../../types/dto";
import { faCrown } from "@fortawesome/free-solid-svg-icons";

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

    const getGameAnswer = async () => {
      try {
        const response = await axios.get<IGetAnswerList>(
          "http://wwwag-backend.co.kr/answer/list",
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

    useEffect(() => {
      if (gameStart) {
        findUserAnswer();
      } else {
        console.log("게임 시작 전");
      }
    }, [currentCycle]);

    const [opacity, setOpacity] = useState("opacity-0");
    const openTollTip = () => {
      if (opacity === "opacity-0") {
        setOpacity("opacity-100");
      } else {
        setOpacity("opacity-0");
      }
    };
    const checkIsReady = () => {
      console.log(isReady)
      isReady?.forEach((dto) => {
        if (Nickname === dto.roomNickname) {
          setReady(dto.ready)
        }
      })
    }
    useEffect(() => {
      checkIsReady()
      console.log(gameStart)
      console.log(ready)
    }, [isReady])

    // 패널티 갯수 확인
    const checkOtherPenalty = () => {
      gameUserDto.forEach((dto) => {
        if (Nickname === dto.roomNickname) {
          setPenaltyCount(dto.penalty);
          setOpacity("opacity-0");
        }
      });
    };

    // 순위 확인
    const checkToRank = () => {
     gameUserDto.forEach((dto) => {
      if (Nickname === dto.roomNickname) {
        setUserRank(dto.ranking)
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
        className={`${className} flex flex-col items-center relative`}
      >
        {Nickname === whoseTurn ? ( // 내 턴일 때 주황색으로 프로필 색깔 바뀌도록
        <IconButton
        size="lg"
        className="items-center bg-[#FFA500] dark:bg-[#FFA500] relative"
        onClick={openTollTip}
        disabled={gameStart && myName !== Nickname && userRank === 0 ? false : true}
        >
        {gameStart ? (
          <div className="w-20 h-6 rounded-md text-xs bg-[#C55959] shadow-xl flex justify-center items-center bottom-14 absolute">
            {answer}
          </div>
        ) : !gameStart && isCaptain ? ( // 대기방에서 방장 왕관
          <FontAwesomeIcon className="text-[#FFFF00] bottom-14 absolute" icon={faCrown} />
        ) : (
          <div></div>
        )}
        <FontAwesomeIcon icon={faUser} size="xl" />
      </IconButton>
        ) : (
          <IconButton
          size="lg"
          className={`${gameStart || ready ? 
            "items-center bg-light-btn dark:bg-dark-btn relative" : 
            "items-center bg-[#A9A9A9] dark:bg-[#A9A9A9] relative"
          }`}
          onClick={openTollTip}
          disabled={gameStart && myName !== Nickname && userRank === 0 ? false : true}
        >
          {gameStart ? (
            <div className="w-20 h-6 rounded-md text-xs bg-[#C55959] shadow-xl flex justify-center items-center bottom-14 absolute">
              {answer}
            </div>
          ) : !gameStart && isCaptain ? ( // 대기방에서 방장 왕관
            <FontAwesomeIcon className="text-[#FFFF00] bottom-14 absolute" icon={faCrown} />
          ) : (
            <div></div>
          )}
          <FontAwesomeIcon icon={faUser} size="xl" />
        </IconButton>
        )}
        <div className="mt-2">{Nickname}</div>
        {penaltyCount === 0 ? (
          <div></div>
        ) : penaltyCount === 1 ? (
          <div className="w-3 h-5 rounded absolute top-12 left-12 border-[1px] border-[#000000] bg-[#FFFF00]"></div>
        ) : penaltyCount === 2 ? (
          <div className="absolute top-12 left-12 flex flex-column">
            <div className="w-3 h-5 rounded border-[1px] border-[#000000] rotate-[160deg] bg-[#FFFF00] relative"></div>
            <div className="w-3 h-5 rounded border-[1px] border-[#000000] rotate-[20deg] bg-[#FFFF00] left-[8px] top-[1px] absolute"></div>
          </div>
        ) : (
          <div className="w-3 h-5 rounded absolute top-12 left-12 border-[1px] border-[#000000] bg-[#FF0000]"></div>
        )}
        {userRank === 1 ? (
          <div className="w-12 h-12 rounded absolute top-11 left-11 z-10">
            <img className="z-10" src="/images/1st.png" alt="1st"></img>
          </div>
        ) : userRank === 2 ? (
          <div className="w-12 h-12 rounded absolute top-11 left-11 z-10">
            <img className="z-10" src="/images/2nd.png" alt="2nd"></img>
          </div>
        ) : userRank === 3 ? (
          <div className="w-12 h-12 rounded absolute top-11 left-11 z-10">
            <img className="z-10" src="/images/3rd.png" alt="3rd"></img>
          </div>
        ) : (
          <div>
          </div>
        )}
        <div className="w-0 h-6 mt-1 rounded-md bg-[#9FDDFF]"></div>
        <div className={`${opacity}`}>{children}</div>
      </div>
    );
  }
);

export default JoinUser;
