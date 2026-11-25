package com.example.server.service;

import com.example.server.domain.RoomUser;
import com.example.server.payload.response.NickNameResponse;
import com.example.server.repository.RoomUserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.Optional;

@Service
@RequiredArgsConstructor
public class NickNameService {
    private final RoomUserRepository roomUserRepository;

    public NickNameResponse settingNickName(String nickName, Long roomId){
        Optional <RoomUser> hasNickName = roomUserRepository.hasRoomNickName(nickName, roomId);
        boolean isPos= hasNickName.isEmpty();

        return new NickNameResponse(isPos, nickName);
    }
}
