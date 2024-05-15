package com.example.server.service;

import com.example.server.domain.RoomUser;
import com.example.server.domain.User;
import com.example.server.payload.response.NickNameResponse;
import com.example.server.repository.RoomUserRepository;
import com.example.server.repository.UserRepository;
import com.example.server.security.UserPrincipal;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.Optional;

@Service
@RequiredArgsConstructor
public class NickNameService {
    private final RoomUserRepository roomUserRepository;
    private final UserRepository userRepository;

    public String getNickName(UserPrincipal userPrincipal){
        if (userPrincipal == null || userPrincipal.getId() == null) {
            return null;
        }

        Optional<User> user = userRepository.findById(userPrincipal.getId());
        return user.get().getNickName();
    }

    public NickNameResponse settingNickName(String nickName, Long roomId){
        Optional <RoomUser> hasNickName = roomUserRepository.hasRoomNickName(nickName, roomId);
        boolean isPos= hasNickName.isEmpty();

        return new NickNameResponse(isPos, nickName);
    }
}
