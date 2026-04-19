package com.careercompass.service;

import com.careercompass.model.RaisecQuestion;
import com.careercompass.repository.TestAttemptRepository;
import org.junit.jupiter.api.Test;

import java.lang.reflect.Proxy;
import java.util.List;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertTrue;

class RaisecServiceTests {

    @Test
    void generateTestBuildsThirtyAcademicAndTenInterestQuestions() {
        RaisecService service = new RaisecService(repositoryStub());

        List<RaisecQuestion> questions = service.generateTest(null, null, "12", "PCM", "tech");

        assertEquals(40, questions.size());
        assertEquals(30L, questions.stream().filter(q -> "academic".equals(q.getSegment())).count());
        assertEquals(10L, questions.stream().filter(q -> "interest".equals(q.getSegment())).count());
        assertEquals(40L, questions.stream().map(RaisecQuestion::getId).distinct().count());
        assertTrue(questions.stream().allMatch(q -> "12".equals(q.getGrade())));
        assertTrue(questions.stream().allMatch(q -> "SCIENCE_TECH".equals(q.getStream())));
        assertTrue(questions.stream().allMatch(q -> "TECH".equals(q.getInterest())));
    }

    private TestAttemptRepository repositoryStub() {
        return (TestAttemptRepository) Proxy.newProxyInstance(
                TestAttemptRepository.class.getClassLoader(),
                new Class<?>[] { TestAttemptRepository.class },
                (proxy, method, args) -> {
                    String methodName = method.getName();
                    if ("save".equals(methodName) && args != null && args.length == 1) {
                        return args[0];
                    }

                    Class<?> returnType = method.getReturnType();
                    if (List.class.isAssignableFrom(returnType)) {
                        return List.of();
                    }
                    if (returnType == boolean.class) {
                        return false;
                    }
                    if (returnType == int.class) {
                        return 0;
                    }
                    if (returnType == long.class) {
                        return 0L;
                    }
                    return null;
                });
    }
}
