package com.example.server.service;

import com.example.server.domain.*;
import com.example.server.dto.*;
import com.example.server.exception.*;
import com.example.server.payload.response.AnswerListResponse;
import com.example.server.repository.*;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.ArrayList;
import java.util.List;

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
        makeGameOrder(chatMessage);
        Room room = roomRepository.findByRoomId(chatMessage.getRoomId())
                .orElseThrow(() -> new NoSuchRoomException(chatMessage.getRoomId()));
        roomInit(room);

        roomRepository.save(room);

        ChatGameMessage chatGameMessage = makeChatGameMessage(chatMessage, room);
        chatGameMessage.setMessageType(ChatMessage.MessageType.START);

        return chatGameMessage;
    }

    private static GameRecord gameRecordInit(Room room) {
        GameRecord gameRecord = new GameRecord();
        List<User> userRanking = new ArrayList<>();
        gameRecord.setUserRanking(userRanking);
        return gameRecord;
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
                ChatGameMessage chatGameMessage = makeEndChatGameMessage(chatMessage, room);
                chatGameMessage.setMessageType(ChatMessage.MessageType.END);

                // 모든 gameOrder 삭제
                List<GameOrder> gameOrders = gameOrderRepository.findAnswerNotMe(room.getId());
                gameOrderRepository.deleteAll(gameOrders);

                return  chatGameMessage;
            }
            else {
                ChatGameMessage chatGameMessage = makeChatGameMessage(chatMessage, room);
                chatGameMessage.setMessageType(ChatMessage.MessageType.CORRECT);
                return chatGameMessage;
            }
        }
        else{ // 오답
            ChatGameMessage chatGameMessage = makeChatGameMessage(chatMessage, room);
            chatGameMessage.setMessageType(ChatMessage.MessageType.CORRECT);
            return chatGameMessage;
        }
    }

    public void makeGameOrder(ChatMessage chatMessage){  // 게임 순서 & 정답어 설정
        Long roomId = chatMessage.getRoomId();
        List<RoomUser> roomUsers = roomUserRepository.findRandomByRoomId(roomId);
        List<AnswerList> answerLists;
        Room room = roomRepository.findById(roomId).orElseThrow(()->new NoSuchRoomException(roomId));

        if(room.getCategory().equals("전체")) {  // 전체 분야로 설정
            answerLists = answerListRepository.findAnswerListBy();
        }
        else{   // 원하는 분야의 정답어만 설정
            answerLists = answerListRepository.findAnswerListByGroup(room.getCategory());
        }

        int order = 1;


        for(RoomUser roomUser : roomUsers){ // 레디하지 않은 유저가 있다면 예외처리.
            if(!roomUser.isReady()){
                throw new CantStartGameException();
            }
        }

        for(RoomUser roomUser : roomUsers){
            if(!roomUser.isCaptain()){
                roomUser.setReady(false);
                roomUserRepository.save(roomUser);
            }

            GameOrder gameOrder = gameOrderInit(roomUser, room);
            gameOrder.setNextTurn(order == 1);
            if (order == 1) {
                room.setNowTurnUserId(roomUser.getId());
                roomRepository.save(room);
            }
            gameOrder.setAnswerName(answerLists.get(order-1).getName());
            gameOrder.setUserOrder(order);
            order += 1;
            roomUser.setGameOrder(gameOrder);   // TODO 여기 수정
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
        chatGameMessage.setGameUserDtos(makeEndGameUserDtos(room));
        chatGameMessage.setMessageType(chatMessage.getMessageType());
        return chatGameMessage;
    }

    public List<GameUserDto> makeEndGameUserDtos(Room room){ // GameUserDtos(순위 기준 정렬) 생성 메소드
        List<RoomUser> roomUsers = gameOrderRepository.findByRoomIdOrderByRanking(room.getId());
        List<RoomUser> secondRoomUsers = gameOrderRepository.findByZeroOrderByRanking(room.getId());

        GameRecord gameRecord = gameRecordInit(room);


        List<GameUserDto> gameUserDtos = new ArrayList<>();
        for(RoomUser roomUser : roomUsers){
            GameOrder gameOrder = gameOrderRepository.findByRoomUser(roomUser)
                    .orElseThrow(NoSuchGameOrderException::new);
            GameUserDto gameUserDto = GameUserDto.of(gameOrder, roomUser);
            gameUserDto.setAnswername(gameOrder.getAnswerName());  // 정답어 추가로 전송
            gameUserDtos.add(gameUserDto);

            // record 저장 로직
            if (roomUser.getUser() != null) {
                gameRecord.getUserRanking().add(roomUser.getUser());
            }
            String rankingNicknameSet = gameRecord.getRankingNicknameSet() + " "
                    + roomUser.getRoomNickname();
            gameRecord.setRankingNicknameSet(rankingNicknameSet);
        }
        for(RoomUser roomUser : secondRoomUsers){
            GameOrder gameOrder = gameOrderRepository.findByRoomUser(roomUser)
                    .orElseThrow(NoSuchGameOrderException::new);
            GameUserDto gameUserDto = GameUserDto.of(gameOrder, roomUser);
            gameUserDto.setAnswername(gameOrder.getAnswerName());  // 정답어 추가로 전송
            gameUserDtos.add(gameUserDto);

            // record 저장 로직
            if (roomUser.getUser() != null) {
                gameRecord.getUserRanking().add(roomUser.getUser());
            }
            String rankingNicknameSet = gameRecord.getRankingNicknameSet() + " "
                    + roomUser.getRoomNickname();
            gameRecord.setRankingNicknameSet(rankingNicknameSet);
        }
        gameRecordRepository.save(gameRecord);

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
        Room room = roomRepository.findById(roomId)
                .orElseThrow(()->new NoSuchRoomException(roomId));
        int round = room.getCycle();
        String myRealAnswer = gameOrderRepository.findByNickName(nickname, roomId).get().getAnswerName();
        String myAnswer;
        if(round < 3){
            myAnswer = "???";
        }
        else if (round < 5){
            myAnswer = getLength(myRealAnswer);
        }
        else if (round < 7){
            myAnswer = setHint(0,myRealAnswer);
        }
        else {
            myAnswer = setHint(1,myRealAnswer);
        }
        return new AnswerListResponse(gameOrderRepository.findAnswerNotMe(roomId), nickname, myAnswer);
    }

    public String setHint(int idx,String myRealAnswer){
        StringBuilder sb = new StringBuilder();
        for(int i = 0; i < myRealAnswer.length(); i++){
            char ch = myRealAnswer.charAt(i);
            if(i <= idx){
                if (ch >= 0xAC00 && ch <= 0xD7A3) { // 한글 음절 범위 확인
                    int unicode = ch - 0xAC00;
                    int initialConsonantIndex = unicode / (21 * 28);
                    char initialConsonant = (char) (initialConsonantIndex + 0x1100); // 초성 유니코드 범위 시작: 0x1100
                    sb.append(" " + initialConsonant);
                }
                else if(ch==' '){
                    sb.append(" ");
                    idx++;
                }
            }
            else{
                sb.append(" _");
            }
        }
        return sb.toString();
    }

    public String getLength(String myRealAnswer){
        StringBuilder sb = new StringBuilder();
        for(int i = 0; i < myRealAnswer.length(); i++){
            if(myRealAnswer.charAt(i)==' ')
                sb.append(" ");
            else
                sb.append(" _");
        }
        return sb.toString();
    }

    public ChatGameMessage resetTimer(ChatMessage chatMessage){
        Room room = roomRepository.findById(chatMessage.getRoomId())
                .orElseThrow(()->new NoSuchRoomException(chatMessage.getRoomId()));
        room.setNowTurnUserId(gameOrderRepository.findNextOrderByRoomId(room.getId())
                .orElseThrow(()->new NoSuchRoomUserException(room.getId())));
        roomRepository.save(room);
        ChatGameMessage chatGameMessage = makeChatGameMessage(chatMessage, room);
        chatGameMessage.setMessageType(ChatMessage.MessageType.RESET);
        return chatGameMessage;
    }

    public ChatReadyMessage setReady(ChatMessage chatMessage){
        Room room = roomRepository.findById(chatMessage.getRoomId())
                .orElseThrow(()->new NoSuchRoomException(chatMessage.getRoomId()));
        RoomUser roomUser = roomUserRepository.hasNickName(chatMessage.getSender(), chatMessage.getRoomId())
                .orElseThrow(()->new NoSuchRoomUserException(chatMessage.getRoomId()));
        if(roomUser.isReady()){
            roomUser.setReady(false);
//            chatMessage.setContent(chatMessage.getSender() + " 님이 레디를 해제하셨습니다. ");
        }
        else {
            roomUser.setReady(true);
//            chatMessage.setContent(chatMessage.getSender() + " 님이 레디 하셨습니다. ");
        }
        roomUserRepository.save(roomUser);
        chatMessage.setContent("");
        return new ChatReadyMessage(chatMessage, UserDto.makeUserDtos(roomUserRepository.findByRoomId(room.getId())));
    }

    public ChatMessage setCategory(ChatMessage chatMessage){
        Room room = roomRepository.findByRoomId(chatMessage.getRoomId())
                .orElseThrow(()->new NoSuchRoomException(chatMessage.getRoomId()));
        RoomUser roomUser = roomUserRepository.hasNickName(chatMessage.getSender(), chatMessage.getRoomId())
                .orElseThrow(()->new NoSuchRoomUserException(chatMessage.getRoomId()));
        if(!roomUser.isCaptain()){  // 방장이 아닌 사람이 변경 시도할 경우
            throw new CategoryException("카테고리 변경 권한이 없습니다. ");
        }
        if(room.getCategory().equals(chatMessage.getContent())){  // 기존의 카테고리와 같은 카테고리로 변경할 경우
            throw new CategoryException("기존의 카테고리와 같은 카테고리입니다. ");
        }
        if(!chatMessage.getContent().equals("전체")){    // 카테고리가 전체인 경우를 제외하고 검사
            answerListRepository.haveCategory(chatMessage.getContent())   // 존재하는 카테고리인지 확인 여부
                    .orElseThrow(()->new NoSuchCategoryException(chatMessage.getContent()));
        }
        room.setCategory(chatMessage.getContent());
        roomRepository.save(room);
        return chatMessage;
    }

    public ChatMessage setTimer(ChatMessage chatMessage){
        Room room = roomRepository.findByRoomId(chatMessage.getRoomId())
                .orElseThrow(()->new NoSuchRoomException(chatMessage.getRoomId()));
        RoomUser roomUser = roomUserRepository.hasNickName(chatMessage.getSender(), chatMessage.getRoomId())
                .orElseThrow(()->new NoSuchRoomUserException(chatMessage.getRoomId()));
        if(!roomUser.isCaptain()){  // 방장이 아닌 사람이 변경 시도할 경우
            throw new CategoryException("타이머 변경 권한이 없습니다. ");
        }
        if(room.getCategory().equals(chatMessage.getContent())){  // 기존의 카테고리와 같은 카테고리로 변경할 경우
            throw new CategoryException("기존의 타이머와 같은 타이머입니다. ");
        }
        room.setTimer(Integer.parseInt(chatMessage.getContent()));
        roomRepository.save(room);
        return chatMessage;
    }

}
