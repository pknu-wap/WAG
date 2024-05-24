package com.example.server.service;

import com.example.server.domain.*;
import com.example.server.dto.ChatGameMessage;
import com.example.server.dto.ChatMessage;
import com.example.server.dto.ChatRoomModeMessage;
import com.example.server.dto.GameUserDto;
import com.example.server.exception.*;
import com.example.server.payload.response.AnswerListResponse;
import com.example.server.payload.response.ResultResponse;
import com.example.server.repository.*;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.ArrayList;
import java.util.List;
import java.util.Optional;

@Service
@Transactional
@RequiredArgsConstructor
public class ChatService {
    private final RoomRepository roomRepository;
    private final RoomUserRepository roomUserRepository;
    private final GameOrderRepository gameOrderRepository;
    private final AnswerListRepository answerListRepository;
    private final GameRecordRepository gameRecordRepository;

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
        makeGameOrder(chatMessage.getRoomId());
        Room room = roomRepository.findByRoomId(chatMessage.getRoomId())
                .orElseThrow(() -> new NoSuchRoomException(chatMessage.getRoomId()));
        roomInit(room);
        GameRecord gameRecord = gameRecordInit(room);

        roomRepository.save(room);
        gameRecordRepository.save(gameRecord);

        ChatGameMessage chatGameMessage = makeChatGameMessage(chatMessage, room);
        chatGameMessage.setMessageType(ChatMessage.MessageType.START);

        return chatGameMessage;
    }

    private static GameRecord gameRecordInit(Room room) {
        GameRecord gameRecord = new GameRecord();
        List<User> userRanking = new ArrayList<>();
        gameRecord.setUserRanking(userRanking);
        gameRecord.setRoomId(room.getId());
        return gameRecord;
    }

    private static void roomInit(Room room) {
        room.setGameStatus(true);
        room.setCycle(1);
        room.setCurrentOrder(1);
        room.setCorrectMemberCnt(0);
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
        ChatGameMessage chatGameMessage = makeChatGameMessage(chatMessage, room);
        chatGameMessage.setContent(chatMessage.getContent() + " 님이 경고를 받았습니다. ");
        chatGameMessage.setMessageType(ChatMessage.MessageType.PENALTY);

        return chatGameMessage;
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
            int nextOrder = getNextTurn(currentOrder, room.getUserCount(), room.getId());
            GameOrder nextGameOrder = gameOrderRepository.findByUserOrder(nextOrder, room.getId())
                    .orElseThrow(NoSuchGameOrderException::new);

            changeNowTurn(currentOrder, room.getUserCount(), room.getId());

            gameOrder.setNowTurn(true);
            gameOrder.setNextTurn(false);
            nextGameOrder.setNowTurn(false);
            nextGameOrder.setNextTurn(true);

            room.setCurrentOrder(nextOrder);
            gameOrderRepository.save(gameOrder);
            gameOrderRepository.save(nextGameOrder);
            roomRepository.save(room);  // 게임 메시지를 만든 후 저장한다.

            if(gameOrder.getUserOrder() == room.getUserCount()){ // 질문자가 마지막 사람이면 사이클 추가
                room.setCycle(room.getCycle()+1);
            }
            chatGameMessage = makeChatGameMessage(chatMessage, room);
        }
        return chatGameMessage;

    }

    public ChatGameMessage playGame(ChatMessage chatMessage) {
        Room room = roomRepository.findById(chatMessage.getRoomId())
                .orElseThrow(()->new NoSuchRoomException(chatMessage.getRoomId()));

        ChatGameMessage chatGameMessage = makeChatGameMessage(chatMessage, room);;

        return chatGameMessage;
    }

    public int getNextTurn(int currentOrder, int endOrder, long roomId){
        int nextOrder = currentOrder + 1;
        while(currentOrder != nextOrder){
            if(nextOrder > endOrder){
                nextOrder = 1;
            }
            GameOrder nextGameOrder = gameOrderRepository.findByUserOrder(nextOrder, roomId)
                    .orElseThrow(NoSuchGameOrderException::new);

            if(nextGameOrder.getRanking() == 0){
                return nextOrder;
            }
            nextOrder++;
        }
        return nextOrder;
    }

    public void changeNowTurn(int currentOrder, int endOrder, long roomId){
        int nowOrder = currentOrder - 1;
        while(currentOrder != nowOrder){
            if(nowOrder < 1){
                nowOrder = endOrder;
            }
            GameOrder nowGameOrder = gameOrderRepository.findByUserOrder(nowOrder, roomId)
                    .orElseThrow(NoSuchGameOrderException::new);

            if(nowGameOrder.isNowTurn()){
                nowGameOrder.setNowTurn(false);
                nowGameOrder.setNextTurn(false);
                gameOrderRepository.save(nowGameOrder);
                return;
            }
            nowOrder--;
        }
    }

    public ChatGameMessage correctAnswer(ChatMessage chatMessage) {   // 정답 맞추기
        RoomUser roomUser = roomUserRepository.hasNickName(chatMessage.getSender(), chatMessage.getRoomId())
                .orElseThrow(()->new NoSuchRoomUserException(chatMessage.getRoomId()));
        GameOrder gameOrder = gameOrderRepository.findByRoomUser(roomUser)
                .orElseThrow(NoSuchGameOrderException::new);
        Room room = roomRepository.findById(chatMessage.getRoomId())
                .orElseThrow(()->new NoSuchRoomException(chatMessage.getRoomId()));
        GameRecord gameRecord = gameRecordRepository.findFirstByRoomIdOrderByDateDesc(room.getId())
                .orElseThrow(()->new NoSuchGameRecordException(room.getId()));

        gameOrder.setHaveAnswerChance(false); // 정답기회 없애기
        gameOrderRepository.save(gameOrder);

        if(gameOrder.getAnswerName().equals(chatMessage.getContent())){ // 정답
            Room newRoom = roomRepository.findById(chatMessage.getRoomId())
                    .orElseThrow(()->new NoSuchRoomException(chatMessage.getRoomId()));
            newRoom.setCorrectMemberCnt(newRoom.getCorrectMemberCnt()+1);
            gameOrder.setRanking(newRoom.getCorrectMemberCnt());

            // gameRecord 처리 로직
            if (roomUser.getUser() != null) {
                gameRecord.getUserRanking().add(roomUser.getUser());
            }
            String rankingNicknameSet = gameRecord.getRankingNicknameSet() + " "
                    + roomUser.getRoomNickname();
            gameRecord.setRankingNicknameSet(rankingNicknameSet);

            gameRecordRepository.save(gameRecord);

            if(room.getCorrectMemberCnt() >= 3 || room.getUserCount()-1 <= room.getCorrectMemberCnt()){ // 게임 끝나는 경우
                // 기존 저장되어 있던 순위권 닉네임 리스트에 순위권에 들지 못한 나머지 닉네임 추가
                StringBuilder rankingNicknameSet2 = new StringBuilder(gameRecord.getRankingNicknameSet());
                rankingNicknameSet2.append(" / ");
                List<String> allNicknames = roomUserRepository.findNickNameByRoomId(room.getId());
                for (String nickname : allNicknames) {
                    if(!rankingNicknameSet2.toString().contains(nickname)) rankingNicknameSet2.append(" ").append(nickname);
                }
                gameRecord.setRankingNicknameSet(rankingNicknameSet2.toString());
                gameRecordRepository.save(gameRecord);
                room.setGameStatus(false);
                roomRepository.save(room);
                ChatGameMessage chatGameMessage = makeEndChatGameMessage(chatMessage, room);
                chatGameMessage.setMessageType(ChatMessage.MessageType.END);
                // 모든 gameOrder 삭제
                List<GameOrder> gameOrders = gameOrderRepository.findAnswerNotMe(room.getId());

                for (GameOrder go : gameOrders) {
                    gameOrderRepository.delete(go);
                }

                return  chatGameMessage;
            }
            else {
                ChatGameMessage chatGameMessage = makeChatGameMessage(chatMessage, room);
                chatGameMessage.setMessageType(ChatMessage.MessageType.CORRECT);
                return chatGameMessage;
            }
        }
        else{ // 오답
            System.out.println("오답입니다");
            ChatGameMessage chatGameMessage = makeChatGameMessage(chatMessage, room);
            chatGameMessage.setMessageType(ChatMessage.MessageType.CORRECT);
            return chatGameMessage;
        }
    }

    public void makeGameOrder(Long roomId){  // 게임 순서 & 정답어 설정
        List<RoomUser> roomUsers = roomUserRepository.findRandomByRoomId(roomId);
        List<AnswerList> answerLists = answerListRepository.findAnswerListBy();
        Room room = roomRepository.findById(roomId).orElseThrow(()->new NoSuchRoomException(roomId));
        int order = 1;
        for(RoomUser roomUser : roomUsers){
            GameOrder gameOrder = gameOrderInit(roomUser, room);

            gameOrder.setNextTurn(order == 1);
            gameOrder.setAnswerName(answerLists.get(order-1).getName());
            gameOrder.setUserOrder(order);
            order += 1;

            gameOrderRepository.save(gameOrder);
        }
    }

    private static GameOrder gameOrderInit(RoomUser roomUser, Room room) {
        GameOrder gameOrder = new GameOrder();
        gameOrder.setRoom(room);
        gameOrder.setRoomUser(roomUser);
        gameOrder.setNowTurn(false);
        gameOrder.setRanking(0);
        gameOrder.setPenalty(0);
        gameOrder.setHaveAnswerChance(true);
        return gameOrder;
    }

    public ChatGameMessage makeChatGameMessage(ChatMessage chatMessage, Room room){
        ChatGameMessage chatGameMessage = new ChatGameMessage();
        chatGameMessage.setContent(chatMessage.getContent());
        chatGameMessage.setSender(chatMessage.getSender());
        chatGameMessage.setRoomId(chatMessage.getRoomId());
        chatGameMessage.setGameEnd(room.isGameStatus());
        chatGameMessage.setCycle(room.getCycle());
        chatGameMessage.setGameUserDtos(makeGameUserDtos(chatMessage.getRoomId()));
        chatGameMessage.setMessageType(chatMessage.getMessageType());
        return chatGameMessage;
    }

    public List<GameUserDto> makeGameUserDtos(Long roomId){ // GameUserDtos 생성 메소드
        List<RoomUser> roomUsers = roomUserRepository.findByRoomId(roomId);
        return getGameUserDtos(roomUsers);
    }

    private List<GameUserDto> getGameUserDtos(List<RoomUser> roomUsers) {
        List<GameUserDto> gameUserDtos = new ArrayList<>();
        for(RoomUser roomUser : roomUsers){
            GameOrder gameOrder = gameOrderRepository.findByRoomUser(roomUser)
                    .orElseThrow(NoSuchGameOrderException::new);
            GameUserDto gameUserDto = GameUserDto.of(gameOrder, roomUser);
            System.out.println(gameOrder.getRanking() + " ");
            gameUserDtos.add(gameUserDto);
        }
        return gameUserDtos;
    }

    public ChatGameMessage makeEndChatGameMessage(ChatMessage chatMessage, Room room){  // 순위 기준 정렬 chatGameMessage 생성
        ChatGameMessage chatGameMessage = new ChatGameMessage();
        chatGameMessage.setContent(chatMessage.getContent());
        chatGameMessage.setSender(chatMessage.getSender());
        chatGameMessage.setRoomId(chatMessage.getRoomId());
        chatGameMessage.setGameEnd(room.isGameStatus());
        chatGameMessage.setCycle(room.getCycle());
        chatGameMessage.setGameUserDtos(makeEndGameUserDtos(chatMessage.getRoomId()));
        chatGameMessage.setMessageType(chatMessage.getMessageType());
        return chatGameMessage;
    }

    public List<GameUserDto> makeEndGameUserDtos(Long roomId){ // GameUserDtos(순위 기준 정렬) 생성 메소드
        List<RoomUser> roomUsers = gameOrderRepository.findByRoomIdOrderByRanking(roomId);
        List<RoomUser> secondRoomUsers = gameOrderRepository.findByZeroOrderByRanking(roomId);

        List<GameUserDto> gameUserDtos = new ArrayList<>();
        for(RoomUser roomUser : roomUsers){
            GameOrder gameOrder = gameOrderRepository.findByRoomUser(roomUser)
                    .orElseThrow(NoSuchGameOrderException::new);
            GameUserDto gameUserDto = GameUserDto.of(gameOrder, roomUser);
            gameUserDtos.add(gameUserDto);
        }
        for(RoomUser roomUser : secondRoomUsers){
            GameOrder gameOrder = gameOrderRepository.findByRoomUser(roomUser)
                    .orElseThrow(NoSuchGameOrderException::new);
            GameUserDto gameUserDto = GameUserDto.of(gameOrder, roomUser);
            gameUserDtos.add(gameUserDto);
        }

        return gameUserDtos;
    }

    public ChatRoomModeMessage changeRoomMode(ChatMessage chatMessage){

        if (chatMessage.getMessageType() != ChatMessage.MessageType.CHANGE) {
            return null;
        }
        Room room = roomRepository.findById(chatMessage.getRoomId())
                .orElseThrow(()->new NoSuchRoomException(chatMessage.getRoomId()));

        room.setPrivateRoom(!room.isPrivateRoom());

        roomRepository.save(room);
        return new ChatRoomModeMessage(chatMessage,room);
    }

    public AnswerListResponse getAnswerList(Long roomId, String nickname){
        return new AnswerListResponse(gameOrderRepository.findAnswerNotMe(roomId), nickname);
    }

    public ChatGameMessage resetTimer(ChatMessage chatMessage){
        Room room = roomRepository.findById(chatMessage.getRoomId())
                .orElseThrow(()->new NoSuchRoomException(chatMessage.getRoomId()));
        ChatGameMessage chatGameMessage = makeChatGameMessage(chatMessage, room);
        chatGameMessage.setMessageType(ChatMessage.MessageType.RESET);
        return chatGameMessage;
    }

}
