package com.example.server.dto;

import com.example.server.domain.GameOrder;
import com.example.server.domain.RoomUser;
import jakarta.validation.constraints.Max;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
@AllArgsConstructor
public class GameUserDto {
    private boolean isCaptain;
    private String roomNickname;
    private String profileImage;
    @Max(3)
    private int penalty;
    private String answerName;
    private boolean isMyTurn;
    private boolean isNextTurn;
    private boolean haveAnswerChance;
    private int ranking;

    public static GameUserDto of(GameOrder gameOrder, RoomUser roomUser){
        return new GameUserDto(
                roomUser.isCaptain(),
                roomUser.getRoomNickname(),
                roomUser.getProfileImage(),
                gameOrder.getPenalty(),
                gameOrder.getAnswerName(),
                gameOrder.isNowTurn(),
                gameOrder.isNextTurn(),
                gameOrder.isHaveAnswerChance(),
                gameOrder.getRanking()
        );
    }

}
