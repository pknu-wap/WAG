package com.example.server.exception;

import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.ResponseStatus;

@ResponseStatus(HttpStatus.NOT_FOUND)
public class NoSuchGameOrderException extends RuntimeException{

    public NoSuchGameOrderException() {
        super("no such game order");
    }
}
