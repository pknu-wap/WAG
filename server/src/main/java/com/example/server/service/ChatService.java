package com.example.server.service;

import com.example.server.domain.ChatMessage;
import com.example.server.domain.Room;
import com.example.server.domain.RoomUser;
import com.example.server.dto.UserDto;
import com.example.server.payload.RoomCreateRequest;
import com.example.server.payload.RoomResponse;
import com.example.server.repository.RoomRepository;
import com.example.server.repository.RoomUserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.messaging.simp.SimpMessageSendingOperations;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.List;

@Service
public class ChatService {
    @Autowired
    private SimpMessageSendingOperations messagingTemplate;


}
