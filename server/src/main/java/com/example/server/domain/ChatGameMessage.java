package com.example.server.domain;

import com.example.server.dto.UserDto;
import lombok.Getter;
import lombok.Setter;

import java.util.List;
@Getter
@Setter
public class ChatGameMessage {
    private ChatMessage.MessageType messageType;
    private String content;
    private String sender;
    private String roomId;
    private List<UserDto> userDtos;
    public enum MessageType{
        CHAT,
        JOIN,
        LEAVE
    }
}
