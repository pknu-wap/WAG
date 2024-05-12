import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import IconButton from "../components/button/IconButton";
import { faGear } from "@fortawesome/free-solid-svg-icons";
import FullLayout from "../components/layout/FullLayout";
import { useParams } from "react-router-dom";
import { useRecoilState } from "recoil";
import { captainReadyToGameModalState, readyToGameModalState } from "../recoil/modal";
import { useEffect, useState } from "react";
import ReadyToGameModal from "../components/modal/ReadyModal";
import Button from "../components/button/Button";
import axios from "axios";
import { ChatMessage, INicknamePossible, IRoomResponseInfo } from "../types/dto";
import { Stomp } from "@stomp/stompjs";
import SockJS from "sockjs-client";
import ChatBubble from "../components/ingameComponents/ChatBubble";
import { useLocation } from "react-router-dom";
import JoinUser from "../components/ingameComponents/JoinUser";
import CaptainReatyToModal from "../components/modal/CaptainReadyModal";
import RadioButton from "../components/radioButton/RadioButton";

var stompClient: any = null; //웹소켓 변수 선언

const ReadyToGame = () => {
  const params = useParams(); // params를 상수에 할당
  const [, setIsOpen] = useRecoilState(readyToGameModalState);
  const [, setCaptainIsOpen] = useRecoilState(captainReadyToGameModalState)
  const [nickname, setNickname] = useState<string>("");
  const [possible, setPossible] = useState<boolean>();
  const [myChatMessages, setMyChatMessages] = useState<string>("");
  const [changeIsPrivate, setChangeIsPrivate] = useState<boolean>()  // 대기방 방장 모달 내 바꾸는 여부

  // 방 정보 관리
  const [userCount, setUserCount] = useState(0)
  const [enterCode, setEnterCode] = useState(0)
  const [isPrivateRoom, setIsPrivateRoom] = useState<boolean>()
  const [isMeCaptain, setIsMeCaptain] = useState(false)

  const location = useLocation();
  const roomInfo = { ...location.state };

  const closeModal = () => {
    setIsOpen(false);
  };
  const openModal = () => {
    setIsOpen(true);
  };
  const captainCloseModal = () => {
    setCaptainIsOpen(false)
  }
  const captainOpenModal = () => {
    setCaptainIsOpen(true)
  }

  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([]); // 채팅 데이터 상태
  const [joinUsers, setJoinUsers] = useState<string[]>([]) // 입장 유저

  //boolean값으로 한번만 뜨게 새로고침 이후에 안뜨게
  useEffect(() => {
    if ("isCaptin" in roomInfo) {
      if (roomInfo.isCaptin === true) {
        console.log("Captain is in");
        captinSocket();
        roomInfo.isCaptin = false;
      }
    } else {
      if (roomInfo.userCount === 1) {
      } else {
        openModal();
      }
    }
    setRoomInfo()
  }, []);

  // useEffect(() => {
  //   setNickname()
  // }, [nickname])

  //빠른 입장으로 roomid받기
  // const nicknameParams = {
  //   roomId: Number(params.roomId),
  //   nickname: nickname,
  // };

  // 닉네임 유효한지 api get
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
    if (nickname === "" || nickname.includes(" ")) {
      console.log("error with blank");
      setPossible(false);
      return;
    }

    const data = await getNicknamePossible();
    setPossible(data.possible);
    localStorage.setItem("nickName", data.nickName);
  };

  // 방 정보 get api
  const getRoomInfo = async () => {
    try {
      const response = await axios.get<IRoomResponseInfo>(
        "http://wwwag.co.kr:8080/room/info",
        {
          params: {
            roomId: Number(params.roomId),
          },
        }
      );
      console.log(response.data)
      return response.data;
    } catch (error) {
      console.error("방 정보 get api 오류 발생 : ", error);
      throw error;
    }
  }

  // 방 정보 업데이트
  const setRoomInfo = async () => {
    const roomInfo = await getRoomInfo()
    setEnterCode(roomInfo.roomEnterCode)
    setIsPrivateRoom(roomInfo.privateRoom)
    setChangeIsPrivate(roomInfo.privateRoom)
    let userDtos = roomInfo.userDtos
    userDtos.map((dto) => {
      console.log(dto.captain)
      const nickName = localStorage.getItem("nickName");
      if (dto.roomNickname === nickName)
        setIsMeCaptain(dto.captain)
      console.log(isMeCaptain)
    })
  }
  const captainRoomInfoClick = async () => {
    captainOpenModal()
    const roomInfo = await getRoomInfo()
    const userDtos = roomInfo.userDtos
    console.log(userDtos)
    console.log(isMeCaptain)
  }

  async function captinSocket() {
    socketCaptinConnect();
  }

  //방장 웹소켓 만들기
  const socketCaptinConnect = () => {
    console.log("방장 구독");
    const socket = new SockJS("http://wwwag.co.kr:8080/ws");
    stompClient = Stomp.over(socket);
    stompClient.connect({}, onCaptinConnected);
  };

  async function onCaptinConnected() {
    const roomId = roomInfo.roomId;
    const nickName = roomInfo.userNickName;
    stompClient.subscribe(`/topic/public/${roomId}`, onMessageReceived);
    stompClient.send(
      "/app/chat.addCaptinUser",
      {},
      JSON.stringify({ sender: nickName, type: "JOIN", roomId: roomId })
    );
  }

  //웹소켓 만들기
  const socketConnect = () => {
    const socket = new SockJS("http://wwwag.co.kr:8080/ws");
    stompClient = Stomp.over(socket);
    stompClient.connect({}, onConnected);
  };

  //STOMP 소켓 구독
  async function onConnected() {
    const roomId = localStorage.getItem("roomId");
    const nickName = localStorage.getItem("nickName");
    stompClient.subscribe(`/topic/public/${roomId}`, onMessageReceived);
    stompClient.send(
      "/app/chat.addUser",
      {},
      JSON.stringify({ sender: nickName, type: "JOIN", roomId: roomId })
    );
  }

  //드가자 버튼 클릭시
  const handleGoIn = async () => {
    socketConnect();
    closeModal();
  };

  function sendMessage() {
    if (myChatMessages.trim() === "") {
      alert("채팅 메시지를 입력해주세요.");
      return;
    }
    const roomId = localStorage.getItem("roomId");
    const nickName = localStorage.getItem("nickName");
    console.log(nickName);
    console.log(roomId);
    stompClient.send(
      "/app/chat.sendMessage",
      {},
      JSON.stringify({
        sender: localStorage.getItem("nickName"),
        content: myChatMessages,
        messageType: "CHAT",
        roomId: localStorage.getItem("roomId"),
      })
    );
    console.log(myChatMessages);
    setMyChatMessages("");
  }

  function onMessageReceived(payload: any) {
    var message = JSON.parse(payload.body);

    console.log(message);
    if (message.messageType === "JOIN") {
      setUserCount(userCount + 1)
      receiveChatMessage(message);
      addJoinUser(message)
      console.log(message.sender + " joined!");
    } else if (message.messageType === "LEAVE") {
      setUserCount(userCount - 1)
      receiveChatMessage(message);
      console.log(message);
    } else if (message.messageType === "CHAT") {
      receiveChatMessage(message);
      console.log("보내기");
    } else if (message.messageType === "CHANGE") {
      console.log("비공개? : ", message.isPrivateRoom)
    }
    else {
      console.log(message);
    }
  }

  const addJoinUser = (message: ChatMessage) => {
    if (message.messageType === "JOIN") {
      setJoinUsers([...joinUsers, message.sender])
    }
  }
  useEffect(() => {

  })

  const receiveChatMessage = (message: ChatMessage) => {
    setChatMessages([...chatMessages, message]); // 채팅 데이터 상태 업데이트
  };

  const privateModeOnclick = () => {
    stompClient.send(
      "/app/chat.changeMode",
      {},
      JSON.stringify({
        sender: localStorage.getItem("nickName"),
        content: "change room private mode",
        messageType: "CHANGE",
        roomId: localStorage.getItem("roomId"),
      })
    );
    setIsPrivateRoom(changeIsPrivate)
    console.log(isPrivateRoom);
  }

  // 대기방 방장 모달 공개/비공개 바꾸는 버튼
  const renderButton = () => {
    if (isPrivateRoom === false) {
      // 공개방일 때
      return (
        <Button size="lg" onClick={privateModeOnclick} disabled={changeIsPrivate === true}>
          비공개방으로 변경
        </Button>
      );
    } else {
      // 비공개방일 때
      return (
        <Button size="lg" onClick={privateModeOnclick} disabled={changeIsPrivate === false}>
          공개방으로 변경
        </Button>
      );
    }
  };

  return (
    <FullLayout>
      <div className="flex flex-row justify-around items-center mt-10 mx-7">
        {joinUsers.map((name, index) => (
          <JoinUser key={index} Nickname={name} />
        ))}

      </div>
      <div className="m-auto mt-8 flex justify-center items-center relative">
        <div>
          {enterCode}
        </div>
        <div className="w-1/2 h-16 shadow-lg text-[#353535] flex justify-center items-center rounded-lg bg-[#FFCCFF] shadow-xl">
          <div>Ready To Game</div>
        </div>
      </div>
      <div className="m-auto w-3/4 h-96 mt-10 overflow-y-scroll rounded-3xl shadow-xl flex flex-col p-5 tracking-wider bg-[#A072BC]">
        {chatMessages.map((m, index) => (
          <ChatBubble key={index} message={m} />
        ))}
      </div>

      <div className="mt-10 flex flex-row justify-center algin-center">
        <IconButton size="md" className="mr-10" onClick={captainRoomInfoClick}>
          <FontAwesomeIcon icon={faGear} />
        </IconButton>
        <input
          className="w-auto rounded-2xl shadow-md pl-5 text-[#000000]"
          type="text"
          placeholder="채팅 메세지를 입력해주세요"
          value={myChatMessages}
          onKeyDown={(e) => {
            if (e.key === "Enter" && myChatMessages.trim() !== "") {
              sendMessage();
            } else if (e.key === "Enter" && myChatMessages.trim() === "") {
              alert("채팅 메시지를 입력해주세요");
            }
          }}
          onChange={(e) => {
            setMyChatMessages(e.target.value);
          }}
        ></input>
        <Button size="sm" disabled={false} onClick={sendMessage}>
          보내기
        </Button>
      </div>

      {/* 방장 제외 입장 시 닉네임 설정 모달 */}
      <ReadyToGameModal onRequestClose={closeModal}>
        <div className="flex flex-col justify-between">
          <div className="my-5 flex flex-row justify-between items-center">
            <div className="text-4xl">JOIN</div>
          </div>

          <input
            className="w-full h-12 mb-2 rounded shadow-md pl-5 text-[#000000]"
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

          <Button size="sm" disabled={false} onClick={nicknamePossibleClick}>
            닉네임 확인
          </Button>

          <div className="mt-3 m-auto flex justify-end items-end">
            {possible ? (
              <Button disabled={false} size="md" onClick={handleGoIn}>
                드가자
              </Button>
            ) : (
              <Button className="" disabled={true} size="md">
                아직 멀었다
              </Button>
            )}
          </div>
        </div>
      </ReadyToGameModal>

      {/* 방장 방 설정 및 시작하기 모달 */}
      <CaptainReatyToModal onRequestClose={captainCloseModal}>
        <div>
          방장 기능
        </div>
        {isMeCaptain ? (
          <div>

            <div>나는 방장이야</div>

            <div>
              {renderButton()}
            </div>
            <Button size="lg" disabled={false}>GAME START</Button>
          </div>
        ) : (
          <div>
            나는 방장이 아니니깐 할 수 있는게 없어
          </div>
        )}
      </CaptainReatyToModal>
    </FullLayout>
  );
};

export default ReadyToGame;
