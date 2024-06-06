import React from "react";
import { ChatMessage } from "../../types/dto";

const UserMessage: React.FC<{ 
  message: ChatMessage; 
  isMyMessage?: boolean;
  askerMessage?: boolean;
 }> = ({ message, isMyMessage, askerMessage }) => {
  const formatMessage = message.content.split("\n").map((line, index) => {
    return (
      <React.Fragment key={index}>
      {line}
      <br />
    </React.Fragment>
    )
  })
  return (
      <>
        {isMyMessage ? (
          askerMessage ? (
            <>
              <span className="text-sm sm:text-base text-white flex flex-row">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="size-6 scale-x-[-1] mr-2">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M19.114 5.636a9 9 0 0 1 0 12.728M16.463 8.288a5.25 5.25 0 0 1 0 7.424M6.75 8.25l4.72-4.72a.75.75 0 0 1 1.28.53v15.88a.75.75 0 0 1-1.28.53l-4.72-4.72H4.51c-.88 0-1.704-.507-1.938-1.354A9.009 9.009 0 0 1 2.25 12c0-.83.112-1.633.322-2.396C2.806 8.756 3.63 8.25 4.51 8.25H6.75Z" />
                </svg>
                {message.sender}
              </span>
              <span className="text-sm sm:text-base w-auto max-w-[80%] h-auto py-[1px] px-4 mb-[5px] text-left rounded-lg rounded-tr-none bg-[#FFA500] dark:bg-[#FFA500]">
                {formatMessage}
              </span>
            </>
          ) : (
            <>
              <span className="text-sm sm:text-base text-white">{message.sender}</span>
              <span className="text-sm sm:text-base w-auto max-w-[80%] h-auto py-[1px] px-4 mb-[5px] text-left rounded-lg rounded-tr-none bg-light-chat dark:bg-dark-btn">
                {formatMessage}
              </span>
            </>
          )
        ) : (
          askerMessage ? (
            <>
              <span className="text-sm sm:text-base text-white flex flex-row">
                {message.sender}
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="size-6 ml-2">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M19.114 5.636a9 9 0 0 1 0 12.728M16.463 8.288a5.25 5.25 0 0 1 0 7.424M6.75 8.25l4.72-4.72a.75.75 0 0 1 1.28.53v15.88a.75.75 0 0 1-1.28.53l-4.72-4.72H4.51c-.88 0-1.704-.507-1.938-1.354A9.009 9.009 0 0 1 2.25 12c0-.83.112-1.633.322-2.396C2.806 8.756 3.63 8.25 4.51 8.25H6.75Z" />
                </svg>
              </span>
              <span className="text-sm sm:text-base w-auto max-w-[80%] h-auto py-[1px] px-4 mb-[5px] text-left rounded-lg rounded-tl-none bg-[#FFA500] dark:bg-[#FFA500]">
                {formatMessage}
              </span>
            </>
          ) : (
            <>
              <span className="text-sm sm:text-base text-white">{message.sender}</span>
              <span className="text-sm sm:text-base w-auto max-w-[80%] h-auto py-[1px] px-4 mb-[5px] text-left rounded-lg rounded-tl-none bg-light-chat dark:bg-dark-btn">
                {formatMessage}
              </span>
            </>
          )
        )}
    </>
  );
};

export default UserMessage;