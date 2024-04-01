package com.example.server.controller;

import com.example.server.dto.gptDto.ChatGptResponseDto;
import com.example.server.dto.gptDto.GptMessage;
import com.example.server.dto.gptDto.QuestionRequestDto;
import com.example.server.service.ChatGptService;
import com.fasterxml.jackson.core.JsonProcessingException;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/chat-gpt")
@RequiredArgsConstructor
public class ChatGptController {

    private final ChatGptService chatGptService;

    @PostMapping("/question")
    public ChatGptResponseDto sendQuestion(@RequestBody QuestionRequestDto requestDto) throws JsonProcessingException {
        GptMessage message = new GptMessage(requestDto.getQuestion());
        return chatGptService.askQuestion(message);
    }
}
