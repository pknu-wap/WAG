package com.example.server.payload.request;

import lombok.Getter;
import lombok.Setter;

@Getter @Setter
public class RoomCreateRequest {
    private boolean isPrivateRoom;
    private String userNickName;
}
