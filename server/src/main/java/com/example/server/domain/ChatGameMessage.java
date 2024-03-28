package com.example.server.domain;

import com.example.server.dto.GameUserDto;
import lombok.Getter;
import lombok.Setter;

import java.util.List;
@Getter
@Setter
public class ChatGameMessage {
    private ChatMessage.MessageType messageType;
    private String content;
    private String sender;
    private Long roomId;
    private boolean gameEnd;
    private int cycle;
    private List<GameUserDto> gameUserDtos;
    public enum MessageType{
        ASK,
        ANSWER,
        CORRECT
    }
}
