package com.example.server.repository;

import com.example.server.domain.MiniGameRanking;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface MiniGameRepository extends JpaRepository<MiniGameRanking, Long> {
    Optional<MiniGameRanking> findByNickname(String nickname);
}
