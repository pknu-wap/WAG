package com.example.server.exception;

import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.ResponseStatus;

@ResponseStatus(HttpStatus.NOT_FOUND)
public class NoSuchGameRecordException extends RuntimeException{

    public NoSuchGameRecordException(Long roomId) {
        super("no such game record, roomId : " + roomId);
    }
}
