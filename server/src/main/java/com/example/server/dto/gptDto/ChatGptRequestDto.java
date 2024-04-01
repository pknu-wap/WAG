package com.example.server.dto.gptDto;

import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;

import java.io.Serializable;
import java.util.ArrayList;
import java.util.List;

@Getter
@NoArgsConstructor
public class ChatGptRequestDto implements Serializable {

    private String model;
    private List<GptMessage> message = new ArrayList<>();
    @JsonProperty("max_tokens")
    private Integer maxTokens;
    private Double temperature;
    @JsonProperty("top_p")
    private Double topP;

    @Builder
    public ChatGptRequestDto(String model, Integer maxTokens, GptMessage message,
                             Double temperature, Double topP) {
        this.model = model;
        this.maxTokens = maxTokens;
        this.message.add(message);
        this.temperature = temperature;
        this.topP = topP;
    }
}