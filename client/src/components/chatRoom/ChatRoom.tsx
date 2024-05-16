import React, { useState, useEffect } from "react";
import { ChatMessage } from "../../types/dto";
import UserMessage from "./UserMessage";
import NotificationMessage from "./NotificationMessage";
const ChatRoom: React.FC<{ message: ChatMessage }> = ({ message }) => {
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([]);
  const myName = localStorage.getItem("nickName");

  // 새 메시지가 도착할 때마다 채팅창 스크롤을 아래로 이동합니다.
  useEffect(() => {
    const chatContainer = document.getElementById("chat-container");
    if (chatContainer) {
      chatContainer.scrollTop = chatContainer.scrollHeight;
    }
  }, [chatMessages]);

  useEffect(() => {
    // 이전 메시지 배열에 새 메시지를 추가합니다.
    setChatMessages((prevMessages) => [...prevMessages, message]);
  }, [message]);


    // 메시지 렌더링 로직을 별도의 함수로 분리
    const renderMessage = (msg: ChatMessage, index: number) => {
      const isNotification = msg.messageType === "JOIN" || msg.messageType === "LEAVE";
      const isMyMessage = msg.sender === myName;
  
      let containerClass = "flex flex-col items-start"; //상대방의 채팅인 경우
      if (isMyMessage) containerClass = "flex flex-col items-end"; //나의 채팅인 경우
      else if (isNotification) containerClass = "flex flex-col items-middle"; //공지 채팅인 경우
  
      return (
        <div key={index} className={containerClass}>
          {isNotification ? (
            <NotificationMessage message={msg} /> //공지채팅 랜더링
          ) : (
            <UserMessage message={msg} />  //유저채팅 랜더링
          )}
        </div>
      );
    };

    return (
      <div id="chat-container" className="mt-1 overflow-auto h-full flex flex-col p-5">
        {chatMessages.map(renderMessage)}
      </div>
    );
};

export default ChatRoom;