package com.example.server.repository;

import com.example.server.domain.Room;
import com.example.server.dto.UserDto;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface RoomRepository extends JpaRepository<Room, Long> {
    @Query("SELECT r FROM Room r WHERE r.roomEnterCode = :enterCode ")
    int findByCode(@Param("enterCode") int enterCode);
    @Query("SELECT r FROM Room r JOIN r.roomUsers ru WHERE ru.roomNickname = :nickName ")
    Room findByNickName(@Param("nickName") String nickName);

}
