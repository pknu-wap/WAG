package com.example.server.dto;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.Setter;

@AllArgsConstructor
@Getter
@Setter
public class AnswerUserDto {
    private String nickname;
    private String answer;
}
