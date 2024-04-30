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
import { IGetRoomIdCode } from "../types/dto";
import { io } from "socket.io-client";
import { useNavigate } from "react-router-dom";
import * as StompJs from "@stomp/stompjs";
import SockJS from "sockjs-client";

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
  const socketUrl = "http://wwwag.co.kr:8080";
  const sock = new SockJS(socketUrl);
  const ws = StompJs.Stomp.over(sock);

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
  // const { data: enterCodeData } = useGetRoomIdCodeQuery({
  //   enterCode: enterCode,
  // })
  // const [roomIdCode, setRoomIdCode] = useState<IGetRoomIdCode>()
  // useEffect(() => {
  //   setRoomIdCode(enterCodeData)
  // }, [enterCodeData])

  //입장코드로 입력으로 roomid받기
  const getRoomIdCode = async (): Promise<IGetRoomIdCode> => {
    try {
      const response = await axios.get<IGetRoomIdCode>(
        "http://wwwag.co.kr:8080/roomId/code",
        {
          params: {
            enterCode: enterCode,
          },
        }
      );
      return response.data;
    } catch (e) {
      console.error(e);
      throw e;
    }
  };

  //빠른 입장으로 roomid받기
  const getRandomRoomId = async () => {
    try {
      const response = await axios.get("http://wwwag.co.kr:8080/roomId");
      return response.data; // 서버로부터 받은 데이터 반환
    } catch (error) {
      console.error("랜덤 입장 요청 중 오류 발생:", error);
      throw error;
    }
  };

  //빠른 입장 버튼 클릭 이벤트 핸들러
  const handleRandomEnterClick = async () => {
    try {
      const roomId = await getRandomRoomId(); // API 호출
      if (roomId) {
        // roomId가 존재하는 경우, 해당 방 ID로 소켓 연결
        console.log("입장할 방 ID:", roomId);

        ws.connect({}, (roomId: number) => {
          ws.subscribe(`/topic/public/${roomId}`, (data) => {});
        });

        navigate("/JoinGame");
        // 소켓 이벤트 리스너 등록 및 기타 로직 처리
        // 예시: navigate(`/room/${data.roomId}`); // 방 페이지로 이동
      } else if (roomId === "no available room") {
        // 사용 가능한 방이 없는 경우
        alert("사용 가능한 방이 없습니다.");
      }
    } catch (error) {
      console.error("랜덤 입장 처리 중 오류 발생:", error);
    }
  };

  const buttonCheckHandler = () => {
    const roomIdFromCode = getRoomIdCode();
    // const socket = io(`http://wwwag.co.kr:8080/topic/public/`); //해당 방으로 소켓 연결
    console.log(roomIdFromCode);
  };
  const navigate = useNavigate(); // useNavigate 훅을 컴포넌트 내부에서 사용

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

          <input
            className="w-3/4 h-12 mb-5 rounded shadow-md pl-5 text-[#000000]"
            type="error"
            required
            placeholder={"입장코드를 숫자로 입력해주세요"}
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
