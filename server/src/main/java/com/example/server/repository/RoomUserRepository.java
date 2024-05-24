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
    @Query("SELECT ru FROM RoomUser ru JOIN ru.room r WHERE r.id = :roomId ")
    List<RoomUser> findByRoomId(@Param("roomId") Long roomId);
//    @Query("SELECT ru FROM RoomUser ru JOIN ru.room r WHERE r.id = :roomId AND ru.gameOrder.ranking > 0 ORDER BY ru.gameOrder.ranking ASC")
//    List<RoomUser> findByRoomIdOrderByRanking(@Param("roomId") Long roomId);
//    @Query("SELECT ru FROM RoomUser ru JOIN ru.room r WHERE ru.room.id = :roomId AND ru.gameOrder.ranking = 0 ")
//    List<RoomUser> findByZeroOrderByRanking(@Param("roomId") Long roomId);

    @Query("SELECT ru FROM RoomUser ru JOIN ru.room r WHERE r.id = :roomId order by RAND()")
    List<RoomUser> findRandomByRoomId(@Param("roomId") Long roomId);
    @Query("SELECT ru FROM RoomUser ru WHERE ru.roomNickname = :nickName and ru.room.id = :roomId")
    Optional<RoomUser> hasNickName(@Param("nickName") String nickName, @Param("roomId") long roomId);

    @Query("SELECT ru FROM RoomUser ru WHERE ru.roomNickname = :nickName AND ru.room.id =:roomId")
    Optional<RoomUser> hasRoomNickName(@Param("nickName") String nickName , @Param("roomId") Long roomId);
    @Query("SELECT ru FROM RoomUser ru WHERE ru.room.id = :roomId AND ru.isCaptain = false order by RAND() limit 1")
    Optional<RoomUser> findNextCaptinByRandom(@Param("roomId") Long roomId);

    @Query("SELECT ru.roomNickname FROM RoomUser ru WHERE ru.room.id = :roomId")
    List<String> findNickNameByRoomId(@Param("roomId") Long roomId);
}
