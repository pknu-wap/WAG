package com.example.server.domain;

import lombok.Getter;
import lombok.Setter;

import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

@Getter @Setter
public class Room {
    private String roomId;
    private String roomName;
    private int userCount;
    private List<String> users;

    public static Room create(String roomName){
        Room room = new Room();
        room.setRoomId(UUID.randomUUID().toString());
        room.setRoomName(roomName);
        room.setUsers(new ArrayList<>());

        return room;
    }
}
