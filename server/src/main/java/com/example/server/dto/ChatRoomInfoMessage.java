package com.example.server.dto;

import com.example.server.payload.response.RoomResponse;
import lombok.Getter;
import lombok.Setter;

@Getter @Setter
public class ChatRoomInfoMessage {
    private ChatMessage.MessageType messageType;
    private String content;
    private String sender;
    private Long roomId;
    private RoomResponse roomResponse;
//    public enum MessageType{
//        CHAT,
//        JOIN,
//        LEAVE,
//    }

//    public ChatRoomInfoMessage(ChatMessage chatMessage, Room room){
//        this.messageType = ChatMessage.MessageType.LEAVE;
//        this.content = chatMessage.getContent();
//        this.sender = chatMessage.getSender();
//        this.roomId = chatMessage.getRoomId();
//
//    }
}
