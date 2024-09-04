package com.example.server.service;

import com.example.server.domain.Room;
import com.example.server.domain.RoomUser;
import com.example.server.domain.User;
import com.example.server.dto.ChatMessage;
import com.example.server.dto.ChatReadyMessage;
import com.example.server.dto.ChatRoomModeMessage;
import com.example.server.dto.UserDto;
import com.example.server.exception.*;
import com.example.server.payload.request.RoomCreateRequest;
import com.example.server.payload.response.RoomResponse;
import com.example.server.repository.*;
import com.example.server.security.UserPrincipal;
import lombok.AllArgsConstructor;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Optional;

@Service
@Transactional
@AllArgsConstructor
public class RoomService {
    private final RoomRepository roomRepository;
    private final RoomUserRepository roomUserRepository;
    private final AnswerListRepository answerListRepository;
    private final UserRepository userRepository;

    public RoomResponse create(RoomCreateRequest roomCreateRequest){ // 게임 방 생성
        Room room = new Room();

        int enterCode;
        while(true){  // 참여 코드 중복 확인
            enterCode = makeEnterCode();
            Optional<Integer> code = roomRepository.findByCode(enterCode);
            if(code.isEmpty()){
                room.setRoomEnterCode(enterCode);
                break;
            }
        }
        room = room_init(roomCreateRequest, room);  // room 생성

        return RoomResponse.create(room);
    }

    private Room room_init(RoomCreateRequest roomCreateRequest, Room room) {
        room.setPrivateRoom(roomCreateRequest.isPrivateRoom());
        room.setGameStatus(false);
        room.setUserCount(0);
        room.setCategory(roomCreateRequest.getCategory());
        room.setTimer(roomCreateRequest.getTimer());
        room = roomRepository.save(room);  // 방 생성
        return room;
    }

    public RoomResponse getRoomInfo(Long roomId){ // 닉네임으로 게임방 정보 주기

        Room room = roomRepository.findById(roomId).orElseThrow(() -> new NoSuchRoomException(roomId));
        List<UserDto> userDtos = UserDto.makeUserDtos(roomUserRepository.findByRoomId(roomId));

        return RoomResponse.create(room, userDtos);
    }

    public RoomResponse enterRoomByRoomId(String nickName, Long roomId, UserPrincipal userPrincipal){ // 소켓 + roomId로 방 입장.
        Room room = roomRepository.findById(roomId).orElseThrow(() -> new NoSuchRoomException(roomId));
        if(room.isGameStatus()){
            throw new AlreadyStartedRoomException();  // 이미 시작된 방 예외 처리
        }

        boolean isCaptain = false;
        if (room.getUserCount() >= 6) {
            throw new MaxUserCountExceededException();  // 최대 인원 예외 처리.
        } else if (room.getUserCount() == 0) {
            isCaptain = true;
        }
        addUser(room, nickName, isCaptain, userPrincipal);
        List<UserDto> userDtos = UserDto.makeUserDtos(roomUserRepository.findByRoomId(room.getId()));
        return RoomResponse.create(room, userDtos);
    }

    public void addUser(Room room, String nickName,Boolean isCaptain, UserPrincipal userPrincipal){  // 방에 유저 추가 로직
        RoomUser roomUser = RoomUserInit(room, nickName, isCaptain);

        if (userPrincipal != null && userPrincipal.getId() != null) {
            Optional<User> userOptional = userRepository.findById((userPrincipal.getId()));
            userOptional.ifPresent(roomUser::setUser);
        }
        room.setUserCount(room.getUserCount()+1);

        roomUserRepository.save(roomUser);
        roomRepository.save(room);
    }

    private RoomUser RoomUserInit(Room room, String nickName, Boolean isCaptain) {
        RoomUser roomUser = new RoomUser();
        roomUser.setCaptain(isCaptain);
        roomUser.setRoom(room);
        roomUser.setRoomNickname(nickName);
        if(isCaptain){
            roomUser.setReady(true);
        }
        else{
            roomUser.setReady(false);
        }

        return roomUser;
    }

    private int makeEnterCode(){ // 4자리 랜덤 코드 생성
        return (int)(Math.random() * 8999) + 1000;
    }

    public String getRoomIdByEnterCode(int enterCode){
        Optional<Room> room = roomRepository.findRoomByCode(enterCode);
        if(room.isEmpty()){
            return "invalid enterCode";
        }
        else if (room.get().isGameStatus()) {
            return "already started";
        }
        else{
            return String.valueOf(room.get().getId());
        }
    }

    public String getRandomRoomId(){
        Optional<Long> randomRoomId = roomUserRepository.findRandomRoomId();
        if(randomRoomId.isEmpty()){
            return "no available room";
        }else{
            return String.valueOf(randomRoomId.get());
        }

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
}
