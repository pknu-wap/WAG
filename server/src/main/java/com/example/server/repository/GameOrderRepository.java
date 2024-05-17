package com.example.server.repository;

import com.example.server.domain.GameOrder;
import com.example.server.domain.RoomUser;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface GameOrderRepository extends JpaRepository<GameOrder, Long> {
    @Query("SELECT go FROM GameOrder go WHERE go.roomUser.id = :userid ")
    Optional<GameOrder> findGameOrderByUserId(@Param("userid") long userid);

    @Query("SELECT go.answerName FROM GameOrder go WHERE go.roomUser.id = :userid ")
    String findAnswerByUserId(@Param("userid") long userid);

    @Query("DELETE FROM GameOrder go WHERE go.room.id = :roomid ")
    Void deleteGameOrderByRoomId(@Param("roomid") long roomid);

    @Query("SELECT go FROM GameOrder go WHERE go.userOrder = :userorder ")
    Optional<GameOrder> findByUserOrder(@Param("userorder") long userorder);

    @Query("SELECT go FROM GameOrder go WHERE go.room.id = :roomid")
    List<GameOrder> findAnswerNotMe(@Param("roomid") Long roomid);

    @Query("SELECT go FROM GameOrder go WHERE go.roomUser.roomNickname = :nickName ")
    Optional<GameOrder> findByNickName(@Param("nickName") String nickName);

}
