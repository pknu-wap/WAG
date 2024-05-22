import React, { ReactNode, forwardRef, useEffect, useState } from "react";
import { faUser } from "@fortawesome/free-regular-svg-icons";
import axios from "axios";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import IconButton from "../button/IconButton";
import { GameUserDto, IGetAnswerList } from "../../types/dto";

interface JoinUserProps {
  Nickname: string;
  gameStart: boolean;
  gameUserDto: GameUserDto[];
  className: string;
  onClick?: () => void;
  children: ReactNode;
}

const JoinUser = forwardRef<HTMLDivElement, JoinUserProps>(
  ({ Nickname, gameStart, gameUserDto, className, onClick, children }, ref) => {
    const roomId = localStorage.getItem("roomId");
    const myName = localStorage.getItem("nickName");
    const [answer, setAnswer] = useState("");

    const getNicknamePossible = async () => {
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
      const answerUsers = await getNicknamePossible();
      console.log(answerUsers);
      answerUsers.answerUserDtos.forEach((dto) => {
        if (Nickname === dto.nickname) {
          setAnswer(dto.answer);
        }
      });
    };

    useEffect(() => {
      if (gameStart) {
        findUserAnswer();
        console.log(gameStart, answer);
      } else {
        console.log("게임 시작 전");
      }
    }, [gameStart]);

    const [opacity, setOpacity] = useState("opacity-0");
    const openTollTip = () => {
      if (opacity === "opacity-0") {
        setOpacity("opacity-100");
      } else {
        setOpacity("opacity-0");
      }
    };
    const [penaltyCount, setPenaltyCount] = useState(0);

    // 패널티 갯수 확인
    const setOtherPenalty = () => {
      gameUserDto.forEach((dto) => {
        if (Nickname === dto.roomNickname) {
          setPenaltyCount(dto.penalty);
        }
      });
    };

    // 순위 확인
    const finishToRank = () => {
     gameUserDto.forEach((dto) => {
      if (Nickname === dto.roomNickname) {

      }
     }) 
    }
    useEffect(() => {
      setOtherPenalty();
    }, [gameUserDto]);

    return (
      <div
        ref={ref}
        className={`${className} flex flex-col items-center relative`}
      >
        <IconButton
          size="lg"
          className="items-center bg-light-btn dark:bg-dark-btn relative"
          onClick={openTollTip}
          disabled={gameStart && myName !== Nickname ? false : true}
        >
          {gameStart ? (
            <div className="w-20 h-6 rounded-md text-xs bg-[#C55959] shadow-xl flex justify-center items-center bottom-14 absolute">
              {answer}
            </div>
          ) : (
            <div></div>
          )}
          <FontAwesomeIcon icon={faUser} size="xl" />
        </IconButton>
        <div className="mt-2">{Nickname}</div>
        {penaltyCount === 0 ? (
          <div></div>
        ) : penaltyCount === 1 ? (
          <div className="w-3 h-5 rounded absolute top-12 left-12 border-slate-950 bg-[#FFFF00]"></div>
        ) : penaltyCount === 2 ? (
          <div className="absolute top-12 left-12 flex flex-column">
            <div className="w-3 h-5 rounded border-slate-950 bg-[#FFFF00]"></div>
            <div className="w-3 h-5 rounded border-slate-950 bg-[#FFFF00]"></div>
          </div>
        ) : (
          <div className="w-3 h-5 rounded absolute top-12 left-12 border-slate-950 bg-[#FF0000]"></div>
        )}
        <div className="w-0 h-6 mt-1 rounded-md bg-[#9FDDFF]"></div>
        <div className={`${opacity}`}>{children}</div>
      </div>
    );
  }
);

export default JoinUser;
