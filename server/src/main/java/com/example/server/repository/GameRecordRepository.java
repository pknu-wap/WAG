package com.example.server.repository;

import com.example.server.domain.GameRecord;
import jakarta.persistence.Column;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.Optional;

public interface GameRecordRepository extends JpaRepository<GameRecord, Long> {

    Optional<GameRecord> findByRoomId(Long roomId);

}
