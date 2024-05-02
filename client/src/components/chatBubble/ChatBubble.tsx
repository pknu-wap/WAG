import React, { useState, useEffect } from "react";
import { ChatMessage } from "../../types/dto";

const ChatBubble: React.FC<{ message: ChatMessage }> = ({ message }) => {
    const [chatMessages, setChatMessages] = useState<ChatMessage[]>([]);
    const myName = localStorage.getItem('nickName');

    // 새 메시지가 도착할 때마다 채팅창 스크롤을 아래로 이동합니다.
    useEffect(() => {
        const chatContainer = document.getElementById('chat-container');
        if (chatContainer) {
            chatContainer.scrollTop = chatContainer.scrollHeight;
        }
    }, [chatMessages]);

    useEffect(() => {
        // 이전 메시지 배열에 새 메시지를 추가합니다.
        setChatMessages(prevMessages => [...prevMessages, message]);

        // if (message.type === 'JOIN' || message.type === 'LEAVE') {
        //     // 입장 또는 퇴장 메시지를 생성합니다.
        //     const actionMessage = {
        //         sender: 'System',
        //         content: `${message.sender}님이 ${message.type === 'JOIN' ? '입장' : '퇴장'}하셨습니다.`,
        //         type: 'SYSTEM'
        //     };
        //     setChatMessages(prevMessages => [...prevMessages, actionMessage]);
        // } else {
        //     // 채팅 메시지를 추가합니다.
        //     setChatMessages(prevMessages => [...prevMessages, message]);
        // }
        
    }, [message]);

    return (
        <div id="chat-container" className="mt-1 overflow-auto h-64 flex flex-col">
            {chatMessages.map((msg, index) => (
                <div key={index} className={`flex flex-col items-${msg.sender === myName ? 'end' : msg.messageType === 'JOIN' || msg.messageType === 'LEAVE' ? 'middle' : 'start'}`}>
                     {msg.messageType === 'JOIN' || msg.messageType === 'LEAVE' ? (
                        <>
                            {msg.sender !== myName ? (
                                <>
                                <span className="text-white">{msg.content}</span>
                                </>
                            ) :(<></>)}
                        </>
                    ) : (
                        <>
                            <span className="text-white">{msg.sender}</span>
                            <span className={`w-auto h-auto px-4 rounded-lg rounded-tl-none bg-light-chat dark:bg-dark-btn`}>
                                {msg.content}
                            </span>
                        </>
                    )}
                </div>
            ))}
        </div>
    );
};

export default ChatBubble;
