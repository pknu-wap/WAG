package com.example.server.dto;

import com.example.server.domain.Room;
import lombok.Getter;
import lombok.Setter;

@Getter @Setter
public class ChatRoomModeMessage {
    private ChatMessage.MessageType messageType;
    private String content;
    private String sender;
    private Long roomId;
    private boolean isPrivateRoom;

    public ChatRoomModeMessage (ChatMessage chatMessage, Room room){
        this.messageType = chatMessage.getMessageType();
        this.content = chatMessage.getContent();
        this.sender = chatMessage.getSender();
        this.roomId = chatMessage.getRoomId();
        this.isPrivateRoom = room.isPrivateRoom();
    }
}
