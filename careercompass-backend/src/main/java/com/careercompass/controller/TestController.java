package com.careercompass.controller;

import com.careercompass.model.TestAttempt;
import com.careercompass.repository.TestAttemptRepository;
import com.careercompass.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/tests")
@RequiredArgsConstructor
public class TestController {

    private final TestAttemptRepository testAttemptRepository;
    private final UserRepository userRepository;

    @GetMapping("/attempts")
    public ResponseEntity<List<TestAttempt>> getAttempts(Authentication authentication) {
        String email = authentication.getName();
        return userRepository.findByEmail(email)
                .map(user -> ResponseEntity.ok(testAttemptRepository.findByUserIdOrderByCreatedAtDesc(user.getId())))
                .orElse(ResponseEntity.notFound().build());
    }

    @PostMapping("/attempts")
    public ResponseEntity<TestAttempt> saveAttempt(Authentication authentication, @RequestBody TestAttempt attempt) {
        String email = authentication.getName();
        return userRepository.findByEmail(email)
                .map(user -> {
                    attempt.setUser(user);
                    attempt.setCreatedAt(java.time.LocalDateTime.now());
                    return ResponseEntity.ok(testAttemptRepository.save(attempt));
                })
                .orElse(ResponseEntity.notFound().build());
    }
}
