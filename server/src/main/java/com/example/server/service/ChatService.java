package com.example.server.service;

import com.example.server.domain.GameOrder;
import com.example.server.domain.Room;
import com.example.server.domain.RoomUser;
import com.example.server.dto.ChatGameMessage;
import com.example.server.dto.ChatMessage;
import com.example.server.exception.MaxPenaltyExceededException;
import com.example.server.exception.NoSuchGameOrderException;
import com.example.server.exception.NoSuchRoomException;
import com.example.server.exception.NoSuchRoomUserException;
import com.example.server.repository.GameOrderRepository;
import com.example.server.repository.RoomRepository;
import com.example.server.repository.RoomUserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@Transactional
@RequiredArgsConstructor
public class ChatService {
    private final RoomRepository roomRepository;
    private final RoomUserRepository roomUserRepository;
    private final GameOrderRepository gameOrderRepository;
    private final GameService gameService;
    private final MessageService messageService;

    public ChatGameMessage setGame(ChatMessage chatMessage) {
        if(chatMessage.getMessageType()==ChatMessage.MessageType.START){
            return startGame(chatMessage);
        }
        else if (chatMessage.getMessageType()==ChatMessage.MessageType.PENALTY) {
            return penaltyUser(chatMessage);
        }
        else if (chatMessage.getMessageType()==ChatMessage.MessageType.CORRECT) {
            return correctAnswer(chatMessage);
        }
        else if (chatMessage.getMessageType()==ChatMessage.MessageType.ASK) {
            return askHandler(chatMessage);
        }
        else if (chatMessage.getMessageType()==ChatMessage.MessageType.RESET) {
            return resetTimer(chatMessage);
        }
        else{
            return playGame(chatMessage);
        }
    }

    public ChatGameMessage startGame(ChatMessage chatMessage) {
        gameService.makeGameOrder(chatMessage);

        Room room = roomRepository.findByRoomId(chatMessage.getRoomId())
                .orElseThrow(() -> new NoSuchRoomException(chatMessage.getRoomId()));
        roomInit(room);

        roomRepository.save(room);

        ChatGameMessage chatGameMessage = messageService.makeChatGameMessage(chatMessage, room);
        chatGameMessage.setMessageType(ChatMessage.MessageType.START);

        return chatGameMessage;
    }

    private void roomInit(Room room) {
        room.setGameStatus(true);
        room.setCycle(1);
        room.setCurrentOrder(1);
        room.setCorrectMemberCnt(0);
        room.setLeftCorrectMember(0);
    }

    public ChatGameMessage penaltyUser(ChatMessage chatMessage){
        GameOrder penaltyUser = gameOrderRepository.findByNickName(chatMessage.getContent(), chatMessage.getRoomId())
                .orElseThrow(NoSuchGameOrderException::new);

        if(penaltyUser.getPenalty() >= 3){
            throw new MaxPenaltyExceededException();
        }
        else{
            penaltyUser.setPenalty(penaltyUser.getPenalty() + 1);
        }
        gameOrderRepository.save(penaltyUser);

        Room room = roomRepository.findByRoomId(chatMessage.getRoomId())
                        .orElseThrow(()->new NoSuchRoomException(chatMessage.getRoomId()));
        ChatGameMessage chatGameMessage = messageService.makeChatGameMessage(chatMessage, room);
        chatGameMessage.setContent(chatMessage.getContent() + " 님이 경고를 받았습니다. ");
        chatGameMessage.setMessageType(ChatMessage.MessageType.PENALTY);

        return chatGameMessage;
    }

    public ChatGameMessage correctAnswer(ChatMessage chatMessage) {   // 정답 맞추기
        RoomUser roomUser = roomUserRepository.hasNickName(chatMessage.getSender(), chatMessage.getRoomId())
                .orElseThrow(()->new NoSuchRoomUserException(chatMessage.getRoomId()));
        GameOrder gameOrder = gameOrderRepository.findByRoomUser(roomUser)
                .orElseThrow(NoSuchGameOrderException::new);
        Room room = roomRepository.findById(chatMessage.getRoomId())
                .orElseThrow(()->new NoSuchRoomException(chatMessage.getRoomId()));

        gameOrder.setHaveAnswerChance(false); // 정답기회 없애기
        gameOrderRepository.save(gameOrder);

        if(gameOrder.getAnswerName().equals(chatMessage.getContent())){ // 정답
            Room newRoom = roomRepository.findById(chatMessage.getRoomId())
                    .orElseThrow(()->new NoSuchRoomException(chatMessage.getRoomId()));
            newRoom.setCorrectMemberCnt(newRoom.getCorrectMemberCnt()+1);
            newRoom.setLeftCorrectMember(newRoom.getLeftCorrectMember()+1);
            gameOrder.setRanking(newRoom.getCorrectMemberCnt());
            gameOrderRepository.save(gameOrder);

            if(room.getCorrectMemberCnt() >= 3 || room.getUserCount()-1 <= room.getCorrectMemberCnt()){ // 게임 끝나는 경우
                room.setGameStatus(false);
                roomRepository.save(room);
                ChatGameMessage chatGameMessage = messageService.makeEndChatGameMessage(chatMessage, room);
                chatGameMessage.setMessageType(ChatMessage.MessageType.END);

                // 모든 gameOrder 삭제
                List<GameOrder> gameOrders = gameOrderRepository.findAnswerNotMe(room.getId());
                gameOrderRepository.deleteAll(gameOrders);

                return  chatGameMessage;
            }
            else {
                ChatGameMessage chatGameMessage = messageService.makeChatGameMessage(chatMessage, room);
                chatGameMessage.setMessageType(ChatMessage.MessageType.CORRECT);
                return chatGameMessage;
            }
        }
        else{ // 오답
            ChatGameMessage chatGameMessage = messageService.makeChatGameMessage(chatMessage, room);
            chatGameMessage.setMessageType(ChatMessage.MessageType.CORRECT);
            return chatGameMessage;
        }
    }

    public ChatGameMessage askHandler(ChatMessage chatMessage) {

        ChatGameMessage chatGameMessage = null;

        Room room = roomRepository.findById(chatMessage.getRoomId())
                .orElseThrow(()->new NoSuchRoomException(chatMessage.getRoomId()));
        RoomUser sendRoomUser = roomUserRepository.hasNickName(chatMessage.getSender(), room.getId())
                .orElseThrow(()->new NoSuchRoomUserException(chatMessage.getRoomId()));
        GameOrder gameOrder = gameOrderRepository.findByRoomUser(sendRoomUser)
                .orElseThrow(NoSuchGameOrderException::new);

        if(gameOrder.isNextTurn()){  // 질문일 경우 다음 턴으로 넘어감.
            int currentOrder = gameOrder.getUserOrder();
            int nextOrder = gameService.getNextTurn(currentOrder, room.getUserCount(), room);
            GameOrder nextGameOrder = gameOrderRepository.findByUserOrder(nextOrder, room.getId())
                    .orElseThrow(NoSuchGameOrderException::new);

            gameService.changeNowTurn(currentOrder, room.getUserCount(), room.getId());

            gameOrder.setNowTurn(true);
            gameOrder.setNextTurn(false);
            nextGameOrder.setNowTurn(false);
            nextGameOrder.setNextTurn(true);

            room.setCurrentOrder(nextOrder);
            gameOrderRepository.save(gameOrder);
            gameOrderRepository.save(nextGameOrder);
            roomRepository.save(room);  // 게임 메시지를 만든 후 저장한다.

            chatGameMessage = messageService.makeChatGameMessage(chatMessage, room);
        }
        return chatGameMessage;
    }

    public ChatGameMessage resetTimer(ChatMessage chatMessage){
        Room room = roomRepository.findById(chatMessage.getRoomId())
                .orElseThrow(()->new NoSuchRoomException(chatMessage.getRoomId()));
        room.setNowTurnUserId(gameOrderRepository.findNextOrderByRoomId(room.getId())
                .orElseThrow(()->new NoSuchRoomUserException(room.getId())));
        roomRepository.save(room);
        ChatGameMessage chatGameMessage = messageService.makeChatGameMessage(chatMessage, room);
        chatGameMessage.setMessageType(ChatMessage.MessageType.RESET);
        return chatGameMessage;
    }

    public ChatGameMessage playGame(ChatMessage chatMessage) {
        Room room = roomRepository.findById(chatMessage.getRoomId())
                .orElseThrow(()->new NoSuchRoomException(chatMessage.getRoomId()));

        ChatGameMessage chatGameMessage = messageService.makeChatGameMessage(chatMessage, room);;

        return chatGameMessage;
    }

}
