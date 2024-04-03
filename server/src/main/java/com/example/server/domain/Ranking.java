package com.example.server.domain;

import jakarta.persistence.*;
import lombok.Getter;

@Entity
@Table(name = "ranking")
@Getter
public class Ranking {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @OneToOne
    @JoinColumn(name = "user_id", referencedColumnName = "id")
    private User user;

    @Column(name = "score")
    private Integer score = 0;

}
