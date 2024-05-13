import React, { useState } from "react";
import Button from "../components/button/Button";
import RadioButton from "../components/radioButton/RadioButton";
import FullLayout from "../components/layout/FullLayout";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { IRoomResponseInfo } from "../types/dto";

function CreateRoom() {
  const [isPrivate, setIsPrivate] = useState<boolean | null>(false); //일단은 공개방을 default로
  const [nickName, setNickname] = useState<string>();

  const navigate = useNavigate();

  const radioChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    console.log(event.target.value);
  };

  const createRoom = async () => {
    try {
      console.log("11", isPrivate);
      const response = await axios.post<IRoomResponseInfo>(
        "http://wwwag-backend.co.kr/room/create",
        {
          privateRoom: isPrivate,
          userNickName: nickName,
        }
      );

      const roomId = response.data.roomId;
      localStorage.setItem("nickName", nickName ?? "");
      localStorage.setItem("roomId", roomId.toString());
      // socketConnect();
      const newResponse = {
        isPrivateRoom: response.data.privateRoom,
        userNickName: nickName,
        isCaptin: true,
        roomId: roomId,
      };

      navigate(`/ReadyToGame/${roomId}`, { state: newResponse });
    } catch (error) {
      console.error("랜덤 입장 요청 중 오류 발생:", error);
      throw error;
    }
  };

  // //웹소켓 만들기
  // const socketConnect = () => {
  //   const socket = new SockJS("http://wwwag-backend.co.kr/ws");
  //   stompClient = Stomp.over(socket);
  //   stompClient.connect({}, onConnected);
  // };

  // //STOMP 소켓 구독
  // async function onConnected() {
  //   const roomId = localStorage.getItem("roomId");
  //   const nickName = localStorage.getItem("nickName");
  //   console.log(nickName);
  //   console.log(roomId);
  //   stompClient.subscribe(`/topic/public/${roomId}`);
  //   stompClient.send(
  //     "/app/chat.addCaptinUser",
  //     {},
  //     JSON.stringify({ sender: nickName, type: "JOIN", roomId: roomId })
  //   );
  // }

  const renderButton = () => {
    if (isPrivate === null) {
      return <p>방 공개 / 비공개 여부를 선택해주십시오</p>; //체크가 안된 상태를 defult로 만들 수도 있음
    } else if (isPrivate === false) {
      return (
        <Button size="lg" onClick={createRoom}>
          공개방 생성
        </Button>
      );
    } else {
      return (
        <Button size="lg" onClick={createRoom}>
          비공개방 생성
        </Button>
      );
    }
  };

  return (
    <FullLayout>
      <div className="p-4">
        <div className="justify-center text-6xl mb-20">방 만들기</div>
        <div className="rounded-xl font-extrabold min-w-44 ">
          방 공개 / 비공개 여부 선택
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 mt-5 gap-2">
          <RadioButton
            id="public"
            label="공개"
            value="false"
            name="roomType"
            onChange={() => setIsPrivate(false)}
            checked={isPrivate === false}
          />
          <RadioButton
            id="private"
            label="비공개"
            value="true"
            name="roomType"
            onChange={() => setIsPrivate(true)}
          />
        </div>
        <input
          className="w-3/4 h-12 mb-5 mt-5 rounded shadow-md pl-5 text-[#000000]"
          type="error"
          required
          placeholder={"닉네임을 입력해주세요"}
          onChange={(e) => {
            setNickname(e.target.value);
          }}
        ></input>

        <div className="mt-12">{renderButton()}</div>
      </div>
    </FullLayout>
  );
}

export default CreateRoom;
