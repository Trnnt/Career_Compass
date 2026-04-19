package com.careercompass.controller;

import com.careercompass.model.TestAttempt;
import com.careercompass.model.User;
import com.careercompass.repository.TestAttemptRepository;
import com.careercompass.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/teacher")
@RequiredArgsConstructor
public class TeacherController {

    private final UserRepository userRepository;
    private final TestAttemptRepository testAttemptRepository;

    @GetMapping("/students")
    public ResponseEntity<List<User>> getMyStudents() {
        // In a real app we would filter by teacher's assigned class/school.
        // For now, we return all users who are not admins/teachers.
        List<User> students = userRepository.findAll()
                .stream()
                .filter(u -> "student".equalsIgnoreCase(String.valueOf(u.getRole())))
                .collect(Collectors.toList());
        return ResponseEntity.ok(students);
    }

    @GetMapping("/attempts")
    public ResponseEntity<List<TestAttempt>> getStudentAttempts() {
        // In a real app we'd filter attempts for this teacher's students.
        List<TestAttempt> studentAttempts = testAttemptRepository.findAll()
                .stream()
                .filter(a -> a.getUser() != null && "student".equalsIgnoreCase(String.valueOf(a.getUser().getRole())))
                .collect(Collectors.toList());
        return ResponseEntity.ok(studentAttempts);
    }
}
