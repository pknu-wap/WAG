package com.example.server.exception;


public class MaxUserCountExceededException extends RuntimeException {
    public MaxUserCountExceededException() {
        super("방 최대 인원 초과: 6명");
    }
}