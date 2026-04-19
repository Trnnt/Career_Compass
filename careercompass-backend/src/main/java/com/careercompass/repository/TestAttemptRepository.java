package com.careercompass.repository;

import com.careercompass.model.TestAttempt;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface TestAttemptRepository extends MongoRepository<TestAttempt, String> {
    List<TestAttempt> findByUserIdOrderByCreatedAtDesc(String userId);
}
