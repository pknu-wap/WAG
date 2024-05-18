package com.example.server.dto;

import lombok.Getter;
import lombok.Setter;

@Getter @Setter
public class ChatMessage {
    private MessageType messageType;
    private String content;
    private String sender;
    private Long roomId;
    public enum MessageType{
        CHAT,
        JOIN,
        LEAVE,
        ASK,
        ANSWER,
        CORRECT,
        START,
        END,
        PENALTY,
        CHANGE,
    }
}
