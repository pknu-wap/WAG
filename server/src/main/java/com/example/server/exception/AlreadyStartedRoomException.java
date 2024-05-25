package com.example.server.exception;

public class AlreadyStartedRoomException extends RuntimeException{
    public AlreadyStartedRoomException(){
        super("이미 게임이 시작된 방입니다!");
    }
}
