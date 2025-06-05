package com.example.server.dto;

import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter @Setter
@NoArgsConstructor
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
        OUT,
        RESET,
        READY,
        CATEGORY,
        TIMER,
        CHANGE,
    }
}
