package com.example.server.controller;

import com.example.server.dto.RankingDto;
import com.example.server.security.CurrentUser;
import com.example.server.security.UserPrincipal;
import com.example.server.service.MyPageService;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequiredArgsConstructor
public class MyPageController {

    private final MyPageService myPageService;

    @GetMapping("/ranking")
    public RankingDto getEntities(@CurrentUser UserPrincipal userPrincipal, @RequestParam int page) {
        return myPageService.findAll(userPrincipal, PageRequest.of(page, 10, Sort.by(Sort.Direction.DESC, "score")));
    }

}
