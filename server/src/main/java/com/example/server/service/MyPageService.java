package com.example.server.service;

import com.example.server.domain.Ranking;
import com.example.server.domain.User;
import com.example.server.dto.RankingDto;
import com.example.server.repository.RankingRepository;
import com.example.server.repository.UserRepository;
import com.example.server.security.UserPrincipal;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

@Service
@RequiredArgsConstructor
public class MyPageService {

    private final RankingRepository rankingRepository;
    private final UserRepository userRepository;

    public RankingDto findAll(UserPrincipal userPrincipal, Pageable pageable) {
        List<Ranking> rankingList = rankingRepository.findAll(pageable).getContent();
        boolean isLogin = false;
        String nickname = "";
        Integer my_ranking = 0;
        String imageUrl = "";

        if (userPrincipal != null) {
            User user = userRepository.findById(userPrincipal.getId()).orElseThrow(IllegalArgumentException::new);
            isLogin = true;
            nickname = user.getName();
            imageUrl = user.getImageUrl();
            my_ranking = rankingRepository.findByUser(user).get().getScore();
        }
        return new RankingDto(rankingList, isLogin, nickname, my_ranking, imageUrl);
    }
}
