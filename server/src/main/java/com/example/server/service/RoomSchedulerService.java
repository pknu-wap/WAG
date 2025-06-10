package com.example.server.service;

import com.example.server.domain.Room;
import com.example.server.repository.RoomRepository;
import jakarta.transaction.Transactional;
import java.time.LocalDateTime;
import java.util.List;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;

@Service
public class RoomSchedulerService {
    private RoomRepository roomRepository;

    @Value("${scheduler.room.lifetime.minutes}")
    private long roomLifetimeMinutes; // 'long' 타입으로 주입받음

    RoomSchedulerService(RoomRepository roomRepository){
        this.roomRepository = roomRepository;
    }

    @Transactional
    @Scheduled(cron = "${scheduler.room.check-ghost.cron}")
    public void checkGhostRoom(){
        List<Room> roomsToDelete = roomRepository.findBylastStartedTimeBefore(LocalDateTime.now().minusHours(roomLifetimeMinutes));
        roomRepository.deleteAll(roomsToDelete);
    }
}
