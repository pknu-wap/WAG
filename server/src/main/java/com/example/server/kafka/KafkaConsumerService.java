package com.example.server.kafka;

import com.example.server.dto.*;
import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.RequiredArgsConstructor;
import org.springframework.kafka.annotation.KafkaListener;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class KafkaConsumerService {
    private final SimpMessagingTemplate messagingTemplate;
    private final ObjectMapper objectMapper;

    @KafkaListener(topics = "chat-topic", groupId = "websocket-group")
    public void consumeChat(String rawMessage) {
        try {
            ChatMessage message = objectMapper.readValue(rawMessage, ChatMessage.class);
            messagingTemplate.convertAndSend("/topic/public/" + message.getRoomId(), message);
        } catch (JsonProcessingException e) {
            handleException("chat-topic", rawMessage, e);
        }
    }

    @KafkaListener(topics = "game-topic", groupId = "websocket-group")
    public void consumeGame(String rawMessage) {
        try {
            ChatGameMessage message = objectMapper.readValue(rawMessage, ChatGameMessage.class);
            messagingTemplate.convertAndSend("/topic/public/" + message.getRoomId(), message);
        } catch (JsonProcessingException e) {
            handleException("game-topic", rawMessage, e);
        }
    }

    @KafkaListener(topics = "mode-topic", groupId = "websocket-group")
    public void consumeMode(String rawMessage) {
        try {
            ChatRoomModeMessage message = objectMapper.readValue(rawMessage, ChatRoomModeMessage.class);
            messagingTemplate.convertAndSend("/topic/public/" + message.getRoomId(), message);
        } catch (JsonProcessingException e) {
            handleException("mode-topic", rawMessage, e);
        }
    }

    @KafkaListener(topics = "ready-topic", groupId = "websocket-group")
    public void consumeReady(String rawMessage) {
        try {
            ChatReadyMessage message = objectMapper.readValue(rawMessage, ChatReadyMessage.class);
            messagingTemplate.convertAndSend("/topic/public/" + message.getRoomId(), message);
        } catch (JsonProcessingException e) {
            handleException("ready-topic", rawMessage, e);
        }
    }

    @KafkaListener(topics = "category-topic", groupId = "websocket-group")
    public void consumeCategory(String rawMessage) {
        try {
            ChatMessage message = objectMapper.readValue(rawMessage, ChatMessage.class);
            messagingTemplate.convertAndSend("/topic/public/" + message.getRoomId(), message);
        } catch (JsonProcessingException e) {
            handleException("category-topic", rawMessage, e);
        }
    }

    @KafkaListener(topics = "timer-topic", groupId = "websocket-group")
    public void consumeTimer(String rawMessage) {
        try {
            ChatMessage message = objectMapper.readValue(rawMessage, ChatMessage.class);
            messagingTemplate.convertAndSend("/topic/public/" + message.getRoomId(), message);
        } catch (JsonProcessingException e) {
            handleException("timer-topic", rawMessage, e);
        }
    }

    @KafkaListener(topics = "add-topic", groupId = "websocket-group")
    public void consumeAddUser(String rawMessage) {
        try {
            ChatRoomInfoMessage message = objectMapper.readValue(rawMessage, ChatRoomInfoMessage.class);
            messagingTemplate.convertAndSend("/topic/public/" + message.getRoomId(), message);
        } catch (JsonProcessingException e) {
            handleException("add-topic", rawMessage, e);
        }
    }

    @KafkaListener(topics = "add-captain-topic", groupId = "websocket-group")
    public void consumeAddCaptain(String rawMessage) {
        try {
            ChatMessage message = objectMapper.readValue(rawMessage, ChatMessage.class);
            messagingTemplate.convertAndSend("/topic/public/" + message.getRoomId(), message);
        } catch (JsonProcessingException e) {
            handleException("add-captain-topic", rawMessage, e);
        }
    }


    private void handleException(String topic, String payload, Exception e) {
        System.err.println("❌ KafkaConsumer 실패 [" + topic + "] : " + e.getMessage());
        System.err.println("Payload: " + payload);
    }
}
