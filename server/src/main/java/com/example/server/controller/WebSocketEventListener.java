package com.example.server.controller;

import com.example.server.domain.ChatMessage;
import com.example.server.repository.RoomRepository;
import com.example.server.repository.RoomUserRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.context.event.EventListener;
import org.springframework.messaging.simp.SimpMessageSendingOperations;
import org.springframework.messaging.simp.stomp.StompHeaderAccessor;
import org.springframework.stereotype.Component;
import org.springframework.web.socket.messaging.SessionConnectedEvent;
import org.springframework.web.socket.messaging.SessionDisconnectEvent;

@Component
public class WebSocketEventListener {
    private static final Logger logger = LoggerFactory.getLogger(WebSocketEventListener.class);

    private final SimpMessageSendingOperations messagingTemplate;
    private final RoomUserRepository roomUserRepository;
    @Autowired
    public WebSocketEventListener(RoomUserRepository roomUserRepository, SimpMessageSendingOperations messagingTemplate){
        this.roomUserRepository = roomUserRepository;
        this.messagingTemplate = messagingTemplate;
    }

    @EventListener
    public void handleWebSocketConnectListener(SessionConnectedEvent event) {
        logger.info("Received a new web socket connection");
    }

    @EventListener
    public void handleWebSocketDisconnectListener(SessionDisconnectEvent event) {
        StompHeaderAccessor headerAccessor = StompHeaderAccessor.wrap(event.getMessage());

        String username = (String) headerAccessor.getSessionAttributes().get("username"); //TODO : username이 맞는가? 맞네요
        String roomId = (String) headerAccessor.getSessionAttributes().get("roomId");

        if(username != null && roomId != null) {
            logger.info("User Disconnected : " + username);

            ChatMessage chatMessage = new ChatMessage();
            chatMessage.setMessageType(ChatMessage.MessageType.LEAVE);
            chatMessage.setSender(username);

            roomUserRepository.deleteRoomUserByNickname(username);

            messagingTemplate.convertAndSend("/topic/public/"+roomId, chatMessage);
        }
    }
}
