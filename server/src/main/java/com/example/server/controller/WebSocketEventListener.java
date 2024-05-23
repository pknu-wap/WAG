package com.example.server.controller;

import com.example.server.domain.GameOrder;
import com.example.server.domain.Room;
import com.example.server.domain.RoomUser;
import com.example.server.dto.ChatGameMessage;
import com.example.server.dto.ChatMessage;
import com.example.server.dto.ChatRoomInfoMessage;
import com.example.server.dto.UserDto;
import com.example.server.exception.NoSuchGameOrderException;
import com.example.server.exception.NoSuchRoomException;
import com.example.server.exception.NoSuchRoomUserException;
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

            RoomUser roomUser = roomUserRepository.hasNickName(username, roomId)
                    .orElseThrow(()-> new NoSuchRoomUserException(roomId));
            Room room = roomRepository.findById(roomId)
                    .orElseThrow(()-> new NoSuchRoomException(roomId));

            if(room.isGameStatus()){  // 만약 게임 중이라면 해당 유저 게임 진행 정보 삭제
                if(room.getUserCount() == 1){  // 나간 사람이 마지막 사람이라면 방 삭제
                    deleteRoomUser(roomUser);
                    roomRepository.delete(room);
                    return;
                }
                else if(room.getUserCount() == 2){  // 나간 사람이 마지막 한명이라면 게임 종료
                    ChatGameMessage chatGameMessage;
                    chatGameMessage = new ChatGameMessage();
                    chatGameMessage.setMessageType(ChatMessage.MessageType.END);
                    chatGameMessage.setContent("혼자 남았구나..");
                    String destination = "/topic/public/"+room.getId();
                    deleteRoomUser(roomUser);
                    messagingTemplate.convertAndSend(destination, chatGameMessage);
                    room.setGameStatus(false);
                    roomRepository.save(room);

                    return;
                }
                nowUserOut = updateGameOrder(roomUser);
            }

            room.setUserCount(room.getUserCount() - 1);  // 유저 수 -1
            ChatRoomInfoMessage chatRoomInfoMessage = new ChatRoomInfoMessage();
            chatRoomInfoMessage.setContent(username + " 님이 방을 떠났습니다. ");
            chatRoomInfoMessage.setMessageType(ChatMessage.MessageType.LEAVE);


            if(roomUser.isCaptain()){   // 나간 사람이 방장이라면 방장 위임
                RoomUser nextCaption = roomUserRepository.findNextCaptinByRandom(roomId)
                        .orElseThrow(() -> new NoSuchRoomUserException(roomId));
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

            deleteRoomUser(roomUser);

            roomRepository.save(room);  // 룸 정보 저장.
            List <RoomUser> roomUsers = roomUserRepository.findByRoomId(roomId);
            chatRoomInfoMessage.setSender(username);
            chatRoomInfoMessage.setRoomId(roomId);
            chatRoomInfoMessage.setRoomResponse(RoomResponse.create(room, UserDto.makeUserDtos(roomUsers)));

            messagingTemplate.convertAndSend("/topic/public/"+roomId, chatRoomInfoMessage);
        }
    }
    public boolean updateGameOrder(RoomUser roomUser){
        GameOrder gameOrder = gameOrderRepository.findByRoomUser(roomUser)
                .orElseThrow(NoSuchGameOrderException::new);
        int nowOrder = gameOrder.getUserOrder();
        boolean nowTurn = gameOrder.isNowTurn();
        boolean nextTurn = gameOrder.isNextTurn();
        Room room = gameOrder.getRoom();

        List<GameOrder> gameOrders = gameOrderRepository.findBackUser(gameOrder.getRoom().getId(), nowOrder+1, gameOrder.getRoom().getUserCount());
        for(GameOrder go : gameOrders){
            go.setUserOrder(go.getUserOrder()-1);
            gameOrderRepository.save(go);
        }

        deleteGameOrder(gameOrder);

        if(nowTurn){
            GameOrder nowGo = gameOrderRepository.findByUserOrder(nowOrder, room.getId())
                    .orElseThrow(NoSuchGameOrderException::new);
            int nextOrder = nowOrder + 1;
            if(nextOrder >= room.getUserCount()){
                nextOrder = 1;
            }
            GameOrder nextGo = gameOrderRepository.findByUserOrder(nextOrder, room.getId())
                    .orElseThrow(NoSuchGameOrderException::new);
            nowGo.setNowTurn(true);
            nowGo.setNextTurn(false);
            nextGo.setNextTurn(true);
            nowGo.setNowTurn(false);
            gameOrderRepository.save(nextGo);
            gameOrderRepository.save(nowGo);
        }
        if(nextTurn){
            GameOrder go = gameOrderRepository.findByUserOrder(nowOrder, room.getId())
                    .orElseThrow(NoSuchGameOrderException::new);
            go.setNextTurn(true);
            go.setNowTurn(false);
            gameOrderRepository.save(go);
            return true;
        }

        return false;
    }

    public void deleteRoomUser(RoomUser roomUser) {
        if (roomUser != null) {
            GameOrder gameOrder = roomUser.getGameOrder();
            if (gameOrder != null) {
                roomUser.setGameOrder(null);
                gameOrder.setRoomUser(null);
                gameOrderRepository.save(gameOrder);  // 관계를 제거한 후 업데이트
                roomUserRepository.save(roomUser);    // 관계를 제거한 후 업데이트
                gameOrderRepository.delete(gameOrder); // GameOrder 삭제
            }
            roomUserRepository.delete(roomUser); // RoomUser 삭제
        }
    }

    public void deleteGameOrder(GameOrder gameOrder) {
        if (gameOrder != null) {
            RoomUser roomUser = gameOrder.getRoomUser();
            if (roomUser != null) {
                roomUser.setGameOrder(null);
                gameOrder.setRoomUser(null);
                gameOrderRepository.save(gameOrder);  // 관계를 제거한 후 업데이트
                roomUserRepository.save(roomUser);    // 관계를 제거한 후 업데이트
                roomUserRepository.delete(roomUser); // RoomUser 삭제
            }
            gameOrderRepository.delete(gameOrder); // GameOrder 삭제
        }
    }
}
