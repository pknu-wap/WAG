package com.example.server.dto;

import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.util.List;

@Getter
@Setter
@NoArgsConstructor
public class ChatReadyMessage {
    private ChatMessage.MessageType messageType;
    private String content;
    private String sender;
    private Long roomId;
    private List<UserDto> UserDtos;

    public ChatReadyMessage(ChatMessage chatMessage, List<UserDto> UserDtos){
        this.messageType = chatMessage.getMessageType();
        this.content = chatMessage.getContent();
        this.sender = chatMessage.getSender();
        this.roomId = chatMessage.getRoomId();
        this.UserDtos = UserDtos;
    }
}
