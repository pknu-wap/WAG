package com.example.server.domain;

import lombok.Getter;
import lombok.Setter;

import java.util.List;

@Getter @Setter
public class ChatMessage {
    private MessageType messageType;
    private String content;
    private String sender;
    private Long roomId;
    public enum MessageType{
        CHAT,
        JOIN,
        LEAVE
    }
}
