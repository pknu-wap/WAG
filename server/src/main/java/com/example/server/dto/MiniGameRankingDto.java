package com.example.server.dto;

import lombok.Builder;
import lombok.Getter;

@Getter @Builder
public class MiniGameRankingDto {
    Integer rank;
    String nickname;
    Integer stage;
}
