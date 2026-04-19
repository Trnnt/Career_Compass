package com.careercompass.dto;

import com.careercompass.model.Role;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class RegisterRequest {
    private String name;
    private String email;
    private String password;
    private Role role;
    private String grade;
    private String stream;
    private String interest;
    private String city;
    private String mobile;
}
