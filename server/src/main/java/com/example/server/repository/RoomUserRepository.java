package com.example.server.repository;

import com.example.server.domain.Room;
import com.example.server.domain.RoomUser;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface RoomUserRepository extends JpaRepository<RoomUser, Long> {
    @Query("SELECT ru FROM RoomUser ru WHERE ru.roomNickname = :nickName ")
    List<RoomUser> findByNickName(@Param("nickName") String nickName);
    @Query("SELECT ru.room FROM RoomUser ru WHERE ru.roomNickname = :nickName ")
    Room findRoomIdByNickName(@Param("nickName") String nickName);
    @Query("SELECT ru FROM RoomUser ru JOIN ru.room r WHERE r.id = :roomid ")
    List<RoomUser> findByRoomId(@Param("roomid") Long roomid);
    @Query("SELECT ru FROM RoomUser ru JOIN ru.room r WHERE r.id = :roomid order by RAND()")
    List<RoomUser> findRandomByRoomId(@Param("roomid") Long roomid);
    @Query("SELECT ru FROM RoomUser ru WHERE ru.roomNickname = :nickName ")
    Optional<RoomUser> hasNickName(@Param("nickName") String nickName);

    @Query("SELECT ru FROM RoomUser ru WHERE ru.roomNickname = :nickName AND ru.room.id =:roomId")
    Optional<RoomUser> hasRoomNickName(@Param("nickName") String nickName , @Param("roomId") Long roomId);
    @Query("SELECT ru FROM RoomUser ru WHERE ru.room.id = :roomid AND ru.isCaptain = false order by RAND() limit 1")
    Optional<RoomUser> findNextCaptinByRandom(@Param("roomid") Long roomid);
}
