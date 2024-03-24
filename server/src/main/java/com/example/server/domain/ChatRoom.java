package com.example.server.domain;

import lombok.Getter;
import lombok.Setter;

import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

@Getter @Setter
public class ChatRoom {
    private String roomId;
    private String roomName;
    private int userCount;
    private List<String> users;

    public static ChatRoom create(String roomName){
        ChatRoom chatRoom = new ChatRoom();
        chatRoom.setRoomId(UUID.randomUUID().toString());
        chatRoom.setRoomName(roomName);
        chatRoom.setUsers(new ArrayList<>());

        return chatRoom;
    }
}
