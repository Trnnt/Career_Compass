package com.careercompass.model;

import org.springframework.data.annotation.Id;
import org.springframework.data.annotation.Transient;
import org.springframework.data.mongodb.core.mapping.Document;
import lombok.*;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;

@Document(collection = "test_attempts")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class TestAttempt {
    @Id
    private String id;

    private String userId; // Reference to User.id

    // For fast retrieval of user data without joining
    @Transient
    private User user;

    private int correct;
    private int total;
    private double percent;
    private String type;
    private String weekKey;

    private String domainScoresJson;

    // Tracks the specific IDs of questions seen in this attempt
    private List<String> seenQuestionIds;

    // Stores the 1-5 Likert values submitted for a RIASEC attempt.
    private List<Integer> answerValues;

    private Map<String, Integer> traitCorrect;

    private LocalDateTime createdAt;

    public User getUser() {
        return user;
    }

    public void setUser(User user) {
        this.user = user;
        if (user != null)
            this.userId = user.getId();
    }
}
