package com.example.server.domain;

import jakarta.persistence.*;
import jakarta.validation.constraints.NotNull;
import lombok.Getter;
import lombok.Setter;

@Entity
@Getter @Setter
@Table(name = "gameOrder")
public class GameOrder {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    private Room room;
    @OneToOne(fetch = FetchType.LAZY)
    private RoomUser roomUser;

    @NotNull
    private int userOrder;
    @NotNull
    private boolean nowTurn;
    @NotNull
    private boolean nextTurn;
    @NotNull
    private boolean haveAnswerChance;
    @NotNull
    private String answerName;
    @NotNull
    private int penalty;
    @NotNull
    private int ranking;

    /** 서로 이름 지어주기 모드에서 이 사람이 제시어를 정해 줘야 하는 상대 닉네임 */
    private String namingTarget;

}
