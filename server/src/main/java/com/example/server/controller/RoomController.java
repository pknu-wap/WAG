package com.example.server.controller;

import com.example.server.payload.request.RoomCreateRequest;
import com.example.server.payload.response.RoomEnterResponse;
import com.example.server.payload.response.RoomResponse;
import com.example.server.service.RoomService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
public class RoomController {
    private final RoomService roomService;
    @Autowired
    public RoomController(RoomService roomService){
        this.roomService = roomService;
    }
    @GetMapping("/room/info")
    public ResponseEntity<RoomResponse> returnRoominfo(@RequestParam String nickName){// 닉네임으로 게임 방 정보주기
        RoomResponse roomResponse = roomService.getRoomInfo(nickName);
        return new ResponseEntity<>(roomResponse, HttpStatus.OK);
    }

    @PostMapping("/room/create")
    public ResponseEntity<RoomResponse> createChatRoom(@RequestBody RoomCreateRequest roomCreateRequest){// 게임 방 생성
        RoomResponse roomResponse = roomService.create(roomCreateRequest);
        return new ResponseEntity<>(roomResponse, HttpStatus.OK);
    }

    @PostMapping("/room/enter/random")
    public ResponseEntity<RoomEnterResponse> enterRandomChatRoom(@RequestParam String nickName){// 랜덤으로 방 입장
        RoomEnterResponse roomEnterResponse = roomService.enterRandomRoom(nickName);
        return new ResponseEntity<>(roomEnterResponse, HttpStatus.OK);
    }

    @PostMapping("/room/enter")
    public ResponseEntity<RoomEnterResponse> enterChatRoom(@RequestParam String nickName, @RequestParam int enterCode){// 코드로 방 입장
        RoomEnterResponse roomEnterResponse = roomService.enterRoom(nickName, enterCode);
        return new ResponseEntity<>(roomEnterResponse, HttpStatus.OK);
    }

}
