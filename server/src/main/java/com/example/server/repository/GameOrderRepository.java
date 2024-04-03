package com.example.server.repository;

import com.example.server.domain.GameOrder;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface GameOrderRepository extends JpaRepository<GameOrder, Long> {
    @Query("SELECT go FROM GameOrder go WHERE go.roomUser.id = :userid ")
    Optional<GameOrder> findGameOrderByUserId(@Param("userid") long userid);
}
