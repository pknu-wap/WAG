import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import IconButton from "../button/IconButton";
import { faUser } from "@fortawesome/free-regular-svg-icons";
import axios from "axios";
import { IGetAnswerList } from "../../types/dto";
import { useEffect, useState } from "react";

const JoinUser: React.FC<{ Nickname: string; gameStart: boolean }> = ({
  Nickname,
  gameStart,
}) => {
  const roomId = localStorage.getItem("roomId");
  const nickName = localStorage.getItem("nickName");
  const [answer, setAnswer] = useState("가져오기 전");
  const getNicknamePossible = async () => {
    try {
      const response = await axios.get<IGetAnswerList>(
        "http://wwwag-backend.co.kr/answer/list",
        {
          params: {
            roomId: roomId,
            nickname: nickName,
          },
        }
      );
      console.log("가져오기 성공");
      return response.data;
    } catch (error) {
      console.error("정답어 가져오기 중 오류발생 :", error);
      throw error;
    }
  };
  const dummyAnswer = {
    answerUserDto: [
      {
        nickname: "jsjs",
        answer: "WAP",
      },
    ],
  };
  const findUserAnswer = async () => {
    const answerUsers = await getNicknamePossible();
    console.log(answerUsers);
    dummyAnswer.answerUserDto.forEach((dto) => {
      if (Nickname === dto.nickname) {
        setAnswer("???");
      } else {
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

  return (
    <div className="flex flex-col items-center relative">
      <IconButton
        size="lg"
        className="items-center bg-light-btn dark:bg-dark-btn relative"
      >
        <div className="w-20 h-6 rounded-md text-xs bg-[#C55959] shadow-xl flex justify-center items-center bottom-12 absolute">
          {answer}
        </div>
        <FontAwesomeIcon icon={faUser} size="xl" />
      </IconButton>
      <div className="mt-2">{Nickname}</div>
      <div className="w-0 h-6 mt-1 rounded-md bg-[#9FDDFF]"></div>
    </div>
  );
};

export default JoinUser;
