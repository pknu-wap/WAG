package com.example.server.controller;

import com.example.server.domain.GameOrder;
import com.example.server.domain.Room;
import com.example.server.domain.RoomUser;
import com.example.server.dto.ChatGameMessage;
import com.example.server.dto.ChatMessage;
import com.example.server.dto.ChatRoomInfoMessage;
import com.example.server.dto.UserDto;
import com.example.server.payload.response.RoomResponse;
import com.example.server.repository.GameOrderRepository;
import com.example.server.repository.RoomRepository;
import com.example.server.repository.RoomUserRepository;
import com.example.server.service.ChatService;
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
    private final ChatService chatService;

    @EventListener
    public void handleWebSocketConnectListener(SessionConnectedEvent event) {
        logger.info("Received a new web socket connection");
    }

    @EventListener
    public void handleWebSocketDisconnectListener(SessionDisconnectEvent event) {
        StompHeaderAccessor headerAccessor = StompHeaderAccessor.wrap(event.getMessage());

        String username = (String) headerAccessor.getSessionAttributes().get("username");
        Long roomId = (Long) headerAccessor.getSessionAttributes().get("roomId");
        boolean nowUserOut = false;

        if(username != null && roomId != null) {
            logger.info("User Disconnected : " + username);

            RoomUser roomUser = roomUserRepository.hasNickName(username, roomId).get();
            Room room = roomRepository.findById(roomId).get();

            if(room.isGameStatus()){  // 만약 게임 중이라면 해당 유저 게임 진행 정보 삭제
                nowUserOut = updateGameOrder(roomUser);
            }

            room.setUserCount(room.getUserCount() - 1);  // 유저 수 -1
            ChatRoomInfoMessage chatRoomInfoMessage = new ChatRoomInfoMessage();
            chatRoomInfoMessage.setContent(username + " 님이 방을 떠났습니다. ");
            chatRoomInfoMessage.setMessageType(ChatMessage.MessageType.LEAVE);



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

            if(nowUserOut){   // 본인 턴인 사람이 탈주했을 경우.
                ChatMessage chatMessage = new ChatMessage();
                chatMessage.setMessageType(null);
                chatMessage.setSender("");
                chatMessage.setContent("질문자 탈주하여 다음 턴으로 넘어갑니다");
                chatMessage.setRoomId(roomId);
                ChatGameMessage chatGameMessage = chatService.makeChatGameMessage(chatMessage, room);
                messagingTemplate.convertAndSend("/topic/public/"+roomId, chatGameMessage);
            }

            roomUserRepository.delete(roomUser);

            roomRepository.save(room);  // 룸 정보 저장.
            List <RoomUser> roomUsers = roomUserRepository.findByRoomId(roomId);
            chatRoomInfoMessage.setSender(username);
            chatRoomInfoMessage.setRoomId(roomId);
            chatRoomInfoMessage.setRoomResponse(RoomResponse.create(room, UserDto.makeUserDtos(roomUsers)));

            messagingTemplate.convertAndSend("/topic/public/"+roomId, chatRoomInfoMessage);
        }
    }
    public boolean updateGameOrder(RoomUser roomUser){
        GameOrder gameOrder = gameOrderRepository.findGameOrderByUserId(roomUser.getId()).get();
        int nowOrder = gameOrder.getUserOrder();
        boolean nowturn = gameOrder.isNowTurn();
        boolean nextturn = gameOrder.isNextTurn();
        Room room = gameOrder.getRoom();

        List<GameOrder> gameOrders = gameOrderRepository.findBackUser(gameOrder.getRoom().getId(), nowOrder+1, gameOrder.getRoom().getUserCount());
        for(GameOrder go : gameOrders){
            go.setUserOrder(go.getUserOrder()-1);
            gameOrderRepository.save(go);
        }

        gameOrderRepository.delete(gameOrder);

        if(nowturn){
            GameOrder nowGo = gameOrderRepository.findByUserOrder(nowOrder, room.getId()).get();
            int nextOrder = nowOrder + 1;
            if(nextOrder >= room.getUserCount()){
                nextOrder = 1;
            }
            GameOrder nextGo = gameOrderRepository.findByUserOrder(nextOrder, room.getId()).get();
            nowGo.setNowTurn(true);
            nowGo.setNextTurn(false);
            nextGo.setNextTurn(true);
            nowGo.setNowTurn(false);
            gameOrderRepository.save(nextGo);
            gameOrderRepository.save(nowGo);
        }
        if(nextturn){
            GameOrder go = gameOrderRepository.findByUserOrder(nowOrder, room.getId()).get();
            go.setNextTurn(true);
            go.setNowTurn(false);
            gameOrderRepository.save(go);
            return true;
        }

        return false;
    }
}
