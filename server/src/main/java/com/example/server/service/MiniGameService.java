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
import org.springframework.transaction.annotation.Transactional;

import java.util.ArrayList;
import java.util.List;
import java.util.Optional;

@Transactional
@AllArgsConstructor
@Service
public class MiniGameService {
    private final MiniGameRepository miniGameRepository;

    public String postRanking(MiniGameRankingRequest miniGameRankingRequest){
        if(miniGameRankingRequest.getNickname().equals("") || miniGameRankingRequest.getNickname()==null)
            miniGameRankingRequest.setNickname("---");

        Optional<MiniGameRanking> miniGameRankingOptional = miniGameRepository.findByNickname(miniGameRankingRequest.getNickname());
        if(miniGameRankingOptional.isPresent()){
            MiniGameRanking miniGameRanking = miniGameRankingOptional.get();
            if(miniGameRanking.getScore() < miniGameRankingRequest.getScore()){
                miniGameRanking.setStage(miniGameRankingRequest.getStage());
                miniGameRanking.setScore(miniGameRanking.getScore());
                miniGameRepository.save(miniGameRanking);
            }
        }
        else{
            MiniGameRanking miniGameRanking = new MiniGameRanking();
            miniGameRanking.setNickname(miniGameRankingRequest.getNickname());
            miniGameRanking.setStage(miniGameRankingRequest.getStage());
            miniGameRepository.save(miniGameRanking);
        }

        return "success post ranking";
    }

    public MiniGameRankingResponse getRanking(int pageNumber, int pageSize){
        Sort sort = Sort.by(Sort.Order.desc("score"));
        Pageable pageable = PageRequest.of(pageNumber, pageSize, sort);
        Page<MiniGameRanking> miniGameRankingPage = miniGameRepository.findAll(pageable);
        List<MiniGameRanking> miniGameRankings = miniGameRankingPage.getContent();
        List<MiniGameRankingDto> miniGameRankingDtos = new ArrayList<>();
        int idx = pageNumber * pageSize;
        for(MiniGameRanking miniGameRanking : miniGameRankings){
            MiniGameRankingDto miniGameRankingDto = MiniGameRankingDto.builder()
                    .rank((idx++) + 1)
                    .nickname(miniGameRanking.getNickname())
                    .stage(miniGameRanking.getStage())
                    .score(miniGameRanking.getScore())
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
