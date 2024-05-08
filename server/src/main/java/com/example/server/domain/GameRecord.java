package com.example.server.domain;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;

import java.util.List;

@Entity
@Getter
@Setter
@Table(name = "gameRecord")
public class GameRecord {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToMany
    @JoinTable(name = "user_game_record",
            joinColumns = @JoinColumn(name = "game_record_id"),
            inverseJoinColumns = @JoinColumn(name = "user_id"))
    private List<User> userRanking;

    @Column(unique = true)
    private Long roomId;

}
