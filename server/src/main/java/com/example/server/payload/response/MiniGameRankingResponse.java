package com.example.server.payload.response;

import com.example.server.dto.MiniGameRankingDto;
import lombok.Builder;
import lombok.Getter;

import java.util.List;

@Getter @Builder
public class MiniGameRankingResponse {
    Boolean hasNextPage;
    List<MiniGameRankingDto> miniGameRankingDtos;
}
