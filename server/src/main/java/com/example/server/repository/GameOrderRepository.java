package com.example.server.repository;

import com.example.server.domain.GameOrder;
import com.example.server.domain.Room;
import com.example.server.domain.RoomUser;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface GameOrderRepository extends JpaRepository<GameOrder, Long> {
    @Query("SELECT go FROM GameOrder go WHERE go.roomUser.id = :userId ")
    Optional<GameOrder> findGameOrderByUserId(@Param("userId") long userId);

    @Query("SELECT go.answerName FROM GameOrder go WHERE go.roomUser.id = :userId ")
    String findAnswerByUserId(@Param("userId") long userId);

    void deleteAllByRoom(Room room);

    @Query("SELECT go FROM GameOrder go WHERE go.userOrder = :userOrder and go.room.id = :roomId")
    Optional<GameOrder> findByUserOrder(@Param("userOrder") long userOrder, @Param("roomId") long roomId);

    @Query("SELECT go FROM GameOrder go WHERE go.room.id = :roomId")
    List<GameOrder> findAnswerNotMe(@Param("roomId") Long roomId);

    @Query("SELECT go FROM GameOrder go WHERE go.roomUser.roomNickname = :nickName and go.room.id = :roomId")
    Optional<GameOrder> findByNickName(@Param("nickName") String nickName, @Param("roomId") Long roomId);

    @Query("SELECT go FROM GameOrder go WHERE go.room.id = :roomId and go.userOrder BETWEEN :start AND :end")
    List<GameOrder> findBackUser(@Param("roomId") Long roomId, @Param("start") int start, @Param("end") int end);
}
