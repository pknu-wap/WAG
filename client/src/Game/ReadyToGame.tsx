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
import { ChatMessage, INicknamePossible } from "../types/dto";
import { Stomp } from "@stomp/stompjs";
import SockJS from "sockjs-client";
import ChatBubble from "../components/chatBubble/ChatBubble";
import { useLocation } from "react-router-dom";

var stompClient: any = null; //웹소켓 변수 선언

const ReadyToGame = () => {
  const params = useParams(); // params를 상수에 할당
  const [, setIsOpen] = useRecoilState(readyToGameModalState);
  const [nickname, setNickname] = useState<string>("");
  const [possible, setPossible] = useState<boolean>();
  const [myChatMessages, setMyChatMessages] = useState<string>("");
  const location = useLocation();
  const roomInfo = { ...location.state };

  const closeModal = () => {
    setIsOpen(false);
  };
  const openModal = () => {
    setIsOpen(true);
  };

  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([]); // 채팅 데이터 상태

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
    if (nickname === "" || nickname.includes(" ")) {
      console.log("error with blank");
      setPossible(false);
      return;
    }

    const data = await getNicknamePossible();
    setPossible(data.possible);
    localStorage.setItem("nickName", data.nickName);
  };

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
      receiveChatMessage(message);
      console.log(message.sender + " joined!");
    } else if (message.messageType === "LEAVE") {
      receiveChatMessage(message);
      console.log(message);
    } else if (message.messageType === "CHAT") {
      receiveChatMessage(message);
      console.log("보내기");
    } else {
      console.log(message);
    }
  }

  const receiveChatMessage = (message: ChatMessage) => {
    setChatMessages([...chatMessages, message]); // 채팅 데이터 상태 업데이트
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
      <div className="m-auto mt-8 flex justify-center items-center relative">
        <div className="w-1/2 h-16 shadow-lg text-[#353535] flex justify-center items-center rounded-lg bg-[#FFCCFF] shadow-xl">
          <div>Ready To Game</div>
        </div>
      </div>
      <div className="m-auto w-3/4 h-96 mt-10 overflow-y-scroll rounded-3xl shadow-xl flex flex-col p-5 tracking-wider bg-[#A072BC]">
        {chatMessages.map((m) => (
          <ChatBubble message={m} />
        ))}
      </div>

      <div className="mt-10 flex flex-row justify-center algin-center">
        <IconButton size="md" className="mr-10">
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
    </FullLayout>
  );
};

export default ReadyToGame;
