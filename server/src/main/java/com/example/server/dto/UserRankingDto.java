package com.example.server.dto;

import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class UserRankingDto {
    private String name;
    private String imageUrl;
    private int score;
}
