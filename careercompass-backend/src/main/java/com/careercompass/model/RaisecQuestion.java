package com.careercompass.model;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class RaisecQuestion {
    private String id;
    private String prompt;
    private List<String> options;
    private int answerIndex;
    private String raisecLetter;
    private String difficulty;
    private String stream;
    private String grade;
    private String interest;
    private String domain;
    private String trait;
    private String segment;
}
