package com.example.server.controller;

import com.example.server.payload.response.NickNameResponse;
import com.example.server.service.NickNameService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequiredArgsConstructor
public class NickNameController {
    private final NickNameService nickNameService;

    @GetMapping("/nickname/possible")
    public ResponseEntity<NickNameResponse> postNickName(@RequestParam String nickname, @RequestParam Long roomId){// 게임 방 생성
        return new ResponseEntity<>(nickNameService.settingNickName(nickname, roomId), HttpStatus.OK);
    }



}
