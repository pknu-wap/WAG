import { useEffect, useState } from "react";
import Button from "../components/button/Button";
import FullLayout from "../components/layout/FullLayout";
import { ConnectedProps, connect } from "react-redux";
import { RootState } from "../modules";
import { useRecoilState } from "recoil";
import { modalState } from "../recoil/modal";
import Modal from "../components/modal/Modal";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faX } from "@fortawesome/free-solid-svg-icons";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import Toast from "../components/toast/Toast";
type Props = {
  children?: React.ReactNode;
};

type PropsFromRedux = ConnectedProps<typeof connector>;
type ComponentProps = Props & PropsFromRedux;
const connector = connect(
  (state: RootState) => ({ dark: state.dark.isDark }),
  {}
);

function MainPage({ dark }: ComponentProps) {
  const navigate = useNavigate(); // useNavigate 훅을 컴포넌트 내부에서 사용
  const [theme, setTheme] = useState(localStorage.theme);
  const [enterCode, setEnterCode] = useState<number>();
  const [, setIsOpen] = useRecoilState(modalState);
  const openModal = () => {
    setIsOpen(true);
  };

  const closeModal = () => {
    setIsOpen(false);
  };
  const [disabled, setDisabled] = useState<boolean>(true);

  //입장코드로 입력으로 roomid받기
  const getRoomIdCode = async () => {
    try {
      const response = await axios.get(
        "http://wwwag-backend.co.kr/roomId/code",
        {
          params: {
            enterCode: enterCode,
          },
        }
      );
      return response.data;
    } catch (error) {
      console.error(error);
      throw error;
    }
  };

  //빠른 입장으로 roomid받기
  const getRandomRoomId = async () => {
    try {
      const response = await axios.get("http://wwwag-backend.co.kr/roomId");
      return response.data;
    } catch (error) {
      console.error("랜덤 입장 요청 중 오류 발생:", error);
      throw error;
    }
  };

  //랜덤입장 버튼 클릭
  const handleRandomEnterClick = async () => {
    const roomId = await getRandomRoomId();
    if (roomId !== "no available room") {
      localStorage.setItem("roomId", roomId);
      navigate(`/ReadyToGame/${roomId}`);
    } else{ 
      Toast({ message: "입장 가능한 방이 없습니다.", type: "error" });
      Toast({ message: "방을 생성하여 주시길 바랍니다.", type: "error" });
    }
  };

  //코드입장시 버튼 클릭
  const buttonCheckHandler = async () => {
    const roomId = await getRoomIdCode();

    if (roomId !== "invalid enterCode") {
      localStorage.setItem("roomId", roomId);
      navigate(`/ReadyToGame/${roomId}`);
    } else Toast({ message: "존재하지 않는 입장코드 입니다!", type: "error" });
  };

  const handleCreateRoomClick = () => {
    navigate("/CreateRoom"); // 페이지 이동 처리
  };

  useEffect(() => {
    if (enterCode === undefined || Number.isNaN(enterCode)) {
      setDisabled(true);
    } else {
      setDisabled(false);
    }
  }, [enterCode]);

  useEffect(() => {
    if (dark) {
      setTheme("dark");
    } else {
      setTheme("light");
    }
  }, [dark]);

  return (
    <FullLayout>
      {theme === "light" ? (
        <img src="images/WAG_white.2.png" alt="logo light mode"></img>
      ) : (
        <img src="images/WAG_dark.2.png" alt="logo dark mode"></img>
      )}
      <div className="flex flex-col items-center justify-center space-y-5">
        <Button size="lg" onClick={handleRandomEnterClick}>
          랜덤 입장
        </Button>
        <Button size="lg" onClick={handleCreateRoomClick}>
          방 생성
        </Button>
        <Button size="lg" onClick={openModal}>
          입장코드 입력
        </Button>
      </div>

      <Modal onRequestClose={closeModal}>
        <div className="flex flex-col justify-between">
          <div className="my-5 flex flex-row justify-between items-center">
            <div className="text-4xl">JOIN</div>
            <button onClick={closeModal}>
              <FontAwesomeIcon icon={faX} />
            </button>
          </div>
          <div className="text-lg">입장코드 형식 : 랜덤 숫자 4자리</div>
          <br />
          <input
            className="w-full h-12 mb-5 rounded shadow-md pl-5 text-[#000000]"
            type="error"
            required
            placeholder={"입장코드를 숫자로 입력해주세요"}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                buttonCheckHandler();
              }
            }}
            onChange={(e) => {
              const value = e.target.value;
              const regex = /^[0-9]*$/; // 숫자만 허용하는 정규식
              if (regex.test(value) || value === "") {
                setEnterCode(parseInt(value, 10));
              }
            }}
          ></input>

          <div className="m-auto flex justify-end items-end">
            {!disabled ? (
              <Button
                disabled={disabled}
                size="lg"
                onClick={buttonCheckHandler}
              >
                드가자
              </Button>
            ) : (
              <Button className="" disabled={disabled} size="lg">
                아직 멀었다
              </Button>
            )}
          </div>
        </div>
      </Modal>
    </FullLayout>
  );
}

export default connector(MainPage);
