package com.example.server.dto.gptDto;

import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.io.Serializable;
import java.util.List;

@Getter
@Setter
@NoArgsConstructor
public class Choice implements Serializable {

    private List<GptMessage> message;
}