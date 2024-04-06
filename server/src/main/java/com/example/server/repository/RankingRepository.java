package com.example.server.repository;

import com.example.server.domain.Ranking;
import com.example.server.domain.User;
import com.example.server.dto.UserRankingDto;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface RankingRepository extends JpaRepository<Ranking, Long> {

    @Query(value = "SELECT u.name, u.imageUrl, r.score " +
            "FROM User u " +
            "JOIN Ranking r ON u.id = r.user_id", nativeQuery = true)
    Page<UserRankingDto> findUserRanking(Pageable pageable);

    Optional<Ranking> findByUser(User user);

}
