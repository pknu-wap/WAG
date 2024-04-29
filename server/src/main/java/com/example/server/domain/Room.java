package com.example.server.domain;

import jakarta.persistence.*;
import jakarta.validation.constraints.NotNull;
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

    private int cycle;
    private int currentOrder;
    private int correctMemberCnt;

    @OneToMany(mappedBy = "room", cascade = CascadeType.ALL, fetch = FetchType.LAZY)
    private List<RoomUser> roomUsers;

    @OneToMany(mappedBy = "room", cascade = CascadeType.ALL, fetch = FetchType.LAZY)
    private List<GameOrder> gameOrders;


}
