package com.careercompass.repository;

import com.careercompass.model.CareerRecommendation;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface CareerRecommendationRepository extends MongoRepository<CareerRecommendation, String> {
    List<CareerRecommendation> findByUserIdOrderByCreatedAtDesc(String userId);
}
