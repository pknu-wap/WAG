package com.example.server.controller;

import com.example.server.domain.ChatMessage;
import com.example.server.domain.ChatRoom;
import com.example.server.repository.ChatRoomRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.messaging.handler.annotation.MessageMapping;
import org.springframework.messaging.handler.annotation.Payload;
import org.springframework.messaging.simp.SimpMessageHeaderAccessor;
import org.springframework.messaging.simp.SimpMessageSendingOperations;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@Controller
public class ChatController {
    @Autowired
    private ChatRoomRepository chatRoomRepository;
    @Autowired
    private SimpMessageSendingOperations messagingTemplate;

    @MessageMapping("/chat.sendMessage")
    public ChatMessage sendMessage(@Payload ChatMessage chatMessage) {
        String destination = "/pub/"+chatMessage.getRoomId();

        messagingTemplate.convertAndSend(destination, chatMessage);
        return chatMessage;
    }

    @MessageMapping("/chat.addUser")
    public ChatMessage addUser(@Payload ChatMessage chatMessage,
                               SimpMessageHeaderAccessor headerAccessor) {
        headerAccessor.getSessionAttributes().put("username", chatMessage.getSender());

        String sender = chatRoomRepository.addUser(chatMessage.getRoomId(), chatMessage.getSender());

        headerAccessor.getSessionAttributes().put("username", sender);
        headerAccessor.getSessionAttributes().put("roomId", chatMessage.getRoomId());

        ChatMessage response = new ChatMessage();
        response.setMessageType(ChatMessage.MessageType.JOIN);
        response.setSender(sender);
        response.setContent(sender + " 님이 입장하셨습니다.");
        response.setRoomId(chatMessage.getRoomId());
        messagingTemplate.convertAndSend("/pub/" + chatMessage.getRoomId(), response);

        return response;
    }

//    @GetMapping("/chatrooms")
//    public ResponseEntity<List<ChatRoom>> getChatRoomList(){
//        List<ChatRoom> chatRooms = chatRoomRepository.getChatRoomList();
//
//        return new ResponseEntity<>(chatRooms, HttpStatus.OK);
//    }

//    @ResponseBody
//    @GetMapping("/roomname")
//    public ResponseEntity<String> getRoomName(@RequestParam String roomId){
//        String roomName = chatRoomRepository.getRoomName(roomId);
//        return new ResponseEntity<>(roomName, HttpStatus.OK);
//    }


//    @GetMapping("/room/info")
//    public ResponseEntity<> returnRoominfo(@RequestBody String nickName){
//        ChatRoom chatroom = chatRoomRepository.createChatRoom();
//        return new ResponseEntity<>(chatroom, HttpStatus.OK);
//    }

    @PostMapping("/chatroom")
    public ResponseEntity<ChatRoom> createChatRoom(@RequestBody String roomName){
        ChatRoom chatroom = chatRoomRepository.createChatRoom(roomName);
        return new ResponseEntity<>(chatroom, HttpStatus.OK);
    }
}
