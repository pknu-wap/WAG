package com.example.server.repository;

import com.example.server.domain.Room;
import org.springframework.stereotype.Repository;

import java.util.ArrayList;
import java.util.Collections;
import java.util.Iterator;
import java.util.List;

@Repository
public class RoomRepositoryy {
    private static List<Room> rooms = new ArrayList<>();

//    public List<Room> getChatRoomList() {
//        List<Room> result = new ArrayList<>(rooms);
//        Collections.reverse(result);
//        return result;
//    }
//
//    public static Room getChatRoom(String roomId) {
//        return rooms.stream()
//                .filter(room -> roomId.equals(room.getRoomId()))
//                .findFirst()
//                .orElse(null);
//    }
//    public static void plusUserCnt(Room room) {
//        room.setUserCount(room.getUserCount()+1);
//    }
//
//    public String addUser(String roomId, String sender) {
//        Room room = getChatRoom(roomId);
//        plusUserCnt(room);
//        room.getUsers().add("sender");
//        return sender;
//    }
//
//    public void deleteUser(String username, String roomId) {
//        Room room = getChatRoom(roomId);
//
//        List<String> chatRoomUsers = room.getUsers();
//        room.setUserCount(room.getUserCount()-1);
//
//        if(room.getUserCount()==0){
////            rooms.remove(room);
//        }
//
//        Iterator<String> iterator = chatRoomUsers.iterator();
//        while (iterator.hasNext()) {
//            String name = iterator.next();
//            if (name.equals(username)) {
//                iterator.remove();
//            }
//        }
//    }

//    public Room createChatRoom(String roomName){
//        Room room = Room.create(roomName);
//        rooms.add(room);
//        return room;
//    }
}
