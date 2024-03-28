package com.example.server.service;

import com.example.server.domain.Room;
import com.example.server.domain.RoomUser;
import com.example.server.dto.UserDto;
import com.example.server.payload.RoomCreateRequest;
import com.example.server.payload.RoomResponse;
import com.example.server.repository.RoomRepository;
import com.example.server.repository.RoomUserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.List;

@Service
public class ChatService {
    @Autowired
    private RoomRepository roomRepository;
    @Autowired
    private RoomUserRepository roomUserRepository;

    public RoomResponse create(RoomCreateRequest roomCreateRequest){ // 게임 방 생성

        int enterCode;
        while(true){  // 참여 코드 중복 확인
            enterCode = makeEnterCode();
            if(enterCode != roomRepository.findByCode(enterCode)){
                break;
            }
        }

        Room room = new Room();
        room.setPrivateRoom(roomCreateRequest.isPrivateRoom());
        room.setGameStatus(false);
        room.setRoomEnterCode(enterCode);
        room.setUserCount(1);
        room = roomRepository.save(room);

        RoomUser roomUser = new RoomUser();
        roomUser.setRoom(room);
        roomUser.setCaptain(true);
        roomUser.setRoomNickname(roomCreateRequest.getUserNickName());
        roomUser = roomUserRepository.save(roomUser);

        List<UserDto> userDtos = new ArrayList<>();
        userDtos.add(new UserDto(roomUser.isCaptain(), roomUser.getRoomNickname(), roomUser.getProfileImage()));

        return RoomResponse.create(room, userDtos);
    }

    public RoomResponse getRoomInfo(String nickName){ // 닉네임으로 게임방 정보 주기
        Room room = roomRepository.findByNickName(nickName);
        List<UserDto> userDtos = roomUserRepository.findByNickName(nickName);

        return RoomResponse.create(room, userDtos);
    }


    public int makeEnterCode(){ // 랜덤 코드 생성
        return (int)(Math.random() * 8999) + 1000;
    }
}
