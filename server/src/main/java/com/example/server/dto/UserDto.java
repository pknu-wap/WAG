package com.example.server.dto;

import com.example.server.domain.RoomUser;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.Setter;

import java.util.ArrayList;
import java.util.List;

@AllArgsConstructor
@Getter @Setter
public class UserDto {
    private boolean isCaptain;
    private String roomNickname;
    private String profileImage;
    private boolean isReady;
    public static List<UserDto> makeUserDtos(List<RoomUser> roomUsers){ // UserDtos 생성 메소드
        List<UserDto> userDtos = new ArrayList<>();
        for(RoomUser roomUser : roomUsers){
            userDtos.add(new UserDto(roomUser.isCaptain(), roomUser.getRoomNickname(), roomUser.getProfileImage(), roomUser.isReady()));
        }
        return userDtos;
    }
}
