package com.example.server.payload.response;

import com.example.server.domain.Room;
import com.example.server.domain.RoomUser;
import com.example.server.dto.ResultUserDto;
import lombok.Getter;
import lombok.Setter;

import java.util.ArrayList;
import java.util.List;

//@AllArgsConstructor
@Getter
@Setter
public class ResultResponse {
    private Long roomId;
    private int userCount;
    private List<ResultUserDto> resultUserDtos;

    public ResultResponse(Room room, List<RoomUser> roomUsers){
        this.roomId = room.getId();
        this.userCount = room.getUserCount();
        List<ResultUserDto> resultUserDtos = new ArrayList<>();
        for(RoomUser roomUser : roomUsers){
            resultUserDtos.add(new ResultUserDto(roomUser.getRoomNickname(), roomUser.getProfileImage(),
                    roomUser.getGameOrder().getAnswerName(), roomUser.getGameOrder().getRanking()));
        }
        this.resultUserDtos = resultUserDtos;
    }
}
