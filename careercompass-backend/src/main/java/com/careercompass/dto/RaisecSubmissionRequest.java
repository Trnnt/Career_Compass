package com.careercompass.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class RaisecSubmissionRequest {
    private List<String> questionIds;
    private List<Integer> answers;
}
