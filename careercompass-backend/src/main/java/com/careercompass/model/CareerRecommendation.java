package com.careercompass.model;

import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;
import lombok.*;
import java.time.LocalDateTime;

@Document(collection = "career_recommendations")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class CareerRecommendation {
    @Id
    private String id;

    private String userId; // Reference to User.id

    private String recommendedCareer;
    private String reason;
    private double confidenceScore;

    private LocalDateTime createdAt;
}
