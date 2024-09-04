package com.example.server.controller;

import com.example.server.dto.*;
import com.example.server.payload.response.AnswerListResponse;
import com.example.server.payload.response.RoomResponse;
import com.example.server.security.CurrentUser;
import com.example.server.security.UserPrincipal;
import com.example.server.service.ChatService;
import com.example.server.service.GameService;
import com.example.server.service.RoomService;
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

import java.util.Objects;

@RestController
public class ChatController {
    private final SimpMessageSendingOperations messagingTemplate;
    private final ChatService chatService;
    private final RoomService roomService;

    @Autowired
    public ChatController(SimpMessageSendingOperations messagingTemplate, ChatService chatService,
                          RoomService roomService){
        this.messagingTemplate = messagingTemplate;
        this.chatService = chatService;
        this.roomService = roomService;
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
    public ChatRoomModeMessage changeGameMode(@Payload ChatMessage chatMessage) {
        String destination = "/topic/public/"+chatMessage.getRoomId();
        ChatRoomModeMessage chatRoomModeMessage = roomService.changeRoomMode(chatMessage);
        messagingTemplate.convertAndSend(destination, chatRoomModeMessage);
        return chatRoomModeMessage;
    }

    @MessageMapping("/chat.ready")
    public ChatReadyMessage setReady(@Payload ChatMessage chatMessage) {
        String destination = "/topic/public/"+chatMessage.getRoomId();
        ChatReadyMessage chatReadyMessage = roomService.setReady(chatMessage);
        chatReadyMessage.setMessageType(ChatMessage.MessageType.READY);
        messagingTemplate.convertAndSend(destination, chatReadyMessage);
        return chatReadyMessage;
    }

    @MessageMapping("/chat.setCategory")
    public ChatMessage setCategory(@Payload ChatMessage chatMessage) {
        String destination = "/topic/public/"+chatMessage.getRoomId();
        ChatMessage rechatMessage = roomService.setCategory(chatMessage);
        rechatMessage.setMessageType(ChatMessage.MessageType.CATEGORY);
        messagingTemplate.convertAndSend(destination, rechatMessage);
        return rechatMessage;
    }

    @MessageMapping("/chat.setTimer")
    public ChatMessage setTimer(@Payload ChatMessage chatMessage) {
        String destination = "/topic/public/"+chatMessage.getRoomId();
        ChatMessage rechatMessage = roomService.setTimer(chatMessage);
        rechatMessage.setMessageType(ChatMessage.MessageType.TIMER);
        messagingTemplate.convertAndSend(destination, rechatMessage);
        return rechatMessage;
    }

    @MessageMapping("/chat.addUser")
    public ChatRoomInfoMessage addUser(@Payload ChatMessage chatMessage,
                                       SimpMessageHeaderAccessor headerAccessor,
                                       @CurrentUser UserPrincipal userPrincipal) {   // 방장 아닌 유저 소켓 연결
        String sender = chatMessage.getSender();
        headerAccessor.getSessionAttributes().put("username", sender);
        headerAccessor.getSessionAttributes().put("roomId", chatMessage.getRoomId());

        RoomResponse roomResponse = roomService.enterRoomByRoomId(chatMessage.getSender(),chatMessage.getRoomId(), userPrincipal);  // 해당 방에 입장하는 로직
        ChatRoomInfoMessage chatRoomInfoMessage = new ChatRoomInfoMessage();
        chatRoomInfoMessage.setMessageType(ChatMessage.MessageType.JOIN);
        chatRoomInfoMessage.setSender(sender);
        chatRoomInfoMessage.setContent(sender + " 님이 입장하셨습니다.");
        chatRoomInfoMessage.setRoomId(chatMessage.getRoomId());
        chatRoomInfoMessage.setRoomResponse(roomResponse);
        messagingTemplate.convertAndSend("/topic/public/" + chatMessage.getRoomId(), chatRoomInfoMessage);

        return chatRoomInfoMessage;
    }

    @MessageMapping("/chat.addCaptainUser")   // 방장 소켓 연결
    public ChatMessage addCaptainUser(@Payload ChatMessage chatMessage,
                                      SimpMessageHeaderAccessor headerAccessor) {
        String sender = chatMessage.getSender();
        Objects.requireNonNull(headerAccessor.getSessionAttributes()).put("username", sender);
        headerAccessor.getSessionAttributes().put("roomId", chatMessage.getRoomId());
        chatMessage.setMessageType(ChatMessage.MessageType.JOIN);
        messagingTemplate.convertAndSend("/topic/public/" + chatMessage.getRoomId(), chatMessage);

        return chatMessage;
    }

    @GetMapping("/answer/list")
    public ResponseEntity<AnswerListResponse> getAnswerList(@RequestParam Long roomId, @RequestParam String nickname){// 닉네임으로 게임 방 정보주기
        AnswerListResponse answerListResponse = GameService.getAnswerList(roomId, nickname);
        return new ResponseEntity<>(answerListResponse, HttpStatus.OK);
    }


}
