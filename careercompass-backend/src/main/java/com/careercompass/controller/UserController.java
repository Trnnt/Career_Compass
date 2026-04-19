package com.careercompass.controller;

import com.careercompass.model.User;
import com.careercompass.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/users")
@RequiredArgsConstructor
public class UserController {

    private final UserRepository userRepository;

    @GetMapping("/me")
    public ResponseEntity<User> getMe(Authentication authentication) {
        String email = authentication.getName();
        return userRepository.findByEmail(email)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @PutMapping("/me")
    public ResponseEntity<User> updateMe(Authentication authentication, @RequestBody User updateData) {
        String email = authentication.getName();
        return userRepository.findByEmail(email)
                .map(user -> {
                    if (updateData.getName() != null)
                        user.setName(updateData.getName());
                    if (updateData.getGrade() != null)
                        user.setGrade(updateData.getGrade());
                    if (updateData.getStream() != null)
                        user.setStream(updateData.getStream());
                    if (updateData.getInterest() != null)
                        user.setInterest(updateData.getInterest());
                    if (updateData.getCity() != null)
                        user.setCity(updateData.getCity());
                    if (updateData.getMobile() != null)
                        user.setMobile(updateData.getMobile());
                    return ResponseEntity.ok(userRepository.save(user));
                })
                .orElse(ResponseEntity.notFound().build());
    }
}
