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
    @OneToOne(fetch = FetchType.LAZY, cascade = CascadeType.ALL, orphanRemoval = true)
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

}
