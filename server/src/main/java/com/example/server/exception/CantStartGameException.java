package com.example.server.exception;

import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.ResponseStatus;

@ResponseStatus(HttpStatus.INTERNAL_SERVER_ERROR)
public class CantStartGameException extends RuntimeException{
    public CantStartGameException(){
        super("아직 레디하지 않은 유저가 있습니다!");
    }
}
