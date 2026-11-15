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
        CUSTOM,   // 서로 이름 지어주기 on/off (방장)
        NAMING,   // 제시어 입력 단계 시작 (서버 → 전원)
        NAME,     // 제시어 입력 (참가자 → 서버), 서버는 남은 인원 수를 돌려줌
        CANCEL,   // 제시어 입력 단계 취소 → 대기방 복귀
    }
}
