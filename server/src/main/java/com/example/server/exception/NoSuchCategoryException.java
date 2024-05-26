package com.example.server.exception;

import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.ResponseStatus;

@ResponseStatus(HttpStatus.NOT_FOUND)
public class NoSuchCategoryException extends RuntimeException{
    public NoSuchCategoryException(String category) {
        super("no such category : " + category);
    }
}
