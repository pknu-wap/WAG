import React, { forwardRef, useEffect, useState } from "react";
import { faUser } from "@fortawesome/free-regular-svg-icons";
import axios from "axios";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import IconButton from "../button/IconButton";
import { IGetAnswerList } from "../../types/dto";

interface JoinUserProps {
  Nickname: string;
  gameStart: boolean;
  penalty?: any;
}

const JoinUser = forwardRef<HTMLDivElement, JoinUserProps>(
  ({ Nickname, gameStart, penalty }, ref) => {
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
        if (myName === dto.nickname) {
          setAnswer("???");
          console.log("Mine");
        } else if (Nickname === dto.nickname) {
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
    }, [gameStart]); // `answer`를 추가하여 의존성 배열을 완성합니다.

    return (
      <div ref={ref} className="flex flex-col items-center relative">
        <IconButton
          size="lg"
          className="items-center bg-light-btn dark:bg-dark-btn relative"
        >
          {gameStart ? (
            <div className="w-20 h-6 rounded-md text-xs bg-[#C55959] shadow-xl flex justify-center items-center bottom-12 absolute">
              {answer}
            </div>
          ) : (
            <div></div>
          )}
          <FontAwesomeIcon icon={faUser} size="xl" />
        </IconButton>
        <div className="mt-2">{Nickname}</div>
        <div className="w-0 h-6 mt-1 rounded-md bg-[#9FDDFF]"></div>
      </div>
    );
  }
);

export default JoinUser;
