package com.example.server.controller;

import com.example.server.domain.GameOrder;
import com.example.server.domain.Room;
import com.example.server.domain.RoomUser;
import com.example.server.dto.ChatMessage;
import com.example.server.dto.ChatRoomInfoMessage;
import com.example.server.dto.UserDto;
import com.example.server.payload.response.RoomResponse;
import com.example.server.repository.GameOrderRepository;
import com.example.server.repository.RoomRepository;
import com.example.server.repository.RoomUserRepository;
import lombok.RequiredArgsConstructor;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.context.event.EventListener;
import org.springframework.messaging.simp.SimpMessageSendingOperations;
import org.springframework.messaging.simp.stomp.StompHeaderAccessor;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.socket.messaging.SessionConnectedEvent;
import org.springframework.web.socket.messaging.SessionDisconnectEvent;

import java.util.List;

@Component
@RequiredArgsConstructor
@Transactional
public class WebSocketEventListener {
    private static final Logger logger = LoggerFactory.getLogger(WebSocketEventListener.class);

    private final SimpMessageSendingOperations messagingTemplate;
    private final RoomUserRepository roomUserRepository;
    private final RoomRepository roomRepository;
    private final GameOrderRepository gameOrderRepository;

    @EventListener
    public void handleWebSocketConnectListener(SessionConnectedEvent event) {
        logger.info("Received a new web socket connection");
    }

    @EventListener
    public void handleWebSocketDisconnectListener(SessionDisconnectEvent event) {
        StompHeaderAccessor headerAccessor = StompHeaderAccessor.wrap(event.getMessage());

        String username = (String) headerAccessor.getSessionAttributes().get("username");
        Long roomId = (Long) headerAccessor.getSessionAttributes().get("roomId");

        if(username != null && roomId != null) {
            logger.info("User Disconnected : " + username);

            RoomUser roomUser = roomUserRepository.hasNickName(username, roomId).get();
            Room room = roomRepository.findById(roomId).get();
            room.setUserCount(room.getUserCount() - 1);  // 유저 수 -1

            ChatRoomInfoMessage chatRoomInfoMessage = new ChatRoomInfoMessage();
            chatRoomInfoMessage.setContent(username + " 님이 방을 떠났습니다. ");

            if(room.isGameStatus()){  // 만약 게임 중이라면 해당 유저 게임 진행 정보 삭제
                GameOrder gameOrder = gameOrderRepository.findGameOrderByUserId(roomUser.getId()).get();
                gameOrderRepository.delete(gameOrder);
            }

            if(room.getUserCount() == 0){  // 나간 사람이 마지막 사람이라면 방 삭제
                roomUserRepository.delete(roomUser);
                roomRepository.delete(room);
                return;
            }
            else if(roomUser.isCaptain()){   // 나간 사람이 방장이라면 방장 위임
                RoomUser nextCaption = roomUserRepository.findNextCaptinByRandom(roomId).get();
                nextCaption.setCaptain(true);
                roomUserRepository.save(nextCaption);
                chatRoomInfoMessage.setContent(username + " 님이 방을 떠나 " + nextCaption.getRoomNickname() + " 님이 방장이 되었습니다.");
            }

            roomUserRepository.delete(roomUser);

            roomRepository.save(room);  // 룸 정보 저장.
            List <RoomUser> roomUsers = roomUserRepository.findByRoomId(roomId);
            chatRoomInfoMessage.setMessageType(ChatMessage.MessageType.LEAVE);
            chatRoomInfoMessage.setSender(username);
            chatRoomInfoMessage.setRoomId(roomId);
            chatRoomInfoMessage.setRoomResponse(RoomResponse.create(room, UserDto.makeUserDtos(roomUsers)));

            messagingTemplate.convertAndSend("/topic/public/"+roomId, chatRoomInfoMessage);
        }
    }
}
