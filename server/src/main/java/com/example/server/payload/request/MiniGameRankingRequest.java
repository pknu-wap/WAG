package com.example.server.payload.request;

import lombok.Getter;
import lombok.Setter;

@Getter @Setter
public class MiniGameRankingRequest {
    String nickname;
    Integer stage;
    Long score;
}
