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

  //CountdownProps의 타입을 지정하기 위한 인터페이스 선언
  interface CountdownProps {
    startFrom: number; // startFrom의 타입을 number로 명시
  }
    //게임 시작시 채팅창에 3초 카운트다운
    const Countdown: React.FC<CountdownProps> = ({ startFrom }) => {
      const [count, setCount] = useState(startFrom);
    
      useEffect(() => {
        if (count <= 0) return;
    
        const timerId = setTimeout(() => {
          setCount(count - 1);
        }, 1000);
    
        return () => clearTimeout(timerId);
      }, [count]);
    
      return <div>{count}</div>;
    };

    // 메시지 렌더링 로직을 별도의 함수로 분리
    const renderMessage = (msg: ChatMessage, index: number) => {
      const userMessageTypes = ['CHAT', 'ASK', 'ANSWER', 'CORRECT']; // UserMessage로 처리될 메시지 타입들
      const isUserMessage = userMessageTypes.includes(msg.messageType); //UserMessage 인지 아닌지
      const isMyMessage = msg.sender === myName;   //내가 보낸 메세지인지 아닌지
    
      if (isUserMessage) //CHAT, ASK, ANSWER, CORRECT 중에 하나라면
        {
        // 사용자 메시지 처리
        let containerClass = isMyMessage ? "flex flex-col items-end" : "flex flex-col items-start";
        return (
          <div key={index} className={containerClass}>
            <UserMessage message={msg} />
          </div>
        );
      } 
      else if (msg.messageType === 'START') //UserMessage가 아니고
        {
        // START 메시지 타입일 때 카운트다운 처리
        return (
          <div key={index} className="flex flex-col items-center">
            <NotificationMessage message={msg} />
            <Countdown startFrom={3} /> {/* 3초 카운트다운 */}
          </div>
        );
      } 
      else // 그 외 공지 메시지 처리
      {
        return (
          <div key={index} className="flex flex-col items-center">
            <NotificationMessage message={msg} />
          </div>
        );
      }
    };
    

    return (
      <div id="chat-container" className="mt-1 overflow-auto h-full flex flex-col p-5">
        {chatMessages.map(renderMessage)}
      </div>
    );
};

export default ChatRoom;