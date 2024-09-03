package com.example.server.controller;

import com.example.server.payload.request.MiniGameRankingRequest;
import com.example.server.payload.response.MiniGameRankingResponse;
import com.example.server.service.MiniGameService;
import lombok.AllArgsConstructor;
import org.springframework.web.bind.annotation.*;

@AllArgsConstructor
@RestController("/mini")
public class MiniGameController {
    private final MiniGameService miniGameService;
    @PostMapping("/ranking")
    public String postRanking(@RequestBody MiniGameRankingRequest miniGameRankingRequest) {
        return miniGameService.postRanking(miniGameRankingRequest);
    }

    @GetMapping("/ranking/list")
    public MiniGameRankingResponse getRankings(@RequestParam Integer pageNumber, @RequestParam Integer pageSize) {
        return miniGameService.getRanking(pageNumber, pageSize);
    }
}
