import { useEffect, useState } from "react";
import Button from "../components/button/Button";
import FullLayout from "../components/layout/FullLayout";
import { ConnectedProps, connect } from "react-redux";
import { RootState } from "../modules";
import { useRecoilState } from "recoil";
import { modalState, soundEffectStatus } from "../recoil/recoil";
import Modal from "../components/modal/Modal";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import Toast from "../components/toast/Toast";
import Wrapper from "../components/Wrapper";
import { GA_EVENT } from "../constants/GA_EVENT";
import { trackEvent } from "../util/googleAnalytics/trackEvent";



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
  const navigate = useNavigate();
  const [theme, setTheme] = useState(localStorage.theme);
  const [enterCode, setEnterCode] = useState<number>();
  const [, setIsOpen] = useRecoilState(modalState);
  const [soundEffectStatusValue] = useRecoilState(soundEffectStatus);
  const [disabled, setDisabled] = useState<boolean>(true);

  const openModal = () => {
    handlePlaySound();
    setIsOpen(true);
  };

  const closeModal = () => {
    setIsOpen(false);
  };

  const getRoomIdCode = async () => {
    try {
      const response = await axios.get(
        `${process.env.REACT_APP_API_URL}/roomId/code`,
        { params: { enterCode } }
      );
      return response.data;
    } catch (error) {
      console.error(error);
      throw error;
    }
  };

  const getRandomRoomId = async () => {
    try {
      const response = await axios.get(`${process.env.REACT_APP_API_URL}/roomId`);
      return response.data;
    } catch (error) {
      console.error("랜덤 입장 요청 중 오류 발생:", error);
      throw error;
    }
  };

  const handlePlaySound = () => {
    const playSound = () => {
      const audio = new Audio("audio/button_click.mp3");
      audio.play();
    };
    if (soundEffectStatusValue) playSound();
  };

  const handleRandomEnterClick = async () => {
    handlePlaySound();
    const roomId = await getRandomRoomId();
    if (roomId !== "no available room") {
      trackEvent({
        action: GA_EVENT.MAIN.QUICK_JOIN,
        category: "main",
        label: roomId,
      });
      localStorage.setItem("roomId", roomId);
      navigate(`/ReadyToGame/${roomId}`, { state: { fromRandom: true }});
    } else {
      Toast({ message: "입장 가능한 방이 없습니다.", type: "error" });
      Toast({ message: "방을 생성하여 주시길 바랍니다.", type: "error" });
    }
  };

  const buttonCheckHandler = async () => {
    handlePlaySound();
    const roomId = await getRoomIdCode();
    if (roomId === "invalid enterCode") {
      Toast({ message: "존재하지 않는 입장코드 입니다!", type: "error" });
    } else if (roomId === "already started") {
      Toast({ message: "이미 게임이 시작되었습니다!", type: "error" });
    } else {
      trackEvent({
        action: GA_EVENT.MAIN.INPUT_JOIN_ROOM,
        category: "main",
        label: roomId,
      });
      localStorage.setItem("roomId", roomId);
      navigate(`/ReadyToGame/${roomId}?code=${enterCode}`);
    }
  };

  const handleCreateRoomClick = () => {
    handlePlaySound();
    trackEvent({
      action: GA_EVENT.MAIN.OPEN_CREATE_ROOM,
      category: "main",
    });
    navigate("/CreateRoom");
  };

  const handleGoToSinglePlayground = () => {
    trackEvent({
      action: GA_EVENT.MAIN.SOLO_MODE,
      category: "main",
    });
    window.open("https://splendorous-conkies-8e58b1.netlify.app/", "_self");
  };

  useEffect(() => {
    localStorage.clear();
  }, []);

  useEffect(() => {
    setDisabled(enterCode === undefined || Number.isNaN(enterCode));
  }, [enterCode]);

  useEffect(() => {
    setTheme(dark ? "dark" : "light");
  }, [dark]);

  return (
    <Wrapper>
      <FullLayout>
        <div className="">
          <div className="flex justify-center items-center ">
            <img
              className={`relative w-2/4`}
              src="images/yangSaeChanGame.png"
              alt="logo light mode"
            />
          </div>

          <div className="flex flex-col items-center justify-center space-y-5 mt-6">
            <Button size="lg" onClick={handleRandomEnterClick}>
              랜덤 입장
            </Button>
            <Button size="lg" onClick={handleCreateRoomClick}>
              방 생성
            </Button>
            <Button size="lg" onClick={openModal}>
              입장코드 입력
            </Button>
            <Button size="lg" onClick={handleGoToSinglePlayground}>
              1인 미니게임
            </Button>
          </div>
        </div>

        <Modal onRequestClose={closeModal}>
          <div className="relative z-10 flex flex-col justify-between">
            <div className="my-5 flex flex-row justify-between items-center">
              <div className="text-4xl">JOIN</div>
            </div>
            <div className="text-lg">입장코드 형식 : 랜덤 숫자 4자리</div>
            <br />
            <input
              className="w-full h-12 mb-5 rounded shadow-md pl-5 text-[#000000]"
              type="error"
              required
              placeholder={"입장코드를 숫자로 입력해주세요"}
              onKeyDown={(e) => {
                if (e.key === "Enter") buttonCheckHandler();
              }}
              onChange={(e) => {
                const value = e.target.value;
                const regex = /^[0-9]*$/;
                if (regex.test(value) || value === "") {
                  setEnterCode(parseInt(value, 10));
                }
              }}
            ></input>

            <div className="m-auto flex justify-end items-end">
              <Button
                disabled={disabled}
                size="lg"
                onClick={buttonCheckHandler}
              >
                {disabled ? "아직 멀었다" : "드가자"}
              </Button>
            </div>
          </div>
        </Modal>
      </FullLayout>
    </Wrapper>
  );
}

export default connector(MainPage);
