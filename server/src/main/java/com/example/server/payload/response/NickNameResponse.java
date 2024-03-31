package com.example.server.payload.response;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
@AllArgsConstructor
public class NickNameResponse {
    private boolean isPossible;
    private String nickName;

}
