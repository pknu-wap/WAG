import React from "react";
import { ChatMessage } from "../../types/dto";
import { faBullhorn } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";

const UserMessage: React.FC<{ 
  message: ChatMessage; 
  isMyMessage?: boolean;
  askerMessage?: boolean;
 }> = ({ message, isMyMessage, askerMessage }) => {
  return (
      <>
        {isMyMessage ? (
          askerMessage ? (
            <>
              <span className="text-white flex flex-row">
                {message.sender}
                <FontAwesomeIcon className="scale-x-[-1]" icon={faBullhorn} />
              </span>
              <span className="w-auto h-auto px-4 rounded-lg rounded-tr-none bg-[#FFA500] dark:bg-[#FFA500]">
                {message.content}
              </span>
            </>
          ) : (
            <>
              <span className="text-white">{message.sender}</span>
              <span className="w-auto h-auto px-4 rounded-lg rounded-tr-none bg-light-chat dark:bg-dark-btn">
                {message.content}
              </span>
            </>
          )
        ) : (
          askerMessage ? (
            <>
              <span className="text-white flex flex-row">
                {message.sender}
                <FontAwesomeIcon icon={faBullhorn} />
              </span>
              <span className="w-auto h-auto px-4 rounded-lg rounded-tl-none bg-[#FFA500] dark:bg-[#FFA500]">
                {message.content}
              </span>
            </>
          ) : (
            <>
              <span className="text-white">{message.sender}</span>
              <span className="w-auto h-auto px-4 rounded-lg rounded-tl-none bg-light-chat dark:bg-dark-btn">
                {message.content}
              </span>
            </>
          )
        )}
    </>
  );
};

export default UserMessage;