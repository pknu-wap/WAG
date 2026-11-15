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
    private boolean isMyTurn;
    private boolean isNextTurn;
    private boolean haveAnswerChance;
    private int ranking;
    /** END 메시지에서만 채워짐 (결과 화면용) */
    private String answername;
    /** 서로 이름 지어주기 단계에서 이 사람이 제시어를 정해 줄 상대 닉네임 */
    private String namingTarget;

    public static GameUserDto of(GameOrder gameOrder, RoomUser roomUser){
        return new GameUserDto(
                roomUser.isCaptain(),
                roomUser.getRoomNickname(),
                roomUser.getProfileImage(),
                gameOrder.getPenalty(),
                gameOrder.isNowTurn(),
                gameOrder.isNextTurn(),
                gameOrder.isHaveAnswerChance(),
                gameOrder.getRanking(),
                null,
                gameOrder.getNamingTarget()
        );
    }

}
