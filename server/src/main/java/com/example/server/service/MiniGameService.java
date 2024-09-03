package com.example.server.service;

import com.example.server.domain.MiniGameRanking;
import com.example.server.dto.MiniGameRankingDto;
import com.example.server.payload.request.MiniGameRankingRequest;
import com.example.server.payload.response.MiniGameRankingResponse;
import com.example.server.repository.MiniGameRepository;
import lombok.AllArgsConstructor;
import org.hibernate.query.criteria.JpaCriteriaUpdate;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.List;

@AllArgsConstructor
@Service
public class MiniGameService {
    private final MiniGameRepository miniGameRepository;

    public String postRanking(MiniGameRankingRequest miniGameRankingRequest){
        MiniGameRanking miniGameRanking = new MiniGameRanking();
        miniGameRanking.setNickname(miniGameRankingRequest.getNickname());
        miniGameRanking.setStage(miniGameRankingRequest.getStage());
        miniGameRepository.save(miniGameRanking);
        return "success post ranking";
    }

    public MiniGameRankingResponse getRanking(int pageNumber, int pageSize){
        Sort sort = Sort.by(Sort.Order.desc("stage"));
        Pageable pageable = PageRequest.of(pageNumber, pageSize, sort);
        Page<MiniGameRanking> miniGameRankingPage = miniGameRepository.findAll(pageable);
        List<MiniGameRanking> miniGameRankings = miniGameRankingPage.getContent();
        List<MiniGameRankingDto> miniGameRankingDtos = new ArrayList<>();
        int idx = 1;
        for(MiniGameRanking miniGameRanking : miniGameRankings){
            MiniGameRankingDto miniGameRankingDto = MiniGameRankingDto.builder()
                    .rank(idx++)
                    .nickname(miniGameRanking.getNickname())
                    .stage(miniGameRanking.getStage())
                    .build();
            miniGameRankingDtos.add(miniGameRankingDto);
        }

        Boolean hasNextPage = true;
        if(miniGameRankingPage.getNumber() == miniGameRankingPage.getTotalPages() - 1)
            hasNextPage = false;

        return MiniGameRankingResponse.builder()
                .hasNextPage(hasNextPage)
                .miniGameRankingDtos(miniGameRankingDtos)
                .build();
    }

}
