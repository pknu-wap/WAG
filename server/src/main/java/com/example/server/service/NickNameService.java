package com.example.server.service;

import com.example.server.domain.RoomUser;
import com.example.server.domain.User;
import com.example.server.payload.response.NickNameResponse;
import com.example.server.repository.RoomUserRepository;
import com.example.server.repository.UserRepository;
import com.example.server.security.UserPrincipal;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.Optional;

@Service
public class NickNameService {
    private final RoomUserRepository roomUserRepository;
    private final UserRepository userRepository;

    @Autowired
    public NickNameService (RoomUserRepository roomUserRepository, UserRepository userRepository){
        this.roomUserRepository = roomUserRepository;
        this.userRepository = userRepository;
    }

    public String getNickName(UserPrincipal userPrincipal){
        if (userPrincipal == null)  return null;

        Optional<User> user = userRepository.findById(userPrincipal.getId());
        return user.get().getNickName();
    }

    public NickNameResponse settingNickName(String nickName, Long roomId){
        boolean isPos;
        Optional <RoomUser> hasNickName = roomUserRepository.hasRoomNickName(nickName, roomId);
        if(hasNickName.isEmpty()){
            isPos = true;
        }
        else{
            isPos = false;
        }

        return new NickNameResponse(isPos, nickName);
    }
}
