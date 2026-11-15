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
    /** "전체" 또는 쉼표로 이어진 카테고리 목록 (예: "lol,한국위인") */
    private String category;
    private int timer;
    /** 서로 이름 지어주기 모드 */
    private boolean customMode;
    private List<UserDto> UserDtos;


    public RoomResponse(Long roomId, boolean isPrivateRoom, int roomEnterCode, boolean gameStatus, int userCount, String category, int timer, boolean customMode) {
        this.roomId = roomId;
        this.isPrivateRoom = isPrivateRoom;
        this.roomEnterCode = roomEnterCode;
        this.gameStatus = gameStatus;
        this.userCount = userCount;
        this.category = category;
        this.timer = timer;
        this.customMode = customMode;
    }

    public static RoomResponse create(Room room, List<UserDto> userDtos){
        return new RoomResponse(
                room.getId(),
                room.isPrivateRoom(),
                room.getRoomEnterCode(),
                room.isGameStatus(),
                room.getUserCount(),
                room.getCategory(),
                room.getTimer(),
                room.isCustomMode(),
                userDtos
        );
    }

    public static RoomResponse create(Room room){
        return new RoomResponse(
                room.getId(),
                room.isPrivateRoom(),
                room.getRoomEnterCode(),
                room.isGameStatus(),
                room.getUserCount(),
                room.getCategory(),
                room.getTimer(),
                room.isCustomMode()
        );
    }
}
