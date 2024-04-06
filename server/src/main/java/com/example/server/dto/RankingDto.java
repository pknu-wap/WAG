package com.example.server.dto;

import com.example.server.domain.Ranking;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.Setter;

import java.util.List;

@Getter
@Setter
@AllArgsConstructor
public class RankingDto {

    private List<Ranking> ranking;
    private boolean isLogin;
    private String nickname;
    private Integer my_ranking;
    private String imageUrl;


}
