import React from "react";
import { ChatMessage } from "../../types/dto";

const UserMessage: React.FC<{ message: ChatMessage; isMyMessage?: boolean }> = ({ message, isMyMessage }) => {
  return (
      <>
      <span className="text-white">{message.sender}</span>
        {isMyMessage ? (
          <span className="w-auto h-auto px-4 rounded-lg rounded-tr-none bg-light-chat dark:bg-dark-btn">
            {message.content}
          </span>
        ) : (
          <span className="w-auto h-auto px-4 rounded-lg rounded-tl-none bg-light-chat dark:bg-dark-btn">
            {message.content}
          </span>
        )}
    </>
  );
};

export default UserMessage;