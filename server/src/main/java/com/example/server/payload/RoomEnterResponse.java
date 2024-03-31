package com.example.server.payload;

import com.example.server.domain.Room;
import com.example.server.dto.UserDto;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.Setter;

import java.util.List;

@AllArgsConstructor
@Getter
@Setter
public class RoomEnterResponse {
    // 게임 입장 방 response
    private boolean enter;
    private String errorCode;

    private Long roomId;
    private boolean isPrivateRoom;
    private int roomEnterCode; // 랜덤 4자리 생성
    private boolean gameStatus;
    private int userCount;
    private List<UserDto> UserDtos;

    public static RoomEnterResponse create(Room room, List<UserDto> userDtos){
        return new RoomEnterResponse(
                true,
                "",
                room.getId(),
                room.isPrivateRoom(),
                room.getRoomEnterCode(),
                room.isGameStatus(),
                room.getUserCount(),
                userDtos
        );
    }

    public static RoomEnterResponse cantCreate(int enter){
        String errorMessage = null;
        if(enter == 1){
            errorMessage = "현재 입장할 수 있는 방이 없습니다.";
        }
        else if(enter == 2){
            errorMessage = "이미 게임이 시작된 방입니다.";
        }
        else{
            errorMessage = "유효하지 않는 코드 입니다.";
        }
        return new RoomEnterResponse(
                false,
                errorMessage,
                null,
                true,
                0,
                false,
                0,
                null
        );
    }
}
