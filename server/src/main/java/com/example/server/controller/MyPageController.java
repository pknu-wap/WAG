package com.example.server.controller;

import com.example.server.dto.MyPageDto;
import com.example.server.dto.RankingDto;
import com.example.server.security.CurrentUser;
import com.example.server.security.UserPrincipal;
import com.example.server.service.MyPageService;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
import org.springframework.web.bind.annotation.*;

@RestController
@RequiredArgsConstructor
public class MyPageController {

    private final MyPageService myPageService;

    @GetMapping("/ranking")
    public RankingDto getEntities(@CurrentUser UserPrincipal userPrincipal, @RequestParam int page) {
        return myPageService.getPage(userPrincipal, PageRequest.of(page, 10, Sort.by(Sort.Direction.DESC, "score")));
    }

    @GetMapping("/myPage")
    public MyPageDto getProfile(@CurrentUser UserPrincipal userPrincipal) {
        return myPageService.getProfile(userPrincipal);
    }

    @PutMapping("/myPage")
    public String changeNickName(@CurrentUser UserPrincipal userPrincipal, @RequestBody MyPageDto myPageDto) {
        return myPageService.changeNickName(userPrincipal, myPageDto);
    }

}
