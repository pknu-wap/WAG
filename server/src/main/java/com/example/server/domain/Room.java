package com.example.server.domain;

import jakarta.persistence.*;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.Setter;

import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

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

    @OneToMany(mappedBy = "room", cascade = CascadeType.ALL, fetch = FetchType.LAZY)
    private List<RoomUser> roomUsers;

//    public static Room create(RoomCreateRequest roomCreateRequest){
//        return new Room(
//                roomCreateRequest.
//        );
//    }
}
