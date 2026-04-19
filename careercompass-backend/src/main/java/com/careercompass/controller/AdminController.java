package com.careercompass.controller;

import com.careercompass.model.TestAttempt;
import com.careercompass.model.User;
import com.careercompass.repository.TestAttemptRepository;
import com.careercompass.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/admin")
@RequiredArgsConstructor
public class AdminController {

    private final UserRepository userRepository;
    private final TestAttemptRepository testAttemptRepository;

    @GetMapping("/users")
    public ResponseEntity<List<User>> getAllUsers() {
        return ResponseEntity.ok(userRepository.findAll());
    }

    @GetMapping("/attempts")
    public ResponseEntity<List<TestAttempt>> getAllAttempts() {
        return ResponseEntity.ok(testAttemptRepository.findAll());
    }
}
