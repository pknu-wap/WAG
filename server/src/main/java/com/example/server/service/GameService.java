package com.example.server.service;

import com.example.server.domain.AnswerList;
import com.example.server.domain.GameOrder;
import com.example.server.domain.Room;
import com.example.server.domain.RoomUser;
import com.example.server.dto.ChatMessage;
import com.example.server.exception.CantStartGameException;
import com.example.server.exception.NoSuchGameOrderException;
import com.example.server.exception.NoSuchRoomException;
import com.example.server.payload.response.AnswerListResponse;
import com.example.server.repository.AnswerListRepository;
import com.example.server.repository.GameOrderRepository;
import com.example.server.repository.RoomRepository;
import com.example.server.repository.RoomUserRepository;
import lombok.AllArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@AllArgsConstructor
public class GameService {

    private final RoomRepository roomRepository;
    private final RoomUserRepository roomUserRepository;
    private final AnswerListRepository answerListRepository;
    private final GameOrderRepository gameOrderRepository;


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
            roomUser.setGameOrder(gameOrder);
            gameOrderRepository.save(gameOrder);
        }
    }

    private GameOrder gameOrderInit(RoomUser roomUser, Room room) {
        GameOrder gameOrder = new GameOrder();
        gameOrder.setRoom(room);
        gameOrder.setRoomUser(roomUser);
        gameOrder.setNowTurn(false);
        gameOrder.setRanking(0);
        gameOrder.setPenalty(0);
        gameOrder.setHaveAnswerChance(true);
        return gameOrder;
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
                    sb.append(" ").append(initialConsonant);
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

    public int getNextTurn(int currentOrder, int endOrder, Room room){
        int nextOrder = currentOrder + 1;
        while(currentOrder != nextOrder){
            if(nextOrder > endOrder){
                nextOrder = 1;
                room.setCycle(room.getCycle()+1);
                roomRepository.save(room);
            }
            GameOrder nextGameOrder = gameOrderRepository.findByUserOrder(nextOrder, room.getId())
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


}
