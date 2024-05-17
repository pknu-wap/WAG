 import React from "react";
 import { ChatMessage } from "../../types/dto";

 const NotificationMessage: React.FC<{ message: ChatMessage }> = ({ message }) => {
 return (
     <>
     <span className="text-white">{message.content}</span>
     </>
 );
 };

 export default NotificationMessage;