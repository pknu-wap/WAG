package com.example.server.dto;

import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.util.List;

@Getter
@Setter
@NoArgsConstructor
public class ChatGameMessage {
    private ChatMessage.MessageType messageType;
    private String content;
    private String sender;
    private Long roomId;
    private boolean gameEnd;
    private int cycle;
    private List<GameUserDto> gameUserDtos;
}
