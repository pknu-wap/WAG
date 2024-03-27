package com.example.server.controller;

import com.example.server.domain.ChatMessage;
import com.example.server.domain.Room;
import com.example.server.repository.RoomRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.messaging.handler.annotation.MessageMapping;
import org.springframework.messaging.handler.annotation.Payload;
import org.springframework.messaging.simp.SimpMessageHeaderAccessor;
import org.springframework.messaging.simp.SimpMessageSendingOperations;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.*;

@Controller
public class ChatController {
    @Autowired
    private RoomRepository roomRepository;
    @Autowired
    private SimpMessageSendingOperations messagingTemplate;

    @MessageMapping("/chat.sendMessage")
    public ChatMessage sendMessage(@Payload ChatMessage chatMessage) {
        String destination = "/topic/public/"+chatMessage.getRoomId();

        messagingTemplate.convertAndSend(destination, chatMessage);
        return chatMessage;
    }

    @MessageMapping("/chat.sendGameMessage")
    public ChatMessage sendGameMessage(@Payload ChatMessage chatMessage) {
        String destination = "/topic/public/"+chatMessage.getRoomId();

        messagingTemplate.convertAndSend(destination, chatMessage);
        return chatMessage;
    }

    @MessageMapping("/chat.addUser")
    public ChatMessage addUser(@Payload ChatMessage chatMessage,
                               SimpMessageHeaderAccessor headerAccessor) {
        headerAccessor.getSessionAttributes().put("username", chatMessage.getSender());

        String sender = roomRepository.addUser(chatMessage.getRoomId(), chatMessage.getSender());

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

//    @GetMapping("/chatrooms")
//    public ResponseEntity<List<Room>> getChatRoomList(){
//        List<Room> chatRooms = chatRoomRepository.getChatRoomList();
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
//        Room chatroom = chatRoomRepository.createChatRoom();
//        return new ResponseEntity<>(chatroom, HttpStatus.OK);
//    }

    @PostMapping("/room/create")
    public ResponseEntity<Room> createChatRoom(@RequestBody String roomName){
        Room chatroom = roomRepository.createChatRoom(roomName);
        return new ResponseEntity<>(chatroom, HttpStatus.OK);
    }
}
