package com.example.server.payload.response;

import com.example.server.domain.Room;
import com.example.server.dto.UserDto;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.util.List;
@AllArgsConstructor
@NoArgsConstructor
@Getter
@Setter
public class RoomResponse {
    // 게임 방 response
    private Long roomId;
    private boolean isPrivateRoom;
    private int roomEnterCode; // 랜덤 4자리 생성
    private boolean gameStatus;
    private int userCount;
    private List<UserDto> UserDtos;

    public static RoomResponse create(Room room, List<UserDto> userDtos){
        return new RoomResponse(
                room.getId(),
                room.isPrivateRoom(),
                room.getRoomEnterCode(),
                room.isGameStatus(),
                room.getUserCount(),
                userDtos
        );
    }
}
