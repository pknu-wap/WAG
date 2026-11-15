package com.example.server.domain;

import jakarta.persistence.*;
import jakarta.validation.constraints.NotNull;
import java.time.LocalDateTime;
import lombok.Getter;
import lombok.Setter;

import java.util.List;

@Entity
@Getter @Setter
@Table(name = "room")
public class Room {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    @NotNull
    private boolean isPrivateRoom;
    @NotNull
    private boolean gameStatus;
    @NotNull
    private int roomEnterCode;
    @NotNull
    private int userCount;
    @NotNull
    private String category;
    @NotNull
    private int timer;

    /** 서로 이름 지어주기 모드: 시작 시 DB 제시어 대신 참가자들이 서로의 제시어를 정한다 */
    @Column(columnDefinition = "boolean default false")   // ddl-auto=update 로 컬럼이 추가될 때 기존 방 행이 null 이 되지 않도록
    private boolean customMode;

    private Long nowTurnUserId;

    private int cycle;
    private int currentOrder;
    private int correctMemberCnt;
    private int leftCorrectMember;

    @OneToMany(mappedBy = "room", cascade = CascadeType.ALL, fetch = FetchType.LAZY)
    private List<RoomUser> roomUsers;

    @OneToMany(mappedBy = "room", cascade = CascadeType.ALL, fetch = FetchType.LAZY)
    private List<GameOrder> gameOrders;

    @NotNull
    private LocalDateTime lastStartedTime;
}
