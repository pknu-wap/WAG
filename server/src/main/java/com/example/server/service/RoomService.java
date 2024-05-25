package com.example.server.service;

import com.example.server.domain.Room;
import com.example.server.domain.RoomUser;
import com.example.server.domain.User;
import com.example.server.dto.UserDto;
import com.example.server.exception.AlreadyStartedRoomException;
import com.example.server.exception.MaxUserCountExceededException;
import com.example.server.exception.NoSuchRoomException;
import com.example.server.payload.request.RoomCreateRequest;
import com.example.server.payload.response.RoomResponse;
import com.example.server.repository.RoomRepository;
import com.example.server.repository.RoomUserRepository;
import com.example.server.repository.UserRepository;
import com.example.server.security.UserPrincipal;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Optional;

@Service
@Transactional
@RequiredArgsConstructor
public class RoomService {
    private final RoomRepository roomRepository;
    private final RoomUserRepository roomUserRepository;
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

    private static RoomUser RoomUserInit(Room room, String nickName, Boolean isCaptain) {
        RoomUser roomUser = new RoomUser();
        roomUser.setCaptain(isCaptain);
        roomUser.setRoom(room);
        roomUser.setRoomNickname(nickName);
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
        Optional<Long> randomRoomId = roomRepository.findRandomRoomId();
        if(randomRoomId.isEmpty()){
            return "no available room";
        }else{
            return String.valueOf(randomRoomId.get());
        }

    }


//    public RoomEnterResponse enterRandomRoom(String nickName, UserPrincipal userPrincipal){ // 랜덤으로 방 입장
//        Optional<Room> optionalRoom = roomRepository.findByRandom();
//        if(optionalRoom.isEmpty()){
//            return RoomEnterResponse.cantCreate(1);
//        }
//        else{
//            Room room = optionalRoom.get();
//            addUser(room, nickName, userPrincipal);
//
//            List<UserDto> userDtos = UserDto.makeUserDtos(roomUserRepository.findByRoomId(room.getId()));
//            return RoomEnterResponse.create(room, userDtos);
//        }
//    }
//
//
//    public RoomEnterResponse enterRoom(String nickName, int enterCode, UserPrincipal userPrincipal){ // 코드로 방 입장
//        Optional<Room> optionalRoom = roomRepository.findRoomByCode(enterCode);
//        if(optionalRoom.isEmpty()){  // 해당 방이 존재 안함
//            return RoomEnterResponse.cantCreate(3);
//        }
//        else{
//            if(optionalRoom.get().isGameStatus()){  // 해당 방이 게임 진행 중임.
//                return RoomEnterResponse.cantCreate(2);
//            }
//            if (!optionalRoom.get().isPrivateRoom()){
//                return RoomEnterResponse.cantCreate(3);  // 사설방이 아니라 입장 불가
//            }
//            Room room = optionalRoom.get();
//            addUser(room, nickName, userPrincipal);
//
//            List<UserDto> userDtos = UserDto.makeUserDtos(roomUserRepository.findByRoomId(room.getId()));
//            return RoomEnterResponse.create(room, userDtos);
//        }
//    }


}
