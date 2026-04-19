package com.careercompass.service;

import com.careercompass.dto.AuthResponse;
import com.careercompass.dto.LoginRequest;
import com.careercompass.dto.RegisterRequest;
import com.careercompass.model.Role;
import com.careercompass.model.User;
import com.careercompass.repository.UserRepository;
import com.careercompass.security.JwtUtil;
import lombok.RequiredArgsConstructor;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class AuthService {

        private final UserRepository userRepository;
        private final PasswordEncoder passwordEncoder;
        private final JwtUtil jwtUtil;
        private final AuthenticationManager authenticationManager;

        public AuthResponse register(RegisterRequest request) {
                if (userRepository.findByEmail(request.getEmail()).isPresent()) {
                        throw new RuntimeException("Email already taken");
                }

                var user = User.builder()
                                .name(request.getName())
                                .email(request.getEmail())
                                .password(passwordEncoder.encode(request.getPassword()))
                                .role(request.getRole() != null ? request.getRole() : Role.STUDENT)
                                .grade(request.getGrade())
                                .stream(request.getStream())
                                .interest(request.getInterest())
                                .city(request.getCity())
                                .mobile(request.getMobile())
                                .createdAt(java.time.LocalDateTime.now())
                                .build();

                userRepository.save(user);

                var jwtToken = jwtUtil.generateToken(user);

                return AuthResponse.builder()
                                .token(jwtToken)
                                .role(user.getRole())
                                .name(user.getName())
                                .email(user.getEmail())
                                .build();
        }

        public AuthResponse login(LoginRequest request) {
                authenticationManager.authenticate(
                                new UsernamePasswordAuthenticationToken(
                                                request.getEmail(),
                                                request.getPassword()));

                var user = userRepository.findByEmail(request.getEmail())
                                .orElseThrow(() -> new RuntimeException("User not found"));

                var jwtToken = jwtUtil.generateToken(user);

                return AuthResponse.builder()
                                .token(jwtToken)
                                .role(user.getRole())
                                .name(user.getName())
                                .email(user.getEmail())
                                .build();
        }
}
