package com.example.server.dto;

import jakarta.validation.constraints.Max;
import lombok.Getter;
import lombok.Setter;

@Getter @Setter
public class UserDto {
    private boolean isCaptain;
    private String roomNickname;
    private String profileImage;
    @Max(3)
    private int penalty;
    private String answerName;
    private boolean myTurn;
    private boolean ask;
    private int turn;
}
