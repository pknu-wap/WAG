package com.example.server.controller;

import com.example.server.domain.ChatGameMessage;
import com.example.server.domain.ChatMessage;
import com.example.server.payload.response.AnswerListResponse;
import com.example.server.payload.response.ResultResponse;
import com.example.server.payload.response.RoomResponse;
import com.example.server.service.ChatService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.messaging.handler.annotation.MessageMapping;
import org.springframework.messaging.handler.annotation.Payload;
import org.springframework.messaging.simp.SimpMessageHeaderAccessor;
import org.springframework.messaging.simp.SimpMessageSendingOperations;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

@RestController
public class ChatController {
    private final SimpMessageSendingOperations messagingTemplate;
    private final ChatService chatService;

    @Autowired
    public ChatController(SimpMessageSendingOperations messagingTemplate, ChatService chatService){
        this.messagingTemplate = messagingTemplate;
        this.chatService = chatService;
    }

    @MessageMapping("/chat.sendMessage")
    public ChatMessage sendMessage(@Payload ChatMessage chatMessage) {
        String destination = "/topic/public/"+chatMessage.getRoomId();

        messagingTemplate.convertAndSend(destination, chatMessage);
        return chatMessage;
    }

    @MessageMapping("/chat.sendGameMessage")
    public ChatGameMessage sendGameMessage(@Payload ChatMessage chatMessage) {
        String destination = "/topic/public/"+chatMessage.getRoomId();
        ChatGameMessage chatGameMessage = chatService.setGame(chatMessage);
        messagingTemplate.convertAndSend(destination, chatGameMessage);
        return chatGameMessage;
    }

    @MessageMapping("/chat.changeMode")
    public ChatGameMessage changeGameMessage(@Payload ChatMessage chatMessage) {
        String destination = "/topic/public/"+chatMessage.getRoomId();
        ChatGameMessage chatGameMessage = chatService.setGame(chatMessage);
        messagingTemplate.convertAndSend(destination, chatGameMessage);
        return chatGameMessage;
    }

    @MessageMapping("/chat.addUser")
    public ChatMessage addUser(@Payload ChatMessage chatMessage,
                               SimpMessageHeaderAccessor headerAccessor) {
        headerAccessor.getSessionAttributes().put("username", chatMessage.getSender());

        String sender = chatMessage.getSender();

        headerAccessor.getSessionAttributes().put("username", sender);
        headerAccessor.getSessionAttributes().put("roomId", chatMessage.getRoomId());

        ChatMessage response = new ChatMessage();
        response.setMessageType(ChatMessage.MessageType.JOIN);
        response.setSender(sender);
        response.setContent(sender + " 님이 입장하셨습니다.");
        response.setRoomId(chatMessage.getRoomId());
        messagingTemplate.convertAndSend("/topic/public/" + chatMessage.getRoomId(), response);

        return response;
    }

//    @GetMapping("/chat/result")
//    public ResponseEntity<ResultResponse> returnRoominfo(@RequestParam Long roomId){// 닉네임으로 게임 방 정보주기
//        ResultResponse resultResponse = chatService.endGame(roomId);
//        return new ResponseEntity<>(resultResponse, HttpStatus.OK);
//    }
//
    @GetMapping("/answer/list")
    public ResponseEntity<AnswerListResponse> getAnswerList(@RequestParam Long roomId, @RequestParam String nickname){// 닉네임으로 게임 방 정보주기
        AnswerListResponse answerListResponse = chatService.getAnswerList(roomId, nickname);
        return new ResponseEntity<>(answerListResponse, HttpStatus.OK);
    }


}
