package pororo.GPTtest.controller;

import com.fasterxml.jackson.core.JsonProcessingException;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import pororo.GPTtest.dto.ChatGptResponseDto;
import pororo.GPTtest.dto.GptMessage;
import pororo.GPTtest.dto.QuestionRequestDto;
import pororo.GPTtest.service.ChatGptService;

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
