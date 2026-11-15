package com.example.server.service;

import com.example.server.domain.GameOrder;
import com.example.server.domain.Room;
import com.example.server.domain.RoomUser;
import com.example.server.dto.ChatGameMessage;
import com.example.server.dto.ChatMessage;
import com.example.server.exception.CategoryException;
import com.example.server.exception.MaxPenaltyExceededException;
import com.example.server.exception.NoSuchGameOrderException;
import com.example.server.exception.NoSuchRoomException;
import com.example.server.exception.NoSuchRoomUserException;
import com.example.server.repository.GameOrderRepository;
import com.example.server.repository.RoomRepository;
import com.example.server.repository.RoomUserRepository;
import java.time.LocalDateTime;
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

    /** /app/chat.sendGameMessage 로 들어온 메시지를 종류별로 처리. null 을 돌려주면 컨트롤러가 보내지 않는다. */
    public ChatGameMessage setGame(ChatMessage chatMessage) {
        switch (chatMessage.getMessageType()) {
            case START:   return startGame(chatMessage);
            case PENALTY: return penaltyUser(chatMessage);
            case CORRECT: return correctAnswer(chatMessage);
            case ASK:     return askHandler(chatMessage);
            case RESET:   return resetTimer(chatMessage);
            case NAME:    return nameAnswer(chatMessage);
            case CANCEL:  return cancelNaming(chatMessage);
            default:      return playGame(chatMessage);
        }
    }

    /**
     * 게임 시작. 일반 모드는 바로 START,
     * 서로 이름 지어주기 모드는 NAMING(제시어 입력 단계)을 먼저 보내고 전원이 입력하면 nameAnswer 가 START 를 보낸다.
     */
    public ChatGameMessage startGame(ChatMessage chatMessage) {
        gameService.makeGameOrder(chatMessage);

        Room room = roomRepository.findByRoomId(chatMessage.getRoomId())
                .orElseThrow(() -> new NoSuchRoomException(chatMessage.getRoomId()));
        roomInit(room);

        roomRepository.save(room);

        ChatGameMessage chatGameMessage = messageService.makeChatGameMessage(chatMessage, room);
        chatGameMessage.setMessageType(room.isCustomMode() ? ChatMessage.MessageType.NAMING : ChatMessage.MessageType.START);

        return chatGameMessage;
    }

    private void roomInit(Room room) {
        room.setGameStatus(true);
        room.setCycle(1);
        room.setCurrentOrder(1);
        room.setCorrectMemberCnt(0);
        room.setLeftCorrectMember(0);
        room.setLastStartedTime(LocalDateTime.now());
    }

    /**
     * 서로 이름 지어주기: 보낸 사람이 맡은 상대의 제시어를 저장한다.
     * content 가 비어 있으면(시간 초과) 랜덤 제시어로 대체. 전원 입력이 끝나면 START, 아니면 남은 인원 수를 담은 NAME 을 돌려준다.
     */
    public ChatGameMessage nameAnswer(ChatMessage chatMessage) {
        Long roomId = chatMessage.getRoomId();
        // 두 사람이 동시에 마지막 입력을 해도 START 가 한 번만 나가도록 방 행을 잠근다
        Room room = roomRepository.findByIdForUpdate(roomId)
                .orElseThrow(() -> new NoSuchRoomException(roomId));
        RoomUser sender = roomUserRepository.hasNickName(chatMessage.getSender(), roomId)
                .orElseThrow(() -> new NoSuchRoomUserException(roomId));
        GameOrder senderOrder = gameOrderRepository.findByRoomUser(sender)
                .orElseThrow(NoSuchGameOrderException::new);
        GameOrder targetOrder = gameOrderRepository.findByNickName(senderOrder.getNamingTarget(), roomId)
                .orElseThrow(NoSuchGameOrderException::new);

        if (targetOrder.getAnswerName().isEmpty()) { // 먼저 도착한 입력만 반영
            String word = chatMessage.getContent() == null ? "" : chatMessage.getContent().trim();
            targetOrder.setAnswerName(word.isEmpty() ? gameService.randomAnswer() : word);
            gameOrderRepository.save(targetOrder);
        }

        long pending = gameOrderRepository.countPendingAnswers(roomId);
        ChatGameMessage chatGameMessage = messageService.makeChatGameMessage(chatMessage, room);
        if (pending == 0) {
            chatGameMessage.setMessageType(ChatMessage.MessageType.START);
            chatGameMessage.setContent("");
        } else {
            chatGameMessage.setMessageType(ChatMessage.MessageType.NAME);
            chatGameMessage.setContent(String.valueOf(pending)); // 제시어는 비밀이므로 남은 인원 수만 알린다
        }
        return chatGameMessage;
    }

    /** 방장이 제시어 입력 단계를 취소 → 대기방으로 */
    public ChatGameMessage cancelNaming(ChatMessage chatMessage) {
        Long roomId = chatMessage.getRoomId();
        Room room = roomRepository.findById(roomId)
                .orElseThrow(() -> new NoSuchRoomException(roomId));
        RoomUser sender = roomUserRepository.hasNickName(chatMessage.getSender(), roomId)
                .orElseThrow(() -> new NoSuchRoomUserException(roomId));
        if (!sender.isCaptain()) {
            throw new CategoryException("방장만 취소할 수 있습니다. ");
        }
        return cancelNamingInternal(room, chatMessage.getSender(), "방장이 이름 짓기를 취소했습니다.");
    }

    /** 제시어 입력 단계 정리: 게임 순서 삭제, 방 상태 대기로. 퇴장 처리에서도 쓴다. */
    public ChatGameMessage cancelNamingInternal(Room room, String sender, String content) {
        gameOrderRepository.deleteAll(gameOrderRepository.findAnswerNotMe(room.getId()));
        room.setGameStatus(false);
        room.setNowTurnUserId(null);
        roomRepository.save(room);

        ChatGameMessage chatGameMessage = new ChatGameMessage();
        chatGameMessage.setMessageType(ChatMessage.MessageType.CANCEL);
        chatGameMessage.setContent(content);
        chatGameMessage.setSender(sender);
        chatGameMessage.setRoomId(room.getId());
        chatGameMessage.setGameEnd(false);
        chatGameMessage.setCycle(0);
        chatGameMessage.setGameUserDtos(List.of());
        return chatGameMessage;
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
