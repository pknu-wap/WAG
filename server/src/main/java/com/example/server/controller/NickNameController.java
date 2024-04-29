package com.example.server.controller;

import com.example.server.payload.response.NickNameResponse;
import com.example.server.security.CurrentUser;
import com.example.server.security.UserPrincipal;
import com.example.server.service.NickNameService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
public class NickNameController {
    private final NickNameService nickNameService;

    @Autowired
    public NickNameController(NickNameService nickNameService){
        this.nickNameService = nickNameService;
    }

    @GetMapping("/nickname")
    public String getRoominfo(@CurrentUser UserPrincipal userPrincipal){// 닉네임으로 게임 방 정보주기
        return nickNameService.getNickName(userPrincipal);
    }

    @GetMapping("/nickname/possible")
    public ResponseEntity<NickNameResponse> postNickName(@RequestParam String nickname, @RequestParam Long roomId){// 게임 방 생성
        return new ResponseEntity<>(nickNameService.settingNickName(nickname, roomId), HttpStatus.OK);
    }



}
