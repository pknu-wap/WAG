package com.example.server.dto.gptDto;

import lombok.Getter;
import lombok.Setter;

@Setter
@Getter
public class GptMessage {

    private String content;
    private String role = "user";

    public GptMessage(String content) {
        this.content = content;
    }
}
