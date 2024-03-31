package com.example.server.service;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.messaging.simp.SimpMessageSendingOperations;
import org.springframework.stereotype.Service;

@Service
public class ChatService {
    @Autowired
    private SimpMessageSendingOperations messagingTemplate;


}
