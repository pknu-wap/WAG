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
import com.example.server.service.GameService;
import com.example.server.service.MessageService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.context.event.EventListener;
import org.springframework.messaging.simp.SimpMessageSendingOperations;
import org.springframework.messaging.simp.stomp.StompHeaderAccessor;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.socket.messaging.SessionConnectedEvent;
import org.springframework.web.socket.messaging.SessionDisconnectEvent;

import java.util.List;
import java.util.Objects;

@Component
@RequiredArgsConstructor
@Transactional
@Slf4j
public class WebSocketEventListener {

    private final SimpMessageSendingOperations messagingTemplate;
    private final RoomUserRepository roomUserRepository;
    private final RoomRepository roomRepository;
    private final GameOrderRepository gameOrderRepository;
    private final GameService gameService;

    @EventListener
    public void handleWebSocketConnectListener(SessionConnectedEvent event) {
        log.info("Received a new web socket connection");
    }

    @EventListener
    @Transactional
    public void handleWebSocketDisconnectListener(SessionDisconnectEvent event) throws InterruptedException {
        StompHeaderAccessor headerAccessor = StompHeaderAccessor.wrap(event.getMessage());

        String username = (String) Objects.requireNonNull(headerAccessor.getSessionAttributes()).get("username");
        Long roomId = (Long) headerAccessor.getSessionAttributes().get("roomId");
        String destination = "/topic/public/"+roomId;

        if(username != null && roomId != null) {
            log.info("User Disconnected : " + username);

            RoomUser roomUser = roomUserRepository.hasNickName(username, roomId)
                    .orElseThrow(()-> new NoSuchRoomUserException(roomId));
            Room room = roomRepository.findById(roomId)
                    .orElseThrow(()-> new NoSuchRoomException(roomId));

            // 나간 사람이 마지막 사람이라면 방 삭제
            if(room.getUserCount() == 1){
                roomUserRepository.delete(roomUser); // RoomUser 삭제
                roomRepository.delete(room);
                return;
            }

            if(room.isGameStatus()){  // 만약 게임 중이라면 해당 유저 게임 진행 정보 삭제
                GameOrder gameOrder = gameOrderRepository.findByRoomUser(roomUser)
                        .orElseThrow(NoSuchGameOrderException::new);
                if(gameOrder.getRanking() != 0){
                    room.setLeftCorrectMember(room.getLeftCorrectMember()-1);
                }
                if(room.getUserCount() - room.getLeftCorrectMember() <= 2){  // 나간 후에 사람이 한 명이면 게임 종료

                    ChatGameMessage chatGameMessage;
                    ChatMessage chatMessage = new ChatMessage();
                    chatMessage.setRoomId(roomId);
                    chatMessage.setContent("혼자 남았구나..");
                    chatMessage.setMessageType(ChatMessage.MessageType.END);
                    chatMessage.setSender(roomUser.getRoomNickname());

                    // END ChatGameMessage 전송
                    chatGameMessage = MessageService.makeChatGameMessage(chatMessage,room);
                    messagingTemplate.convertAndSend(destination, chatGameMessage);
                    room.setGameStatus(false);
                    roomRepository.save(room);
                }

                if(roomUser.isCaptain()){   // 나간 사람이 방장이라면 방장 위임
                    RoomUser nextCaption = roomUserRepository.findNextCaptinByRandom(roomId)
                            .orElseThrow(() -> new NoSuchRoomUserException(roomId));
                    nextCaption.setCaptain(true);
                    nextCaption.setReady(true);
                    roomUserRepository.save(nextCaption);
                    roomUser.setCaptain(false);
                }
                if(updateGameOrder(roomUser)){   // 현재 질문자가 나갔으면 true를 반환
                    ChatMessage chatMessage = new ChatMessage();
                    chatMessage.setMessageType(null);
                    chatMessage.setSender("");
                    chatMessage.setContent("질문자 탈주하여 다음 턴으로 넘어갑니다");
                    chatMessage.setRoomId(roomId);
                    ChatGameMessage chatGameMessage = MessageService.makeChatGameMessage(chatMessage, room);
                    messagingTemplate.convertAndSend(destination, chatGameMessage);
                }
                gameOrderRepository.delete(gameOrder);

            } // if(gameStatus == True)문 종료

            room.setUserCount(room.getUserCount() - 1);  // 유저 수 -1
            ChatRoomInfoMessage chatRoomInfoMessage = new ChatRoomInfoMessage();
            chatRoomInfoMessage.setContent(username + " 님이 방을 떠났습니다. ");
            chatRoomInfoMessage.setMessageType(ChatMessage.MessageType.LEAVE);


            if(roomUser.isCaptain()){   // 나간 사람이 방장이라면 방장 위임
                RoomUser nextCaption = roomUserRepository.findNextCaptinByRandom(roomId)
                        .orElseThrow(() -> new NoSuchRoomUserException(roomId));
                nextCaption.setCaptain(true);
                nextCaption.setReady(true);
                roomUserRepository.save(nextCaption);
                chatRoomInfoMessage.setContent(username + " 님이 방을 떠나 " + nextCaption.getRoomNickname() + " 님이 방장이 되었습니다.");
            }

            roomUserRepository.delete(roomUser);

            roomRepository.save(room);  // 룸 정보 저장.
            List <RoomUser> roomUsers = roomUserRepository.findByRoomId(roomId);
            chatRoomInfoMessage.setSender(username);
            chatRoomInfoMessage.setRoomId(roomId);
            chatRoomInfoMessage.setRoomResponse(RoomResponse.create(room, UserDto.makeUserDtos(roomUsers)));

            messagingTemplate.convertAndSend(destination, chatRoomInfoMessage);
        }
    }
    public boolean updateGameOrder(RoomUser roomUser) throws InterruptedException {
        boolean isNextTurn = false;
        GameOrder gameOrder = gameOrderRepository.findByRoomUser(roomUser)
                .orElseThrow(NoSuchGameOrderException::new);

        int nowOrder = gameOrder.getUserOrder();
        boolean nextTurn = gameOrder.isNextTurn();
        Room room = gameOrder.getRoom();

        // 이번 턴에 질문해야 하는 사람이 나간 사람과 같다면
        if (Objects.equals(room.getNowTurnUserId(), roomUser.getId())) {
            // ChatMessage 생성
            ChatMessage chatMessage = new ChatMessage();
            chatMessage.setContent("");
            chatMessage.setSender(roomUser.getRoomNickname());
            chatMessage.setRoomId(room.getId());

            // 만약 아직 질문을 하지 않았다면 -> 질문 처리
            if(nextTurn){

                int nextOrder = gameService.getNextTurn(nowOrder, room.getCurrentOrder(), room);
                GameOrder go = gameOrderRepository.findByUserOrder(nextOrder, room.getId())
                        .orElseThrow(NoSuchGameOrderException::new);

                go.setNextTurn(true);
                go.setNowTurn(false);
                gameOrderRepository.save(go);
                isNextTurn = true;

                // 강제 ASK 전송
                chatMessage.setMessageType(ChatMessage.MessageType.ASK);
                ChatGameMessage chatGameMessage = MessageService.makeChatGameMessage(chatMessage, room);
                messagingTemplate.convertAndSend("/topic/public/"+room.getId(), chatGameMessage);

                // 전송 후 프론트가 읽을 때까지 잠시 대기
                Thread.sleep(500);
            }

            // 질문을 한 유저가 나갔거나 질문 처리를 하지 않은 유저의 질문 처리 후 처리
            // 다음 턴 인원을 찾아 room의 NowTurnUserId에 저장
            int nt = gameService.getNextTurn(nowOrder, room.getUserCount(), room);
            Long roomUserId = gameOrderRepository.findByUserOrder(nt, room.getId())
                    .orElseThrow(NoSuchGameOrderException::new).getRoomUser().getId();
            room.setNowTurnUserId(roomUserId);
            roomRepository.save(room);

            // 기존에 보냈던 chatMessage에 MessageType만 RESET으로 바꿔 다시 전송
            chatMessage.setMessageType(ChatMessage.MessageType.RESET);
            ChatGameMessage chatGameMessage = MessageService.makeChatGameMessage(chatMessage, room);
            messagingTemplate.convertAndSend("/topic/public/"+room.getId(), chatGameMessage);
        }

        List<GameOrder> gameOrders = gameOrderRepository.findBackUser(gameOrder.getRoom().getId(), nowOrder+1, gameOrder.getRoom().getUserCount());
        if (!gameOrders.isEmpty()) {
            for(GameOrder go : gameOrders){
                go.setUserOrder(go.getUserOrder()-1);
                gameOrderRepository.save(go);
            }
        }

        return isNextTurn;
    }

}