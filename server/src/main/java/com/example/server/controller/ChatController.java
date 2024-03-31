package com.example.server.controller;

import com.example.server.domain.ChatGameMessage;
import com.example.server.domain.ChatMessage;
import com.example.server.service.ChatService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.messaging.handler.annotation.MessageMapping;
import org.springframework.messaging.handler.annotation.Payload;
import org.springframework.messaging.simp.SimpMessageHeaderAccessor;
import org.springframework.messaging.simp.SimpMessageSendingOperations;
import org.springframework.web.bind.annotation.*;

@RestController
public class ChatController {
    @Autowired
    private SimpMessageSendingOperations messagingTemplate;
    @Autowired
    private ChatService chatService;

    @MessageMapping("/chat.sendMessage")
    public ChatMessage sendMessage(@Payload ChatMessage chatMessage) {
        String destination = "/topic/public/"+chatMessage.getRoomId();

        messagingTemplate.convertAndSend(destination, chatMessage);
        return chatMessage;
    }

    @MessageMapping("/chat.sendGameMessage")
    public ChatGameMessage sendGameMessage(@Payload ChatGameMessage chatGameMessage) {
        String destination = "/topic/public/"+chatGameMessage.getRoomId();

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

}
