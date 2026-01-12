package com.example.server.payload.request;

import lombok.Getter;
import lombok.Setter;

@Getter @Setter
public class SetAnswerRequest {
    private Long roomId;
    private String nickname;
    private String targetNickname;
    private String answer;
}
