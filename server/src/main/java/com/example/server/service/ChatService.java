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
        else{
            return playGame(chatMessage);
        }

    }

    public ChatGameMessage startGame(ChatMessage chatMessage) {
        makeGameOrder(chatMessage.getRoomId());
        Room room = roomRepository.findByRoomId(chatMessage.getRoomId())
                .orElseThrow(NoSuchRoomException::new);
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

        Room room = roomRepository.findByRoomId(chatMessage.getRoomId()).
                orElseThrow(NoSuchRoomException::new);
        ChatGameMessage chatGameMessage = makeChatGameMessage(chatMessage, room);
        chatGameMessage.setMessageType(ChatMessage.MessageType.PENALTY);

        return chatGameMessage;
    }


    public ChatGameMessage playGame(ChatMessage chatMessage) {
        ChatGameMessage chatGameMessage;
        Room room = roomRepository.findById(chatMessage.getRoomId())
                .orElseThrow(NoSuchRoomException::new);
        RoomUser sendRoomUser = roomUserRepository.hasNickName(chatMessage.getSender(), room.getId())
                .orElseThrow(NoSuchRoomUserException::new);
        GameOrder gameOrder = gameOrderRepository.findGameOrderByUserId(sendRoomUser.getId())
                .orElseThrow(NoSuchGameOrderException::new);


        if(chatMessage.getMessageType()==ChatMessage.MessageType.ASK && gameOrder.isNextTurn()){  // 질문일 경우 다음 턴으로 넘어감.
            int currentOrder = gameOrder.getUserOrder();
            int nextOrder = getNextTurn(currentOrder, room.getUserCount(), room.getId());
            changeNowTurn(currentOrder, room.getUserCount(), room.getId());

            gameOrder.setNowTurn(true);
            gameOrder.setNextTurn(false);
            GameOrder nextGameOrder = gameOrderRepository.findByUserOrder(nextOrder, room.getId())
                    .orElseThrow(NoSuchGameOrderException::new);
            nextGameOrder.setNowTurn(false);
            nextGameOrder.setNextTurn(true);
            room.setCurrentOrder(nextOrder);
            gameOrderRepository.save(gameOrder);
            gameOrderRepository.save(nextGameOrder);
            chatGameMessage = makeChatGameMessage(chatMessage, room);

            if(gameOrder.getUserOrder() == room.getUserCount()){ // 질문자가 마지막 사람이면 사이클 추가
                room.setCycle(room.getCycle()+1);
            }
            roomRepository.save(room);  // 게임 메시지를 만든 후 저장한다.   TODO 사이클 추가 부분 생각해봐야할 듯!
        }
        else{
            chatGameMessage = makeChatGameMessage(chatMessage, room);
        }
        return chatGameMessage;
    }

    public int getNextTurn(int currentOrder, int endOrder, long roomId){
        int nextOrder = currentOrder + 1;
        while(true){
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
    }

    public void changeNowTurn(int currentOrder, int endOrder, long roomId){
        int nowOrder = currentOrder - 1;
        while(true){
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
        ChatGameMessage chatGameMessage = new ChatGameMessage();
        RoomUser roomUser = roomUserRepository.hasNickName(chatMessage.getSender(), chatGameMessage.getRoomId())
                .orElseThrow(NoSuchRoomUserException::new);
        GameOrder gameOrder = gameOrderRepository.findGameOrderByUserId(roomUser.getId())
                .orElseThrow(NoSuchGameOrderException::new);
        Room room = roomRepository.findById(chatMessage.getRoomId())
                .orElseThrow(NoSuchRoomException::new);
        GameRecord gameRecord = gameRecordRepository.findByRoomId(room.getId())
                .orElseThrow(NoSuchGameRecordException::new);

        if(gameOrder.getAnswerName().equals(chatMessage.getContent())){ // 정답
            room.setCorrectMemberCnt(room.getCorrectMemberCnt()+1);
            gameOrder.setRanking(room.getCorrectMemberCnt());
            gameOrder.setHaveAnswerChance(false);

            if (roomUser.getUser() != null) {
                gameRecord.getUserRanking().add(roomUser.getUser());
            }
            String rankingNicknameSet = gameRecord.getRankingNicknameSet() + " "
                    + roomUser.getRoomNickname();
            gameRecord.setRankingNicknameSet(rankingNicknameSet);

            gameRecordRepository.save(gameRecord);
        }
        else{ // 오답
            gameOrder.setHaveAnswerChance(false); // 정답기회 없애기
            gameOrderRepository.save(gameOrder);
        }


        if(room.getCorrectMemberCnt() >= 3 || room.getUserCount()-1 <= room.getCorrectMemberCnt()){ // 게임 끝나는 경우

            // 기존 저장되어 있던 순위권 닉네임 리스트에 순위권에 들지 못한 나머지 닉네임 추가
            String rankingNicknameSet = gameRecord.getRankingNicknameSet();
            rankingNicknameSet += " / ";
            List<String> allNicknames = roomUserRepository.findNickNameByRoomId(room.getId());
            for (String nickname : allNicknames) {
                if(!rankingNicknameSet.contains(nickname)) rankingNicknameSet += " " + nickname;
            }
            gameRecord.setRankingNicknameSet(rankingNicknameSet);
            gameRecordRepository.save(gameRecord);

            chatGameMessage = makeEndChatGameMessage(chatMessage, room);
            chatGameMessage.setMessageType(ChatMessage.MessageType.END);
        }
        else{
            chatGameMessage = makeChatGameMessage(chatMessage, room);
            chatGameMessage.setMessageType(ChatMessage.MessageType.CORRECT);
        }
        return chatGameMessage;
    }


    public void makeGameOrder(Long roomId){  // 게임 순서 & 정답어 설정
        List<RoomUser> roomUsers = roomUserRepository.findRandomByRoomId(roomId);
        List<AnswerList> answerLists = answerListRepository.findAnswerListBy();
        Room room = roomRepository.findById(roomId).orElseThrow(NoSuchRoomException::new);
        int order = 1;
        for(RoomUser roomUser : roomUsers){
            GameOrder gameOrder = new GameOrder();
            gameOrder.setRoom(room);
            gameOrder.setRoomUser(roomUser);

            gameOrder.setNowTurn(false);
            gameOrder.setNextTurn(order == 1);

            gameOrder.setRanking(0);
            gameOrder.setPenalty(0);
            gameOrder.setHaveAnswerChance(true);
            gameOrder.setAnswerName(answerLists.get(order-1).getName());
            gameOrder.setUserOrder(order++);

            gameOrderRepository.save(gameOrder);
        }
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
        List<GameUserDto> gameUserDtos = new ArrayList<>();
        for(RoomUser roomUser : roomUsers){
            Optional<GameOrder> gameOrderOptional = gameOrderRepository.findGameOrderByUserId(roomUser.getId());
            GameUserDto gameUserDto = GameUserDto.of(gameOrderOptional.get(), roomUser);
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
        List<RoomUser> roomUsers = roomUserRepository.findByRoomIdOrderByRanking(roomId);
        List<GameUserDto> gameUserDtos = new ArrayList<>();
        for(RoomUser roomUser : roomUsers){
            Optional<GameOrder> gameOrderOptional = gameOrderRepository.findGameOrderByUserId(roomUser.getId());
            GameUserDto gameUserDto = GameUserDto.of(gameOrderOptional.get(), roomUser);
            gameUserDtos.add(gameUserDto);
        }
        return gameUserDtos;
    }

    public ChatRoomModeMessage changeRoomMode(ChatMessage chatMessage){
        Room room = roomRepository.findById(chatMessage.getRoomId())
                .orElseThrow(NoSuchRoomException::new);

        room.setPrivateRoom(!room.isPrivateRoom());

        roomRepository.save(room);
        return new ChatRoomModeMessage(chatMessage,room);
    }

    public AnswerListResponse getAnswerList(Long roomId, String nickname){
        return new AnswerListResponse(gameOrderRepository.findAnswerNotMe(roomId), nickname);
    }

}
