package com.careercompass.model;

import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;
import org.springframework.data.mongodb.core.index.Indexed;
import lombok.*;
import java.util.List;

@Document(collection = "users")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class User {
    @Id
    private String id;

    private String name;

    @Indexed(unique = true)
    private String email;

    @com.fasterxml.jackson.annotation.JsonIgnore
    private String password;

    private Role role;

    private String grade;
    private String stream;
    private String interest;
    private String city;
    private String mobile;

    private java.time.LocalDateTime createdAt;

    // In MongoDB we can store references or embed. Since attempts can grow
    // infinitely,
    // it's better to query them via TestAttemptRepository rather than embedding all
    // of them.
}
