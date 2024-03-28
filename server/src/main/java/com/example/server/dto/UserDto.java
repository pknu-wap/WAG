package com.example.server.dto;

import jakarta.validation.constraints.Max;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.Setter;

@AllArgsConstructor
@Getter @Setter
public class UserDto {
    private boolean isCaptain;
    private String roomNickname;
    private String profileImage;
}
