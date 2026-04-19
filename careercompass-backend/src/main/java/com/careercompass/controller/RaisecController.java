package com.careercompass.controller;

import com.careercompass.dto.RaisecSubmissionRequest;
import com.careercompass.model.RaisecQuestion;
import com.careercompass.model.TestAttempt;
import com.careercompass.model.User;
import com.careercompass.repository.UserRepository;
import com.careercompass.service.RaisecService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/raisec")
@RequiredArgsConstructor
public class RaisecController {

    private final RaisecService raisecService;
    private final UserRepository userRepository;

    @GetMapping("/test")
    public ResponseEntity<List<RaisecQuestion>> getRaisecTest(
            @RequestParam(required = false, defaultValue = "MEDIUM") String difficulty,
            @RequestParam(required = false, defaultValue = "") String grade,
            @RequestParam(required = false, defaultValue = "") String stream,
            @RequestParam(required = false, defaultValue = "") String interest,
            Authentication authentication) {
        if (authentication == null || !authentication.isAuthenticated()) {
            return ResponseEntity.ok(raisecService.generateTest(null, difficulty, grade, stream, interest));
        }

        String email = authentication.getName();
        return userRepository.findByEmail(email)
                .map(user -> ResponseEntity.ok(raisecService.generateTest(user, difficulty, grade, stream, interest)))
                .orElseGet(() -> ResponseEntity.ok(raisecService.generateTest(null, difficulty, grade, stream, interest)));
    }

    @PostMapping("/submit")
    public ResponseEntity<?> submitRaisecTest(
            Authentication authentication,
            @RequestBody RaisecSubmissionRequest request) {
        User user = null;
        if (authentication != null && authentication.isAuthenticated()) {
            String email = authentication.getName();
            user = userRepository.findByEmail(email).orElse(null);
        }

        try {
            return ResponseEntity.ok(raisecService.submitTest(user, request));
        } catch (IllegalArgumentException ex) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(ex.getMessage());
        }
    }
}
