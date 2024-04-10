package com.example.server.dto;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.Setter;

@AllArgsConstructor
@Getter
@Setter
public class ResultUserDto {
    private String roomNickname;
    private String profileImage;
    private String answerName;
    private int ranking;
}
