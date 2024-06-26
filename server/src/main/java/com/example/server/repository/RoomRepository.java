package com.example.server.repository;

import com.example.server.domain.Room;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import org.springframework.transaction.annotation.Transactional;

import java.util.Optional;

@Repository
@Transactional
public interface RoomRepository extends JpaRepository<Room, Long> {

    @Query("SELECT r FROM Room r WHERE r.roomEnterCode = :enterCode ")
    Optional<Integer> findByCode(@Param("enterCode") int enterCode);

    @Query("SELECT r FROM Room r WHERE r.roomEnterCode = :enterCode ")
    Optional<Room> findRoomByCode(@Param("enterCode") int enterCode);

    @Query("SELECT r FROM Room r WHERE r.id=:roomId")
    Optional<Room> findByRoomId(Long roomId);

//    @Query(value = "SELECT r.id FROM Room r WHERE r.gameStatus = false AND r.isPrivateRoom = false AND r.userCount <= 5 ORDER BY RAND() LIMIT 1")
//    Optional<Long> findRandomRoomId();
//    @Query(value = "SELECT r.id FROM Room r WHERE r.gameStatus = false AND r.isPrivateRoom = false AND r.userCount = (SELECT MAX(r2.userCount) FROM Room r2 WHERE r2.gameStatus = false AND r2.isPrivateRoom = false AND r2.userCount <= 5) ORDER BY RAND() LIMIT 1")
//    Optional<Long> findRandomRoomId();
}
