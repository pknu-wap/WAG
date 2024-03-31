package com.example.server.dto;

import com.example.server.domain.RoomUser;
import jakarta.validation.constraints.Max;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.Setter;

import java.util.ArrayList;
import java.util.List;

@AllArgsConstructor
@Getter @Setter
public class UserDto {
    private boolean isCaptain;
    private String roomNickname;
    private String profileImage;
}
