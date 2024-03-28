package com.example.server.repository;
import com.example.server.domain.RoomUser;
import com.example.server.dto.UserDto;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface RoomUserRepository extends JpaRepository<RoomUser, Long> {
    @Query("SELECT ru FROM RoomUser ru WHERE ru.roomNickname = :nickName ")
    List<UserDto> findByNickName(@Param("nickName") String nickName);
}
