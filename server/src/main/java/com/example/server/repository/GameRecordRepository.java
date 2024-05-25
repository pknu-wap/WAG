package com.example.server.repository;

import com.example.server.domain.GameRecord;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface GameRecordRepository extends JpaRepository<GameRecord, Long> {

}
