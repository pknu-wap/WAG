package com.example.server.service;

import com.example.server.domain.AnswerList;
import com.example.server.domain.GameOrder;
import com.example.server.domain.Room;
import com.example.server.domain.RoomUser;
import com.example.server.dto.ChatMessage;
import com.example.server.exception.CantStartGameException;
import com.example.server.exception.CategoryException;
import com.example.server.exception.NoSuchGameOrderException;
import com.example.server.exception.NoSuchRoomException;
import com.example.server.payload.response.AnswerListResponse;
import com.example.server.repository.AnswerListRepository;
import com.example.server.repository.GameOrderRepository;
import com.example.server.repository.RoomRepository;
import com.example.server.repository.RoomUserRepository;
import lombok.AllArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.Arrays;
import java.util.List;

@Service
@AllArgsConstructor
public class GameService {

    /** 카테고리 값이 이것이면 모든 카테고리에서 제시어를 뽑는다 */
    public static final String ALL_CATEGORY = "전체";

    private final RoomRepository roomRepository;
    private final RoomUserRepository roomUserRepository;
    private final AnswerListRepository answerListRepository;
    private final GameOrderRepository gameOrderRepository;


    /**
     * 게임 순서 & 정답어 설정.
     * - 일반 모드: 방 카테고리(복수 가능)에서 랜덤 제시어를 뽑아 배정
     * - 서로 이름 지어주기 모드: 제시어는 비워 두고, 각자 다음 순서 사람의 제시어를 정하도록 namingTarget 만 배정
     */
    public void makeGameOrder(ChatMessage chatMessage){
        Long roomId = chatMessage.getRoomId();
        Room room = roomRepository.findById(roomId).orElseThrow(()->new NoSuchRoomException(roomId));
        List<RoomUser> roomUsers = roomUserRepository.findRandomByRoomId(roomId);

        for(RoomUser roomUser : roomUsers){ // 레디하지 않은 유저가 있다면 예외처리.
            if(!roomUser.isReady()){
                throw new CantStartGameException();
            }
        }

        List<AnswerList> answerLists = room.isCustomMode() ? List.of() : pickAnswers(room.getCategory(), roomUsers.size());

        int order = 1;
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
            if (room.isCustomMode()) {
                gameOrder.setAnswerName("");
                // 내 다음 순서 사람의 제시어를 내가 정한다 (마지막 사람은 첫 사람)
                gameOrder.setNamingTarget(roomUsers.get(order % roomUsers.size()).getRoomNickname());
            } else {
                gameOrder.setAnswerName(answerLists.get(order-1).getName());
            }
            gameOrder.setUserOrder(order);
            order += 1;
            roomUser.setGameOrder(gameOrder);
            gameOrderRepository.save(gameOrder);
        }
    }

    /** 카테고리 문자열("전체" 또는 "lol,한국위인")에 맞는 제시어를 인원수만큼 뽑는다 */
    public List<AnswerList> pickAnswers(String category, int count) {
        List<String> groups = parseCategories(category);
        List<AnswerList> answers = groups.isEmpty()
                ? answerListRepository.findAnswerListBy()
                : answerListRepository.findAnswerListByGroups(groups);
        if (answers.size() < count) {
            throw new CategoryException("선택한 카테고리의 제시어가 부족합니다. (" + answers.size() + "개)");
        }
        return answers;
    }

    /** 서로 이름 지어주기에서 시간 안에 입력하지 않았을 때 대신 쓸 제시어 */
    public String randomAnswer() {
        return answerListRepository.findAnswerListBy().get(0).getName();
    }

    /** "전체" 이거나 비어 있으면 빈 목록, 아니면 쉼표로 나눈 카테고리 목록 */
    public static List<String> parseCategories(String category) {
        if (category == null || category.isBlank() || category.trim().equals(ALL_CATEGORY)) {
            return List.of();
        }
        return Arrays.stream(category.split(","))
                .map(String::trim)
                .filter(s -> !s.isEmpty() && !s.equals(ALL_CATEGORY))
                .distinct()
                .toList();
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
