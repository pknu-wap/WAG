package com.example.server.exception;

import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.ResponseStatus;

@ResponseStatus(HttpStatus.NOT_FOUND)
public class NoSuchRoomException extends RuntimeException{

    public NoSuchRoomException(Long roomId) {
        super("no such room, roomId : " + roomId);

    }
}
