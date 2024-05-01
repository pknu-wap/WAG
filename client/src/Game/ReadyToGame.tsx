import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import IconButton from "../components/button/IconButton";
import { faUser } from "@fortawesome/free-regular-svg-icons";
import { faGear } from "@fortawesome/free-solid-svg-icons";
import FullLayout from "../components/layout/FullLayout";
import { useParams } from "react-router-dom";
import { useRecoilState } from "recoil";
import { readyToGameModalState } from "../recoil/modal";
import { useEffect, useState } from "react";
import ReadyToGameModal from "../components/modal/ReadyModal";
import Button from "../components/button/Button";
import axios from "axios";
import { INicknamePossible } from "../types/dto";

const ReadyToGame = () => {
  const params = useParams(); // params를 상수에 할당
  const [, setIsOpen] = useRecoilState(readyToGameModalState);
  const [nickname, setNickname] = useState<string>();
  const [possible, setPossible] = useState<boolean>();
  const closeModal = () => {
    setIsOpen(false);
  };
  const openModal = () => {
    setIsOpen(true);
  };
  useEffect(() => {
    openModal();
  }, []);
  // useEffect(() => {
  //   setNickname()
  // }, [nickname])

  //빠른 입장으로 roomid받기
  // const nicknameParams = {
  //   roomId: Number(params.roomId),
  //   nickname: nickname,
  // };
  const getNicknamePossible = async () => {
    try {
      const response = await axios.get<INicknamePossible>(
        "http://wwwag.co.kr:8080/nickname/possible",
        {
          params: {
            roomId: Number(params.roomId),
            nickname: nickname,
          },
        }
      );
      return response.data;
    } catch (error) {
      console.error("랜덤 입장 요청 중 오류 발생:", error);
      throw error;
    }
  };
  const nicknamePossibleClick = async () => {
    const data = await getNicknamePossible();
    setPossible(data.possible);
  };

  return (
    <FullLayout>
      <div className="flex flex-row justify-between items-center mt-10 mx-7">
        <div className="flex flex-col items-center relative">
          <IconButton
            size="lg"
            className="items-center bg-light-btn dark:bg-dark-btn relative"
          >
            <div className="w-20 h-6 rounded-md text-xs bg-[#C55959] shadow-xl flex justify-center items-center bottom-12 absolute"></div>
            <FontAwesomeIcon icon={faUser} size="xl" />
          </IconButton>
          <div className="mt-2">user 1</div>
          <div className="w-0 h-6 mt-1 rounded-md bg-[#9FDDFF]"></div>
        </div>
        <div className="flex flex-col items-center relative">
          <IconButton
            size="lg"
            className="items-center bg-light-btn dark:bg-dark-btn relative"
          >
            <div className="w-20 h-6 rounded-md text-xs bg-[#C55959] shadow-xl flex justify-center items-center bottom-12 absolute"></div>
            <FontAwesomeIcon icon={faUser} size="xl" />
          </IconButton>
          <div className="mt-2">user 2</div>
          <div className="w-0 h-6 mt-1 rounded-md bg-[#9FDDFF]"></div>
        </div>
        <div className="flex flex-col items-center relative">
          <IconButton
            size="lg"
            className="items-center bg-light-btn dark:bg-dark-btn relative"
          >
            <div className="w-20 h-6 rounded-md text-xs bg-[#C55959] shadow-xl flex justify-center items-center bottom-12 absolute"></div>
            <FontAwesomeIcon icon={faUser} size="xl" />
          </IconButton>
          <div className="mt-2">user 3</div>
          <div className="w-0 h-6 mt-1 rounded-md bg-[#9FDDFF]"></div>
        </div>
        <div className="flex flex-col items-center relative">
          <IconButton
            size="lg"
            className="items-center bg-light-btn dark:bg-dark-btn relative"
          >
            <div className="w-20 h-6 rounded-md text-xs bg-[#C55959] shadow-xl flex justify-center items-center bottom-12 absolute"></div>
            <FontAwesomeIcon icon={faUser} size="xl" />
          </IconButton>
          <div className="mt-2">{"Me"}</div>
          <div className="w-0 h-6 mt-1 rounded-md bg-[#9FDDFF]"></div>
        </div>
        <div className="flex flex-col items-center relative">
          <IconButton
            size="lg"
            className="items-center bg-light-btn dark:bg-dark-btn relative"
          >
            <div className="w-20 h-6 rounded-md text-xs bg-[#C55959] shadow-xl flex justify-center items-center bottom-12 absolute"></div>
            <FontAwesomeIcon icon={faUser} size="xl" />
          </IconButton>
          <div className="mt-2">user 5</div>
          <div className="w-0 h-6 mt-1 rounded-md bg-[#9FDDFF]"></div>
        </div>
        <div className="flex flex-col items-center relative">
          <IconButton
            size="lg"
            className="items-center bg-light-btn dark:bg-dark-btn relative"
          >
            <div className="w-20 h-6 rounded-md text-xs bg-[#C55959] shadow-xl flex justify-center items-center bottom-12 absolute"></div>
            <FontAwesomeIcon icon={faUser} size="xl" />
          </IconButton>
          <div className="mt-2">user 6</div>
          <div className="w-0 h-6 mt-1 rounded-md bg-[#9FDDFF]"></div>
        </div>
      </div>
      <div className="m-auto mt-16 flex justify-center items-center relative">
        <div className="w-1/2 h-16 shadow-lg text-[#353535] flex justify-center items-center rounded-lg bg-[#FFCCFF] shadow-xl">
          <div>Ready To Game</div>
        </div>
      </div>
      <div className="m-auto w-3/4 h-96 mt-10 overflow-y-scroll rounded-3xl shadow-xl flex flex-col p-5 tracking-wider bg-[#A072BC]">
        <div className="mt-1 flex flex-col items-start">
          <span className="text-[#ffffff]">user 2</span>
          <span className="w-auto h-auto px-4 rounded-lg rounded-tl-none bg-light-chat dark:bg-dark-btn">
            ㅇㅇ 사람아님
          </span>
        </div>
        <div className="mt-1 flex flex-col items-start">
          <span className="text-[#ffffff]">user 3</span>
          <span className="w-auto h-auto px-4 rounded-lg rounded-tl-none bg-light-chat dark:bg-dark-btn">
            근데 너도 사람 아니잖아
          </span>
        </div>
        <div className="mt-1 flex flex-col items-end">
          <span className="text-[#ffffff]">Me</span>
          <span className="w-auto h-auto px-4 rounded-lg rounded-tr-none bg-light-chat dark:bg-dark-btn">
            헉
          </span>
        </div>
        <div className="mt-1 flex flex-col items-start">
          <span className="text-[#ffffff]">user 5</span>
          <span className="w-auto h-auto px-4 rounded-lg rounded-tl-none bg-light-chat dark:bg-dark-btn">
            ㅋㅋㅋㅋㅋㅋㅋㅋㅋㅋㅋㅋㅋㅋ
          </span>
        </div>
        <div className="mt-1 flex flex-col items-start">
          <span className="text-[#ffffff]">user 6</span>
          <span className="w-auto h-auto px-4 rounded-lg rounded-tl-none bg-light-chat dark:bg-dark-btn">
            아니 게임을 하라고
          </span>
        </div>
      </div>

      <div className="mt-10 flex flex-row justify-center algin-center">
        <IconButton size="md" className="mr-10">
          <FontAwesomeIcon icon={faGear} />
        </IconButton>
        <input
          className="w-3/4 rounded-2xl shadow-md pl-5 text-[#000000]"
          type="text"
        ></input>
      </div>

      <ReadyToGameModal onRequestClose={closeModal}>
        <div className="flex flex-col justify-between">
          <div className="my-5 flex flex-row justify-between items-center">
            <div className="text-4xl">JOIN</div>
          </div>

          <input
            className="w-3/4 h-12 mb-5 rounded shadow-md pl-5 text-[#000000]"
            type="error"
            required
            placeholder={"닉네임을 입력해주세요"}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                nicknamePossibleClick();
              }
            }}
            onChange={(e) => {
              setNickname(e.target.value);
              setPossible(false);
            }}
          ></input>
          <div>
            {possible ? (
              <div className="text-[#33B3FF]">사용가능</div>
            ) : (
              <div className="text-[#FF0000]">다른 닉네임을 입력해주세요</div>
            )}
          </div>

          <Button size="md" disabled={false} onClick={nicknamePossibleClick}>
            닉네임 확인
          </Button>

          <div className="m-auto flex justify-end items-end">
            {possible ? (
              <Button disabled={false} size="lg" onClick={closeModal}>
                드가자
              </Button>
            ) : (
              <Button className="" disabled={true} size="lg">
                아직 멀었다
              </Button>
            )}
          </div>
        </div>
      </ReadyToGameModal>
    </FullLayout>
  );
};

export default ReadyToGame;
