package com.example.server.service;

import com.example.server.domain.Ranking;
import com.example.server.domain.User;
import com.example.server.dto.MyPageDto;
import com.example.server.dto.RankingDto;
import com.example.server.repository.RankingRepository;
import com.example.server.repository.UserRepository;
import com.example.server.security.UserPrincipal;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
public class MyPageService {

    private final RankingRepository rankingRepository;
    private final UserRepository userRepository;

    public RankingDto getPage(UserPrincipal userPrincipal, Pageable pageable) {
        List<Ranking> rankingList = rankingRepository.findAll(pageable).getContent();
        boolean isLogin = false;
        String nickname = "";
        Integer my_ranking = 0;
        String imageUrl = "";

        if (userPrincipal != null) {
            User user = userRepository.findById(userPrincipal.getId()).orElseThrow(IllegalArgumentException::new);
            isLogin = true;
            nickname = user.getNickName();
            imageUrl = user.getImageUrl();
            my_ranking = rankingRepository.findByUser(user).get().getScore();
        }
        return new RankingDto(rankingList, isLogin, nickname, my_ranking, imageUrl);
    }

    public MyPageDto getProfile(UserPrincipal userPrincipal) {

        if(userPrincipal == null) return null;

        User user = userRepository.findById(userPrincipal.getId()).get();
        MyPageDto myPageDto = new MyPageDto();
        myPageDto.setProfileImage(user.getImageUrl());
        myPageDto.setNickName(user.getNickName());

        return myPageDto;
    }

    @Transactional
    public String changeNickName(UserPrincipal userPrincipal, MyPageDto myPageDto) {
        if(userPrincipal == null) return "invalid id";

        User user = userRepository.findById(userPrincipal.getId()).get();
        user.setNickName(myPageDto.getNickName());
        userRepository.save(user);
        return "success change nickName";
    }
}
