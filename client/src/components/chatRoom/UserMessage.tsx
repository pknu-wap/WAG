import React from "react";
import { ChatMessage } from "../../types/dto";

const UserMessage: React.FC<{ message: ChatMessage; myTurn?: boolean }> = ({ message, myTurn }) => {
  return (
      <>
      <span className="text-white">{message.sender}</span>
        {myTurn ? (
          <span className="w-auto h-auto px-4 rounded-lg rounded-tr-none bg-[#FFA500] dark:bg-[#FFA500]">
            {message.content}
          </span>
        ) : (
          <span className="w-auto h-auto px-4 rounded-lg rounded-tr-none bg-light-chat dark:bg-dark-btn">
            {message.content}
          </span>
        )}
    </>
  );
};

export default UserMessage;