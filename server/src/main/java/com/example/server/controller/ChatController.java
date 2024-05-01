package com.example.server.controller;

import com.example.server.dto.ChatGameMessage;
import com.example.server.dto.ChatMessage;
import com.example.server.dto.ChatRoomInfoMessage;
import com.example.server.dto.ChatRoomModeMessage;
import com.example.server.payload.response.AnswerListResponse;
import com.example.server.payload.response.RoomResponse;
import com.example.server.service.ChatService;
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
        ChatRoomModeMessage chatRoomModeMessage = chatService.changeRoomMode(chatMessage);
        messagingTemplate.convertAndSend(destination, chatRoomModeMessage);
        return chatRoomModeMessage;
    }

    @MessageMapping("/chat.addUser")
    public ChatRoomInfoMessage addUser(@Payload ChatMessage chatMessage,
                               SimpMessageHeaderAccessor headerAccessor) {   // 방장 아닌 유저 소켓 연결
        headerAccessor.getSessionAttributes().put("username", chatMessage.getSender());
        String sender = chatMessage.getSender();
        headerAccessor.getSessionAttributes().put("username", sender);
        headerAccessor.getSessionAttributes().put("roomId", chatMessage.getRoomId());

        RoomResponse roomResponse = roomService.enterRoomByRoomId(chatMessage.getSender(),chatMessage.getRoomId());  // 해당 방에 입장하는 로직

        ChatRoomInfoMessage chatRoomInfoMessage = new ChatRoomInfoMessage();
        chatRoomInfoMessage.setMessageType(ChatMessage.MessageType.JOIN);
        chatRoomInfoMessage.setSender(sender);
        chatRoomInfoMessage.setContent(sender + " 님이 입장하셨습니다.");
        chatRoomInfoMessage.setRoomId(chatMessage.getRoomId());
        chatRoomInfoMessage.setRoomResponse(roomResponse);
        messagingTemplate.convertAndSend("/topic/public/" + chatMessage.getRoomId(), chatRoomInfoMessage);

        return chatRoomInfoMessage;
    }

    @MessageMapping("/chat.addCaptinUser")   // 방장 소켓 연결
    public ChatMessage addCaptinUser(@Payload ChatMessage chatMessage,
                                       SimpMessageHeaderAccessor headerAccessor) {
        headerAccessor.getSessionAttributes().put("username", chatMessage.getSender());
        String sender = chatMessage.getSender();
        headerAccessor.getSessionAttributes().put("username", sender);
        headerAccessor.getSessionAttributes().put("roomId", chatMessage.getRoomId());
        messagingTemplate.convertAndSend("/topic/public/" + chatMessage.getRoomId(), chatMessage);

        return chatMessage;
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
