package com.example.server.service;

import com.example.server.domain.*;
import com.example.server.dto.GameUserDto;
import com.example.server.repository.AnswerListRepository;
import com.example.server.repository.GameOrderRepository;
import com.example.server.repository.RoomRepository;
import com.example.server.repository.RoomUserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.messaging.simp.SimpMessageSendingOperations;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.List;
import java.util.Optional;

@Service
public class ChatService {
    private final SimpMessageSendingOperations messagingTemplate;
    private final RoomRepository roomRepository;
    private final RoomUserRepository roomUserRepository;
    private final GameOrderRepository gameOrderRepository;
    private final AnswerListRepository answerListRepository;
    @Autowired
    public ChatService(SimpMessageSendingOperations messagingTemplate, RoomRepository roomRepository,
                       RoomUserRepository roomUserRepository, GameOrderRepository gameOrderRepository,
                       AnswerListRepository answerListRepository){
        this.messagingTemplate = messagingTemplate;
        this.roomRepository = roomRepository;
        this.roomUserRepository = roomUserRepository;
        this.gameOrderRepository = gameOrderRepository;
        this.answerListRepository = answerListRepository;
    }

    public ChatGameMessage setGame(ChatMessage chatMessage){
        if(chatMessage.getMessageType()==ChatMessage.MessageType.START){
            return startGame(chatMessage);
        }
        else if (chatMessage.getMessageType()==ChatMessage.MessageType.END) {
            return endGame(chatMessage);
        }
        else if (chatMessage.getMessageType()==ChatMessage.MessageType.ANSWER) {
            return correctAnswer(chatMessage);
        }
        else{
            return playGame(chatMessage);
        }

    }

    public ChatGameMessage startGame(ChatMessage chatMessage) {
        makeGameOrder(chatMessage.getRoomId());
        Optional<Room> optionalRoom = roomRepository.findById(chatMessage.getRoomId());
        Room room = optionalRoom.get();
        room.setGameStatus(true);
        room.setCycle(1);
        roomRepository.save(room);


        ChatGameMessage chatGameMessage = new ChatGameMessage();
        chatGameMessage.setMessageType(ChatGameMessage.MessageType.START);
        chatGameMessage.setContent(chatMessage.getContent());
        chatGameMessage.setSender(chatMessage.getSender());
        chatGameMessage.setRoomId(chatMessage.getRoomId());
        chatGameMessage.setGameEnd(room.isGameStatus());
        chatGameMessage.setCycle(room.getCycle());
        chatGameMessage.setGameUserDtos(makeGameUserDtos(chatMessage.getRoomId()));

        return chatGameMessage;
    }

    public ChatGameMessage endGame(ChatMessage chatMessage) {
        return new ChatGameMessage();
    }

    public ChatGameMessage playGame(ChatMessage chatMessage) {
        return new ChatGameMessage();
    }

    public ChatGameMessage correctAnswer(ChatMessage chatMessage) {
        return new ChatGameMessage();
    }




    public void makeGameOrder(Long roomId){  // 게임 순서 & 정답어 설정
        List<RoomUser> roomUsers = roomUserRepository.findRandomByRoomId(roomId);
        List<AnswerList> answerLists = answerListRepository.findAnswerListBy();
        Optional<Room> room = roomRepository.findById(roomId);
        int order = 1;
        for(RoomUser roomUser : roomUsers){
            GameOrder gameOrder = new GameOrder();
            gameOrder.setRoom(room.get());
            gameOrder.setRoomUser(roomUser);
            if(order == 1){
                gameOrder.setNowTurn(true);
            }
            else{
                gameOrder.setNowTurn(false);
            }
            if(order == 2){
                gameOrder.setNextTurn(true);
            }
            else{
                gameOrder.setNextTurn(false);
            }
            gameOrder.setRanking(0);
            gameOrder.setPenalty(0);
            gameOrder.setHaveAnswerChance(true);
            gameOrder.setAnswerName(answerLists.get(order-1).getName());
            gameOrder.setUserOrder(order++);

            gameOrderRepository.save(gameOrder);
        }
    }

    public void deleteGameOrder(Long roomId){

    }

    public String getNowTurn(ChatGameMessage chatGameMessage){

        return "";
    }

    public String getNextTurn(ChatGameMessage chatGameMessage){

        return "";
    }

    public List<GameUserDto> makeGameUserDtos(Long roomId){ // GameUserDtos 생성 메소드
        List<RoomUser> roomUsers = roomUserRepository.findByRoomId(roomId);
        List<GameUserDto> gameUserDtos = new ArrayList<>();
        for(RoomUser roomUser : roomUsers){
            Optional<GameOrder> gameOrderOptional = gameOrderRepository.findGameOrderByUserId(roomUser.getId());
            GameUserDto gameUserDto = GameUserDto.of(gameOrderOptional.get(), roomUser);
            gameUserDtos.add(gameUserDto);
        }
        return gameUserDtos;
    }


}
