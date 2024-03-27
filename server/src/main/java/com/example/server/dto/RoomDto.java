package com.example.server.dto;

import lombok.Getter;
import lombok.Setter;

import java.util.List;

@Getter
@Setter
public class RoomDto {
    private Long roomId;
    private boolean isPrivateRoom;
    private int roomEnterCode; // 랜덤 4자리 생성
    private boolean gameStatus;
    private List<UserDto> UserDtos;
}
