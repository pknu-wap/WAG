package com.example.server.service;

import com.example.server.domain.Room;
import com.example.server.domain.RoomUser;
import com.example.server.dto.UserDto;
import com.example.server.exception.MaxUserCountExceededException;
import com.example.server.payload.request.RoomCreateRequest;
import com.example.server.payload.response.RoomEnterResponse;
import com.example.server.payload.response.RoomResponse;
import com.example.server.repository.RoomRepository;
import com.example.server.repository.RoomUserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.List;
import java.util.Optional;

@Service
public class RoomService {
    private final RoomRepository roomRepository;
    private final RoomUserRepository roomUserRepository;

    @Autowired
    public RoomService(RoomRepository roomRepository,RoomUserRepository roomUserRepository ){
        this.roomRepository = roomRepository;
        this.roomUserRepository = roomUserRepository;
    }

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

        room.setPrivateRoom(roomCreateRequest.isPrivateRoom());
        room.setGameStatus(false);
        room.setUserCount(1);
        room = roomRepository.save(room);  // 방 생성

        RoomUser roomUser = new RoomUser();
        roomUser.setRoom(room);
        roomUser.setCaptain(true);
        roomUser.setRoomNickname(roomCreateRequest.getUserNickName());
        roomUser = roomUserRepository.save(roomUser);   // 방장 추가

        List<UserDto> userDtos = new ArrayList<>();
        userDtos.add(new UserDto(roomUser.isCaptain(), roomUser.getRoomNickname(), roomUser.getProfileImage()));

        return RoomResponse.create(room, userDtos);
    }

    public RoomResponse getRoomInfo(Long roomId){ // 닉네임으로 게임방 정보 주기
        Optional<Room> room = roomRepository.findById(roomId);
        List<UserDto> userDtos = UserDto.makeUserDtos(roomUserRepository.findByRoomId(roomId));

        if (room.isEmpty()) {
            return new RoomResponse();
        }

        return RoomResponse.create(room.get(), userDtos);
    }

    public RoomEnterResponse enterRandomRoom(String nickName){ // 랜덤으로 방 입장
        Optional<Room> optionalRoom = roomRepository.findByRandom();
        if(optionalRoom.isEmpty()){
            return RoomEnterResponse.cantCreate(1);
        }
        else{
            Room room = optionalRoom.get();
            addUser(room, nickName);

            List<UserDto> userDtos = UserDto.makeUserDtos(roomUserRepository.findByRoomId(room.getId()));
            return RoomEnterResponse.create(room, userDtos);
        }
    }

    public RoomEnterResponse enterRoom(String nickName, int enterCode){ // 코드로 방 입장
        Optional<Room> optionalRoom = roomRepository.findRoomByCode(enterCode);
        if(optionalRoom.isEmpty()){  // 해당 방이 존재 안함
            return RoomEnterResponse.cantCreate(3);
        }
        else{
            if(optionalRoom.get().isGameStatus()){  // 해당 방이 게임 진행 중임.
                return RoomEnterResponse.cantCreate(2);
            }
            if (!optionalRoom.get().isPrivateRoom()){
                return RoomEnterResponse.cantCreate(3);  // 사설방이 아니라 입장 불가
            }
            Room room = optionalRoom.get();
            addUser(room, nickName);

            List<UserDto> userDtos = UserDto.makeUserDtos(roomUserRepository.findByRoomId(room.getId()));
            return RoomEnterResponse.create(room, userDtos);
        }
    }

    public RoomResponse enterRoomByRoomId(String nickName, Long roomId){ // 소켓 + roomId로 방 입장.
        Room room = roomRepository.findById(roomId).get();
        if (room.getUserCount() >= 6) {
            throw new MaxUserCountExceededException();  // 최대 인원 예외 처리.
        }
        addUser(room, nickName);
        List<UserDto> userDtos = UserDto.makeUserDtos(roomUserRepository.findByRoomId(room.getId()));
        return RoomResponse.create(room, userDtos);
    }

    public void addUser(Room room, String nickName){  // 방에 유저 추가 로직
        RoomUser roomUser = new RoomUser();
        roomUser.setCaptain(false);
        roomUser.setRoom(room);
        roomUser.setRoomNickname(nickName);
        roomUserRepository.save(roomUser);

        room.setUserCount(room.getUserCount()+1);
        roomRepository.save(room);
    }

    public int makeEnterCode(){ // 4자리 랜덤 코드 생성
        return (int)(Math.random() * 8999) + 1000;
    }

    public String getRoomIdByEnterCode(int enterCode){
        Optional<Room> room = roomRepository.findRoomByCode(enterCode);
        if(room.isEmpty()){
            return "invalid enterCode";
        }else{
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
}
