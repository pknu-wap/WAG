package com.example.server.repository;

import com.example.server.domain.Room;
import com.example.server.dto.UserDto;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface RoomRepository extends JpaRepository<Room, Long> {
    @Query("SELECT r FROM Room r WHERE r.roomEnterCode = :enterCode ")
    Optional<Integer> findByCode(@Param("enterCode") int enterCode);
    @Query("SELECT r FROM Room r WHERE r.roomEnterCode = :enterCode ")
    Optional<Room> findRoomByCode(@Param("enterCode") int enterCode);
    @Query("SELECT r FROM Room r WHERE r.gameStatus = false AND r.isPrivateRoom = false order by RAND() limit 1")
    Optional<Room> findByRandom();
}
