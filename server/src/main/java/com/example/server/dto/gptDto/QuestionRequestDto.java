package com.example.server.dto.gptDto;

import lombok.Getter;
import lombok.Setter;

import java.io.Serializable;

@Getter
public class QuestionRequestDto implements Serializable {
    private String question;

}
