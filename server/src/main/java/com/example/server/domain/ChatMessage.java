package com.example.server.domain;

import lombok.Getter;
import lombok.Setter;

@Getter @Setter
public class ChatMessage {
    private MessageType messageType;
    private String content;
    private String sender;
    private String roomId;

    public enum MessageType{
        CHAT,
        JOIN,
        LEAVE
    }



}
