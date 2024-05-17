package com.example.server.exception;

public class MaxPenaltyExceededException  extends RuntimeException{
    public MaxPenaltyExceededException(){
        super("최대 경고 횟수 초과!");
    }
}
