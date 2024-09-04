package com.example.server.service;

import com.example.server.domain.GameOrder;
import com.example.server.domain.Room;
import com.example.server.domain.RoomUser;
import com.example.server.dto.ChatGameMessage;
import com.example.server.dto.ChatMessage;
import com.example.server.dto.GameUserDto;
import com.example.server.exception.NoSuchGameOrderException;
import com.example.server.repository.GameOrderRepository;
import com.example.server.repository.RoomUserRepository;
import lombok.AllArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.List;

@Service
@AllArgsConstructor
public class MessageService {

    private final RoomUserRepository roomUserRepository;
    private final GameOrderRepository gameOrderRepository;

    public ChatGameMessage makeChatGameMessage(ChatMessage chatMessage, Room room){
        ChatGameMessage chatGameMessage = new ChatGameMessage();
        chatGameMessage.setContent(chatMessage.getContent());
        chatGameMessage.setSender(chatMessage.getSender());
        chatGameMessage.setRoomId(chatMessage.getRoomId());
        chatGameMessage.setGameEnd(room.isGameStatus());
        chatGameMessage.setCycle(room.getCycle());
        chatGameMessage.setGameUserDtos(makeGameUsersDto(chatMessage.getRoomId()));
        chatGameMessage.setMessageType(chatMessage.getMessageType());
        return chatGameMessage;
    }

    public List<GameUserDto> makeGameUsersDto(Long roomId){ // GameUserDtos 생성 메소드
        List<RoomUser> roomUsers = roomUserRepository.findByRoomId(roomId);
        return getGameUsersDto(roomUsers);
    }

    public List<GameUserDto> getGameUsersDto(List<RoomUser> roomUsers) {
        List<GameUserDto> gameUsersDto = new ArrayList<>();
        for(RoomUser roomUser : roomUsers){
            GameOrder gameOrder = gameOrderRepository.findByRoomUser(roomUser)
                    .orElseThrow(NoSuchGameOrderException::new);
            GameUserDto gameUserDto = GameUserDto.of(gameOrder, roomUser);
            gameUsersDto.add(gameUserDto);
        }
        return gameUsersDto;
    }

    public ChatGameMessage makeEndChatGameMessage(ChatMessage chatMessage, Room room){  // 순위 기준 정렬 chatGameMessage 생성
        ChatGameMessage chatGameMessage = new ChatGameMessage();
        chatGameMessage.setContent(chatMessage.getContent());
        chatGameMessage.setSender(chatMessage.getSender());
        chatGameMessage.setRoomId(chatMessage.getRoomId());
        chatGameMessage.setGameEnd(room.isGameStatus());
        chatGameMessage.setCycle(room.getCycle());
        chatGameMessage.setGameUserDtos(makeEndGameUsersDto(room));
        chatGameMessage.setMessageType(chatMessage.getMessageType());
        return chatGameMessage;
    }

    public List<GameUserDto> makeEndGameUsersDto(Room room){ // GameUserDtos(순위 기준 정렬) 생성 메소드
        List<RoomUser> roomUsers = gameOrderRepository.findByRoomIdOrderByRanking(room.getId());
        List<RoomUser> secondRoomUsers = gameOrderRepository.findByZeroOrderByRanking(room.getId());

        List<GameUserDto> gameUsersDto = new ArrayList<>();
        for(RoomUser roomUser : roomUsers){
            GameOrder gameOrder = gameOrderRepository.findByRoomUser(roomUser)
                    .orElseThrow(NoSuchGameOrderException::new);
            GameUserDto gameUserDto = GameUserDto.of(gameOrder, roomUser);
            gameUserDto.setAnswername(gameOrder.getAnswerName());  // 정답어 추가로 전송
            gameUsersDto.add(gameUserDto);

        }
        for(RoomUser roomUser : secondRoomUsers){
            GameOrder gameOrder = gameOrderRepository.findByRoomUser(roomUser)
                    .orElseThrow(NoSuchGameOrderException::new);
            GameUserDto gameUserDto = GameUserDto.of(gameOrder, roomUser);
            gameUserDto.setAnswername(gameOrder.getAnswerName());  // 정답어 추가로 전송
            gameUsersDto.add(gameUserDto);
        }

        return gameUsersDto;
    }
}
