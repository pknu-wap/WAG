package com.example.server.payload;

import lombok.Getter;
import lombok.Setter;

@Getter @Setter
public class RoomCreateRequest {
    private boolean isPrivateRoom;
    private String userNickName;
}
