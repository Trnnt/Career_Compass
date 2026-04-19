package com.careercompass.service;

import com.careercompass.dto.RaisecSubmissionRequest;
import com.careercompass.model.RaisecQuestion;
import com.careercompass.model.TestAttempt;
import com.careercompass.model.User;
import com.careercompass.repository.TestAttemptRepository;
import lombok.RequiredArgsConstructor;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.Collections;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.concurrent.ThreadLocalRandom;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class RaisecService {

    private static final Logger log = LoggerFactory.getLogger(RaisecService.class);

    private static final int GRADE_QUESTION_COUNT = 15;
    private static final int STREAM_QUESTION_COUNT = 15;
    private static final int INTEREST_QUESTION_COUNT = 10;
    private static final int TOTAL_QUESTION_COUNT = GRADE_QUESTION_COUNT + STREAM_QUESTION_COUNT + INTEREST_QUESTION_COUNT;

    private final TestAttemptRepository attemptRepository;

    private final List<QTemplate> bank = buildBank();
    private final Map<String, QTemplate> bankById = bank.stream()
            .collect(Collectors.toMap(QTemplate::id, q -> q, (left, right) -> left, LinkedHashMap::new));

    public List<RaisecQuestion> generateTest(
            User user,
            String requestedDifficulty,
            String requestedGrade,
            String requestedStream,
            String requestedInterest) {
        String grade = normalizeGrade(requestedGrade, user);
        String streamBucket = normalizeStreamBucket(requestedStream, grade, user);
        String interestBucket = normalizeInterest(requestedInterest, user);
        String difficulty = normalizeDifficulty(requestedDifficulty);

        List<QTemplate> selected = new ArrayList<>(TOTAL_QUESTION_COUNT);
        selected.addAll(pickQuestions(gradePool(grade), GRADE_QUESTION_COUNT, "grade " + grade));
        selected.addAll(pickQuestions(streamPool(streamBucket), STREAM_QUESTION_COUNT, "stream " + streamBucket));
        selected.addAll(pickQuestions(interestPool(interestBucket), INTEREST_QUESTION_COUNT, "interest " + interestBucket));
        Collections.shuffle(selected, ThreadLocalRandom.current());

        return selected.stream()
                .map(q -> RaisecQuestion.builder()
                        .id(q.id())
                        .prompt(q.prompt())
                        .options(q.options())
                        .answerIndex(-1)
                        .raisecLetter(null)
                        .difficulty(difficulty)
                        .stream(streamBucket)
                        .grade(grade)
                        .interest(interestBucket)
                        .domain(q.domain())
                        .trait(q.trait())
                        .segment("ANY".equals(q.interestBucket()) ? "academic" : "interest")
                        .build())
                .toList();
    }

    public TestAttempt submitTest(User user, RaisecSubmissionRequest request) {
        List<String> questionIds = request.getQuestionIds() == null ? List.of() : request.getQuestionIds();
        List<Integer> answers = request.getAnswers() == null ? List.of() : request.getAnswers();
        if (questionIds.size() != TOTAL_QUESTION_COUNT || answers.size() != TOTAL_QUESTION_COUNT
                || questionIds.size() != answers.size()) {
            throw new IllegalArgumentException("This assessment requires exactly 40 answers.");
        }

        Map<String, Integer> domainTotals = new LinkedHashMap<>();
        Map<String, Integer> domainCorrect = new LinkedHashMap<>();
        Map<String, Integer> traitCorrect = new LinkedHashMap<>();

        int correct = 0;
        for (int i = 0; i < questionIds.size(); i++) {
            String questionId = String.valueOf(questionIds.get(i)).trim();
            QTemplate template = bankById.get(questionId);
            if (template == null) {
                throw new IllegalArgumentException("Unknown assessment question id: " + questionId);
            }

            int answer = answers.get(i) == null ? -1 : answers.get(i);
            if (answer < 0 || answer >= template.options().size()) {
                throw new IllegalArgumentException("Each answer must match one of the available options.");
            }

            domainTotals.merge(template.domain(), 1, Integer::sum);
            if (answer == template.answerIndex()) {
                correct += 1;
                domainCorrect.merge(template.domain(), 1, Integer::sum);
                traitCorrect.merge(template.trait(), 1, Integer::sum);
            }
        }

        Map<String, Integer> domainScores = new LinkedHashMap<>();
        domainTotals.forEach((domain, total) -> {
            int hits = domainCorrect.getOrDefault(domain, 0);
            domainScores.put(domain, Math.round((hits * 100f) / total));
        });

        TestAttempt attempt = TestAttempt.builder()
                .type("assessment_test")
                .correct(correct)
                .total(questionIds.size())
                .percent(Math.round((correct * 100f) / questionIds.size()))
                .weekKey(null)
                .domainScoresJson(writeJson(domainScores))
                .seenQuestionIds(new ArrayList<>(questionIds))
                .answerValues(new ArrayList<>(answers))
                .traitCorrect(new LinkedHashMap<>(traitCorrect))
                .createdAt(LocalDateTime.now())
                .build();

        if (user != null) {
            attempt.setUser(user);
            try {
                return attemptRepository.save(attempt);
            } catch (Exception ex) {
                log.warn("Returning assessment result without saving because MongoDB is unavailable: {}", ex.getMessage());
            }
        }

        return attempt;
    }

    private List<QTemplate> gradePool(String grade) {
        return bank.stream()
                .filter(q -> grade.equals(q.grade()))
                .filter(q -> "ANY".equals(q.streamBucket()))
                .filter(q -> "ANY".equals(q.interestBucket()))
                .toList();
    }

    private List<QTemplate> streamPool(String streamBucket) {
        return bank.stream()
                .filter(q -> "ANY".equals(q.grade()))
                .filter(q -> streamBucket.equals(q.streamBucket()))
                .filter(q -> "ANY".equals(q.interestBucket()))
                .toList();
    }

    private List<QTemplate> interestPool(String interestBucket) {
        return bank.stream()
                .filter(q -> "ANY".equals(q.grade()))
                .filter(q -> "ANY".equals(q.streamBucket()))
                .filter(q -> interestBucket.equals(q.interestBucket()))
                .toList();
    }

    private List<QTemplate> pickQuestions(List<QTemplate> pool, int needed, String label) {
        if (pool.size() < needed) {
            throw new IllegalStateException("Insufficient questions configured for " + label);
        }

        List<QTemplate> shuffled = new ArrayList<>(pool);
        Collections.shuffle(shuffled, ThreadLocalRandom.current());
        return new ArrayList<>(shuffled.subList(0, needed));
    }

    private String normalizeGrade(String requestedGrade, User user) {
        String raw = firstNonBlank(requestedGrade, user != null ? user.getGrade() : null);
        String value = raw == null ? "" : raw.trim().toLowerCase();
        if (value.contains("10")) {
            return "10";
        }
        if (value.contains("12")) {
            return "12";
        }
        if (value.contains("grad") || value.contains("college") || value.contains("degree") || value.contains("b.")) {
            return "GRAD";
        }
        return "12";
    }

    private String normalizeStreamBucket(String requestedStream, String grade, User user) {
        String raw = firstNonBlank(requestedStream, user != null ? user.getStream() : null);
        String value = raw == null ? "" : raw.trim().toLowerCase();

        if (value.contains("undecided") || value.contains("not decided")) {
            return "FOUNDATION";
        }
        if (value.contains("pcm") || value.contains("computer") || value.contains("engineering")
                || value.contains("cs") || value.contains("technology")) {
            return "SCIENCE_TECH";
        }
        if (value.contains("pcb") || value.contains("bio") || value.contains("medical") || value.contains("life")) {
            return "SCIENCE_LIFE";
        }
        if (value.contains("commerce") || value.contains("bcom") || value.contains("business") || value.contains("finance")) {
            return "COMMERCE";
        }
        if (value.contains("law")) {
            return "LAW_GOVERNANCE";
        }
        if (value.contains("arts") || value.contains("humanit") || value.contains("design") || value.contains("ba")) {
            return "HUMANITIES";
        }
        return "10".equals(grade) ? "FOUNDATION" : "SCIENCE_TECH";
    }

    private String normalizeInterest(String requestedInterest, User user) {
        String raw = firstNonBlank(requestedInterest, user != null ? user.getInterest() : null);
        String value = raw == null ? "" : raw.trim().toLowerCase();

        if (value.contains("tech") || value.contains("coding") || value.contains("software")) {
            return "TECH";
        }
        if (value.contains("design") || value.contains("creative") || value.contains("art")) {
            return "DESIGN";
        }
        if (value.contains("business") || value.contains("management") || value.contains("entrepreneur")) {
            return "BUSINESS";
        }
        if (value.contains("health") || value.contains("research") || value.contains("medical")) {
            return "HEALTH";
        }
        if (value.contains("law") || value.contains("governance") || value.contains("policy")) {
            return "LAW";
        }
        return "TECH";
    }

    private String normalizeDifficulty(String requestedDifficulty) {
        String value = requestedDifficulty == null ? "" : requestedDifficulty.trim().toUpperCase();
        return value.isBlank() ? "PERSONALIZED" : value;
    }

    private String firstNonBlank(String primary, String fallback) {
        if (primary != null && !primary.isBlank()) {
            return primary;
        }
        if (fallback != null && !fallback.isBlank()) {
            return fallback;
        }
        return null;
    }

    private String writeJson(Map<String, Integer> scores) {
        StringBuilder sb = new StringBuilder("{");
        boolean first = true;
        for (Map.Entry<String, Integer> entry : scores.entrySet()) {
            if (!first) {
                sb.append(",");
            }
            sb.append("\"").append(entry.getKey()).append("\":").append(entry.getValue());
            first = false;
        }
        sb.append("}");
        return sb.toString();
    }

    private List<QTemplate> buildBank() {
        List<QTemplate> questions = new ArrayList<>();
        addQuestions(questions, "g10", "10", "ANY", "ANY", List.of(
                seed("Mathematics", "analytical", "What is the least common multiple of 12 and 18?", List.of("24", "30", "36", "42"), 2),
                seed("Mathematics", "analytical", "0.25 is equal to which fraction?", List.of("1/2", "1/4", "3/4", "2/5"), 1),
                seed("General Science", "analytical", "Photosynthesis mainly takes place in which part of a plant cell?", List.of("Nucleus", "Chloroplast", "Mitochondria", "Vacuole"), 1),
                seed("General Science", "analytical", "Which state of matter has a fixed volume but no fixed shape?", List.of("Solid", "Gas", "Liquid", "Plasma"), 2),
                seed("Reasoning", "logic", "Which number should come next in the pattern 2, 4, 8, 16, ...?", List.of("18", "24", "32", "34"), 2),
                seed("Reasoning", "logic", "If all squares are rectangles, which statement must be true?", List.of("All rectangles are squares", "Some rectangles are squares", "No square is a rectangle", "Only big squares are rectangles"), 1),
                seed("Communication", "team", "Which sentence is written in correct formal English?", List.of("Me and him went yesterday.", "She do not like maths.", "They were ready on time.", "He have submitted the work."), 2),
                seed("Communication", "team", "The synonym of 'careful' is:", List.of("Negligent", "Attentive", "Lazy", "Harsh"), 1),
                seed("Social Studies", "helping", "The Preamble of the Indian Constitution mainly describes:", List.of("The court structure", "The values and goals of the nation", "Tax collection rules", "Only election dates"), 1),
                seed("Social Studies", "business", "Which level of government is usually closest to local civic issues?", List.of("Municipal or panchayat level", "United Nations", "Supreme Court only", "Stock exchange"), 0),
                seed("Digital Basics", "tech", "Which practice keeps an online account safer?", List.of("Using the same password everywhere", "Sharing OTP with friends", "Turning on two-factor authentication", "Writing password in public comments"), 2),
                seed("Digital Basics", "tech", "A spreadsheet is mainly used to:", List.of("Edit videos", "Store and calculate data", "Draw 3D models", "Browse websites"), 1),
                seed("Study Skills", "team", "Which revision plan is most effective before an exam?", List.of("Read only one topic once", "Revise regularly with short tests", "Study only the night before", "Ignore mistakes"), 1),
                seed("Study Skills", "logic", "When solving a word problem, the best first step is usually to:", List.of("Guess the answer", "Underline the given information", "Skip to the last line only", "Memorize every number"), 1),
                seed("Career Awareness", "business", "Choosing a stream after Class 10 should mainly depend on:", List.of("Only friends' choices", "Your strengths and long-term goals", "The easiest uniform", "Random selection"), 1)
        ));

        addQuestions(questions, "g12", "12", "ANY", "ANY", List.of(
                seed("Mathematics", "analytical", "The probability of getting an odd number on a fair six-sided die is:", List.of("1/6", "1/3", "1/2", "2/3"), 2),
                seed("Mathematics", "logic", "The derivative of x^2 with respect to x is:", List.of("x", "2x", "x^2", "2"), 1),
                seed("Data Interpretation", "analytical", "If a value rises from 80 to 100, the percentage increase is:", List.of("20%", "25%", "40%", "80%"), 1),
                seed("Chemistry Basics", "analytical", "The molar mass of water (H2O) is:", List.of("16 g/mol", "17 g/mol", "18 g/mol", "20 g/mol"), 2),
                seed("Reasoning", "logic", "In a sequence 3, 6, 11, 18, 27, the next number is:", List.of("34", "36", "38", "40"), 2),
                seed("Reasoning", "logic", "If statement A implies statement B, and A is true, then B is:", List.of("False", "Always true", "Unrelated", "Impossible to discuss"), 1),
                seed("Communication", "team", "A strong statement of purpose should focus most on:", List.of("Copied quotes", "Your goals and evidence of fit", "Only marks", "Only hobbies"), 1),
                seed("Communication", "creative", "Which introduction style usually works best in a formal presentation?", List.of("A clear opening with context", "An unrelated joke only", "Reading every slide word-for-word", "Skipping the agenda completely"), 0),
                seed("Exam Strategy", "logic", "When a question seems difficult in a timed paper, the best approach is to:", List.of("Panic and stop", "Mark it and return after easier questions", "Leave the hall", "Change all previous answers"), 1),
                seed("Exam Strategy", "analytical", "Mock tests are most useful because they:", List.of("Replace revision entirely", "Show weak areas under time pressure", "Guarantee the same paper", "Eliminate the need for concepts"), 1),
                seed("General Science", "analytical", "The SI unit of force is:", List.of("Joule", "Pascal", "Newton", "Volt"), 2),
                seed("Data Interpretation", "business", "A chart showing monthly trends over a year is usually best read by checking:", List.of("Only one month", "The overall pattern and outliers", "The colors only", "The page number"), 1),
                seed("Communication", "team", "Which action improves group project coordination the most?", List.of("Avoiding deadlines", "Assigning owners and next steps", "Letting everyone assume tasks", "Ignoring blockers"), 1),
                seed("Career Planning", "business", "When comparing college options, an important factor is:", List.of("Only campus size", "Course quality and career alignment", "Only cafeteria menu", "Only brand colors"), 1),
                seed("Research Basics", "analytical", "A reliable source for an academic assignment is usually:", List.of("An unsigned social media post", "A peer-reviewed article or textbook", "A rumor in a chat", "An advertisement"), 1)
        ));

        addQuestions(questions, "grad", "GRAD", "ANY", "ANY", List.of(
                seed("Research Skills", "analytical", "A literature review is mainly used to:", List.of("Decorate a report", "Summarize and compare existing knowledge", "Replace data collection", "Avoid citations"), 1),
                seed("Professional Skills", "team", "Which resume bullet is strongest?", List.of("Worked on many things", "Built a dashboard that cut reporting time by 30%", "Good student", "Attended classes regularly"), 1),
                seed("Professional Skills", "team", "During an interview, the STAR method is used to:", List.of("Guess technical answers", "Structure responses with situation and outcome", "Skip introductions", "Negotiate salary only"), 1),
                seed("Data Literacy", "analytical", "The median is preferred over the mean when data has:", List.of("No numbers", "Strong outliers", "Only two values", "Perfect symmetry only"), 1),
                seed("Research Skills", "analytical", "A hypothesis should be:", List.of("Vague and untestable", "Specific and testable", "Based on rumors", "Written after the conclusion"), 1),
                seed("Professional Communication", "team", "A concise professional email should include:", List.of("A clear subject and action needed", "Only emojis", "No greeting or context", "Long unrelated stories"), 0),
                seed("Career Readiness", "business", "Networking is most effective when you:", List.of("Only ask for jobs immediately", "Build genuine relationships and follow up", "Send blank messages", "Avoid any context"), 1),
                seed("Project Management", "business", "A project milestone is:", List.of("A final exam only", "A major checkpoint in progress", "A random task name", "A personal hobby"), 1),
                seed("Ethics", "helping", "Academic or workplace plagiarism means:", List.of("Reusing your own idea with citation", "Presenting someone else's work as your own", "Summarizing with sources", "Brainstorming in a team"), 1),
                seed("Data Literacy", "analytical", "Correlation between two variables means:", List.of("One always causes the other", "They move together in some pattern", "They are identical", "They cannot be measured"), 1),
                seed("Career Readiness", "logic", "Before accepting an internship offer, you should verify:", List.of("Role expectations, learning scope, and stipend details", "Only office paint color", "Only the company logo", "Nothing at all"), 0),
                seed("Research Skills", "analytical", "Sampling bias happens when:", List.of("The sample represents everyone well", "The sample unfairly excludes key groups", "Data is stored in Excel", "Graphs use colors"), 1),
                seed("Presentation Skills", "creative", "A good presentation slide should:", List.of("Contain one key idea with visual clarity", "Show full paragraphs in tiny text", "Avoid hierarchy completely", "Use random colors only"), 0),
                seed("Professional Skills", "business", "An effective portfolio should mainly show:", List.of("Only certificates", "Evidence of skills and outcomes", "Only attendance", "Only profile photos"), 1),
                seed("Workplace Skills", "team", "When receiving feedback, the strongest response is to:", List.of("Ignore it", "Defend immediately", "Understand it and apply improvements", "Forward it without reading"), 2)
        ));

        addQuestions(questions, "foundation", "ANY", "FOUNDATION", "ANY", List.of(
                seed("Numeracy", "analytical", "If a notebook costs Rs 40 after a 20% discount, its original price was:", List.of("Rs 45", "Rs 48", "Rs 50", "Rs 60"), 2),
                seed("Numeracy", "analytical", "A ratio of 2:3 means that when the first value is 8, the second is:", List.of("10", "12", "14", "16"), 1),
                seed("General Science", "analytical", "Which planet is known as the Red Planet?", List.of("Earth", "Mars", "Jupiter", "Venus"), 1),
                seed("General Science", "analytical", "Boiling water changes into steam through:", List.of("Condensation", "Evaporation", "Freezing", "Filtration"), 1),
                seed("Reasoning", "logic", "Which word does not belong: circle, square, triangle, carrot?", List.of("Circle", "Square", "Triangle", "Carrot"), 3),
                seed("Reasoning", "logic", "If today is Monday, what day will it be after 10 days?", List.of("Wednesday", "Thursday", "Friday", "Saturday"), 1),
                seed("Communication", "team", "The best way to ask a teacher for help is to:", List.of("Send an empty message", "Explain the exact doubt politely", "Wait silently", "Copy someone else's work"), 1),
                seed("Communication", "team", "A paragraph usually becomes easier to read when it has:", List.of("One main idea", "No punctuation", "Random sentences", "Only capital letters"), 0),
                seed("Digital Basics", "tech", "A browser bookmark is used to:", List.of("Delete websites", "Save a page for easy return", "Hack passwords", "Increase internet speed"), 1),
                seed("Digital Basics", "tech", "Which file format is commonly used for presentations?", List.of(".pptx", ".mp3", ".zip", ".exe"), 0),
                seed("Career Awareness", "business", "An aptitude test mainly helps you understand:", List.of("Only your height", "Strengths and areas of fit", "Only your handwriting", "Only your uniform size"), 1),
                seed("Career Awareness", "business", "The best reason to explore different fields early is to:", List.of("Avoid learning anything deeply", "Make informed future choices", "Copy friends faster", "Skip reflection"), 1),
                seed("Study Skills", "logic", "Which habit improves long-term learning?", List.of("Spaced revision", "Last-minute cramming only", "Skipping practice", "Ignoring feedback"), 0),
                seed("Study Skills", "team", "Group study works best when members:", List.of("Wait for one person to do everything", "Share goals and solve doubts together", "Only talk off-topic", "Hide resources"), 1),
                seed("Problem Solving", "logic", "When facing a new problem, the best first move is to:", List.of("Break it into smaller parts", "Assume failure", "Avoid asking questions", "Change the topic"), 0)
        ));

        addQuestions(questions, "science_tech", "ANY", "SCIENCE_TECH", "ANY", List.of(
                seed("Mathematics", "analytical", "The value of sin 30 degrees is:", List.of("0", "1/2", "1", "sqrt(3)"), 1),
                seed("Mathematics", "logic", "If f(x) = 2x + 3, then f(5) equals:", List.of("10", "11", "13", "15"), 2),
                seed("Mathematics", "analytical", "The sum of the first five natural numbers is:", List.of("10", "12", "15", "20"), 2),
                seed("Physics", "analytical", "According to Newton's second law, force equals:", List.of("mass / acceleration", "mass x acceleration", "velocity x time", "work / distance"), 1),
                seed("Physics", "analytical", "The SI unit of electrical resistance is:", List.of("Ampere", "Volt", "Ohm", "Watt"), 2),
                seed("Physics", "logic", "A body moving with constant velocity has:", List.of("Zero acceleration", "Maximum acceleration", "Negative mass", "Infinite force"), 0),
                seed("Chemistry", "analytical", "A solution with pH 2 is:", List.of("Strongly acidic", "Neutral", "Basic", "Salt only"), 0),
                seed("Chemistry", "analytical", "The atomic number represents the number of:", List.of("Neutrons only", "Electrons in every ion", "Protons in the nucleus", "Molecules in a sample"), 2),
                seed("Coding", "tech", "Which structure works on First In, First Out order?", List.of("Stack", "Queue", "Tree", "Set"), 1),
                seed("Coding", "logic", "Binary search works correctly only when the list is:", List.of("Sorted", "Reversed", "Circular", "Random with duplicates"), 0),
                seed("Coding", "tech", "In programming, a loop is mainly used to:", List.of("Store images", "Repeat a set of instructions", "Increase battery size", "Rename hardware"), 1),
                seed("Technology", "tech", "A database is primarily used to:", List.of("Render 3D animation", "Store and retrieve structured information", "Increase monitor brightness", "Replace an operating system"), 1),
                seed("Technology", "tech", "HTTP status code 404 usually means:", List.of("Request successful", "Unauthorized", "Page not found", "Server upgraded"), 2),
                seed("Reasoning", "logic", "An algorithm is best described as:", List.of("A random guess", "A step-by-step method to solve a problem", "A type of processor", "A password rule"), 1),
                seed("Problem Solving", "tech", "When debugging code, the most useful first step is often to:", List.of("Delete the whole file", "Read the error and isolate the failing step", "Change all variable names", "Avoid testing"), 1)
        ));

        addQuestions(questions, "science_life", "ANY", "SCIENCE_LIFE", "ANY", List.of(
                seed("Biology", "health", "The basic structural and functional unit of life is the:", List.of("Atom", "Cell", "Organ", "Tissue"), 1),
                seed("Biology", "health", "DNA is mainly found in which cell structure?", List.of("Cell wall", "Nucleus", "Ribosome", "Golgi body"), 1),
                seed("Biology", "analytical", "The process by which plants lose water vapor is called:", List.of("Respiration", "Transpiration", "Fermentation", "Digestion"), 1),
                seed("Biology", "health", "Red blood cells primarily transport:", List.of("Oxygen", "Insulin", "Calcium", "Vitamins"), 0),
                seed("Chemistry", "analytical", "An enzyme works fastest at its:", List.of("Random temperature", "Optimum conditions", "Maximum salt only", "Lowest pH always"), 1),
                seed("Chemistry", "analytical", "A catalyst speeds up a reaction by:", List.of("Increasing activation energy", "Lowering activation energy", "Stopping collisions", "Adding more products"), 1),
                seed("Health Science", "helping", "Vaccination helps the body by:", List.of("Reducing all nutrients", "Preparing the immune system to respond", "Replacing white blood cells", "Stopping digestion"), 1),
                seed("Health Science", "helping", "The normal adult resting pulse is measured in:", List.of("Liters", "Beats per minute", "Meters per second", "Ohms"), 1),
                seed("Research", "analytical", "A microscope is most useful for observing:", List.of("Planets", "Very small specimens", "Mountains", "Sound waves"), 1),
                seed("Research", "analytical", "A control group in an experiment is important because it:", List.of("Adds bias on purpose", "Provides a baseline for comparison", "Guarantees perfect results", "Increases sample size only"), 1),
                seed("Biology", "health", "Which organ helps pump blood through the body?", List.of("Liver", "Kidney", "Heart", "Lung"), 2),
                seed("Biology", "health", "Mitosis mainly helps in:", List.of("Body growth and repair", "Digestion", "Only reproduction in humans", "Blood clotting"), 0),
                seed("Health Science", "helping", "The best immediate response to a minor burn is usually:", List.of("Apply ice directly for long periods", "Cool the area with clean running water", "Use random chemicals", "Cover with dust"), 1),
                seed("Research", "analytical", "In biology, a variable is:", List.of("Anything that can change in an experiment", "A fixed conclusion", "A type of microscope", "Only the final result"), 0),
                seed("Health Science", "health", "A balanced diet should contain:", List.of("Only proteins", "Only carbohydrates", "A mix of major nutrients and micronutrients", "Only fats"), 2)
        ));

        addQuestions(questions, "commerce", "ANY", "COMMERCE", "ANY", List.of(
                seed("Accounting", "business", "Assets are best described as:", List.of("Amounts owed by the business", "Resources owned by the business", "Owner's personal hobbies", "Daily weather changes"), 1),
                seed("Accounting", "analytical", "A balance sheet shows a business's position on:", List.of("A particular date", "Only weekends", "Every advertisement", "A future guess only"), 0),
                seed("Accounting", "business", "Depreciation mainly refers to:", List.of("An increase in asset value", "A gradual reduction in asset value over time", "Only bank interest", "The owner's salary"), 1),
                seed("Economics", "business", "Demand usually falls when price rises, assuming other things stay constant. This is called:", List.of("Law of supply", "Law of demand", "Inflation targeting", "Opportunity cost"), 1),
                seed("Economics", "analytical", "GDP is used to estimate:", List.of("Only stock prices", "The total value of goods and services produced", "Only imports", "Only agriculture jobs"), 1),
                seed("Economics", "business", "Inflation means:", List.of("A general rise in prices", "A fall in tax rates", "Only export growth", "A fixed exchange rate"), 0),
                seed("Business Studies", "business", "The 4Ps of marketing include product, price, place, and:", List.of("People", "Process", "Promotion", "Profit"), 2),
                seed("Business Studies", "team", "Delegation in management means:", List.of("Avoiding all responsibility", "Assigning authority and tasks to others appropriately", "Only hiring new staff", "Closing a department"), 1),
                seed("Business Studies", "business", "A value proposition clearly explains:", List.of("Why the offering is useful to a customer", "Only the office location", "Only the founder's age", "How many lights are in the office"), 0),
                seed("Finance", "analytical", "Simple interest on Rs 1000 at 10% per year for 2 years is:", List.of("Rs 100", "Rs 150", "Rs 200", "Rs 250"), 2),
                seed("Finance", "business", "Cash flow is important because it shows:", List.of("Only profit on paper", "Movement of money in and out of a business", "Only employee attendance", "The color of a brand"), 1),
                seed("Economics", "analytical", "Opportunity cost means:", List.of("The cost of a free sample", "The value of the next best alternative given up", "Only production tax", "Only transport charge"), 1),
                seed("Accounting", "analytical", "When total revenue equals total cost, a firm is at:", List.of("Loss point", "Break-even point", "Shutdown point", "Inflation point"), 1),
                seed("Business Studies", "team", "A KPI is mainly used to:", List.of("Decorate reports", "Track performance against goals", "Replace strategy", "Avoid data"), 1),
                seed("Finance", "business", "Working capital generally refers to:", List.of("Current assets minus current liabilities", "Only long-term debt", "Only machinery value", "Total annual profit"), 0)
        ));

        addQuestions(questions, "humanities", "ANY", "HUMANITIES", "ANY", List.of(
                seed("Political Science", "helping", "The legislature mainly makes:", List.of("Judgments", "Laws", "Weather reports", "Business logos"), 1),
                seed("Political Science", "logic", "Universal adult franchise means:", List.of("Only graduates can vote", "Every eligible adult citizen can vote", "Only government staff can vote", "Only judges can vote"), 1),
                seed("History", "analytical", "A primary historical source is best described as:", List.of("A later summary only", "An original record from the time", "A fictional story", "An unsigned meme"), 1),
                seed("History", "analytical", "Chronology in history refers to:", List.of("Arranging events by time order", "Only map reading", "Only economic data", "Writing poems"), 0),
                seed("Literature", "creative", "A metaphor is:", List.of("A direct comparison without using like or as", "A historical record", "A legal argument", "A pie chart"), 0),
                seed("Literature", "creative", "The tone of a passage refers to the writer's:", List.of("Font size", "Attitude or emotional coloring", "Page number", "Pen type"), 1),
                seed("Sociology", "team", "Socialization is the process by which people:", List.of("Learn norms and behaviors of society", "Only memorize dates", "Open bank accounts", "Measure blood pressure"), 0),
                seed("Sociology", "helping", "A stereotype becomes harmful when it:", List.of("Helps understand individual differences", "Unfairly reduces people to oversimplified assumptions", "Encourages evidence-based thinking", "Promotes nuance"), 1),
                seed("Psychology", "analytical", "Short-term memory is generally associated with:", List.of("Temporary holding of information", "Permanent storage of all childhood events", "Only visual art", "Only muscle movement"), 0),
                seed("Psychology", "helping", "Active listening mainly means:", List.of("Waiting to interrupt", "Paying attention and reflecting understanding", "Giving immediate orders", "Avoiding eye contact"), 1),
                seed("Geography", "analytical", "A thematic map usually highlights:", List.of("One specific pattern like rainfall or population", "Only random shapes", "Only district names", "Only mountain colors"), 0),
                seed("Geography", "helping", "Monsoon rainfall is especially important in India because it strongly affects:", List.of("Only cinema schedules", "Agriculture and water supply", "Only passport design", "Only road paint"), 1),
                seed("Media Literacy", "logic", "A reliable article is more likely to include:", List.of("Evidence and cited sources", "Only emotional claims", "No author or date", "Only forwarded messages"), 0),
                seed("Civics", "helping", "A public policy is mainly created to:", List.of("Solve social or administrative problems", "Decorate websites", "Change handwriting", "Increase rumor sharing"), 0),
                seed("Communication", "creative", "A strong essay usually has:", List.of("A clear thesis and supporting points", "Only unrelated examples", "No structure", "Only copied content"), 0)
        ));

        addQuestions(questions, "lawgov", "ANY", "LAW_GOVERNANCE", "ANY", List.of(
                seed("Legal Reasoning", "logic", "A valid contract generally requires offer, acceptance, and:", List.of("A traffic signal", "Consideration", "A newspaper", "A passport"), 1),
                seed("Legal Reasoning", "logic", "The burden of proof in a dispute usually refers to:", List.of("Who must establish the claim with evidence", "Who speaks first only", "Who has more friends", "Who writes the longest paragraph"), 0),
                seed("Polity", "helping", "A writ of habeas corpus is mainly used to protect against:", List.of("Illegal detention", "Unpaid electricity bills", "Low exam marks", "Tax filing delays"), 0),
                seed("Polity", "helping", "Separation of powers helps prevent:", List.of("Any lawmaking at all", "Concentration of unchecked authority", "Public debate", "Local governance"), 1),
                seed("Governance", "business", "A policy impact assessment is meant to study:", List.of("How a rule affects people and systems", "Only office attendance", "Only logo design", "Only handwriting style"), 0),
                seed("Governance", "helping", "Right to Information laws mainly improve:", List.of("Secrecy", "Public transparency", "Exam speed", "Machine repair"), 1),
                seed("Legal Reasoning", "logic", "Precedent in law refers to:", List.of("A previous judicial decision used for guidance", "A school uniform rule", "A tax receipt", "A campaign poster"), 0),
                seed("Legal Reasoning", "logic", "Negligence usually involves failing to take:", List.of("A vacation", "Reasonable care", "A written exam", "A salary slip"), 1),
                seed("Polity", "helping", "Fundamental Rights in India are enforceable mainly through:", List.of("Courts", "Only private clubs", "Only newspapers", "Only village fairs"), 0),
                seed("Governance", "business", "A regulator is created mainly to:", List.of("Set cartoons on TV", "Oversee compliance and fair conduct in a sector", "Write novels", "Replace all courts"), 1),
                seed("Legal Reasoning", "logic", "If a fact pattern has no direct rule, legal reasoning often relies on:", List.of("Analogy and principle", "Random choice", "Lucky numbers", "Silence only"), 0),
                seed("Polity", "helping", "The Directive Principles are mainly intended to:", List.of("Guide the state in governance goals", "Replace all rights", "Function as criminal penalties", "Regulate traffic only"), 0),
                seed("Governance", "business", "Administrative accountability is strongest when decisions are:", List.of("Hidden from scrutiny", "Documented and reviewable", "Based only on rumors", "Made without any records"), 1),
                seed("Legal Reasoning", "logic", "A FIR in criminal procedure is mainly the first:", List.of("Formal information report to police", "Court judgment", "Bail order", "Final conviction"), 0),
                seed("Public Policy", "helping", "A good policy recommendation usually balances:", List.of("Evidence, feasibility, and public impact", "Only slogans", "Only one anecdote", "Only party posters"), 0)
        ));

        addQuestions(questions, "interest_tech", "ANY", "ANY", "TECH", List.of(
                seed("Technology & Coding", "tech", "Version control tools like Git are mainly used to:", List.of("Edit photos", "Track code changes and collaborate", "Run washing machines", "Design posters"), 1),
                seed("Technology & Coding", "logic", "Which binary value represents decimal 5?", List.of("101", "110", "111", "100"), 0),
                seed("Technology & Coding", "tech", "An API is best understood as:", List.of("A hardware cable", "A way for software systems to communicate", "A power backup unit", "A text editor theme"), 1),
                seed("Technology & Coding", "logic", "Which statement about debugging is most accurate?", List.of("It is only for senior engineers", "It is the process of finding and fixing issues", "It means deleting old code", "It replaces testing"), 1),
                seed("Technology & Coding", "tech", "HTML is mainly used to:", List.of("Structure web content", "Store relational data", "Compile Java bytecode", "Encrypt Wi-Fi"), 0),
                seed("Technology & Coding", "logic", "Which data structure uses Last In, First Out order?", List.of("Queue", "Stack", "ArrayList", "Graph"), 1),
                seed("Technology & Coding", "tech", "Cloud computing mainly helps by allowing teams to:", List.of("Access scalable computing resources over the internet", "Remove all cybersecurity needs", "Avoid using software", "Skip backups forever"), 0),
                seed("Technology & Coding", "analytical", "A clean dataset is important in analytics because it:", List.of("Looks colorful", "Improves reliability of conclusions", "Removes the need for thinking", "Guarantees profit"), 1),
                seed("Technology & Coding", "tech", "The command line is useful because it lets you:", List.of("Only draw diagrams", "Interact directly with programs and files", "Replace databases forever", "Avoid all automation"), 1),
                seed("Technology & Coding", "logic", "When breaking a large program into modules, the main benefit is:", List.of("Lower readability", "Better organization and maintainability", "More random behavior", "Less reusability"), 1)
        ));

        addQuestions(questions, "interest_design", "ANY", "ANY", "DESIGN", List.of(
                seed("Design Thinking", "design", "A wireframe is mainly used to show:", List.of("Early layout and structure", "Final tax calculations", "Database indexing", "Chemical bonding"), 0),
                seed("Design Thinking", "creative", "High contrast in a design improves:", List.of("Confusion", "Readability and hierarchy", "File size only", "Compiler speed"), 1),
                seed("Design Thinking", "design", "Typography mainly focuses on:", List.of("How text is arranged and styled", "How motors work", "How taxes are collected", "How blood is pumped"), 0),
                seed("Design Thinking", "creative", "In UI design, whitespace is useful because it:", List.of("Wastes screen area", "Helps content breathe and improves focus", "Removes all branding", "Breaks prototypes"), 1),
                seed("Design Thinking", "design", "A prototype is best described as:", List.of("A rough interactive model of an idea", "A legal notice", "A bank statement", "A chemistry reagent"), 0),
                seed("Design Thinking", "creative", "Empathy in design means:", List.of("Designing only what you like", "Understanding the user's context and pain points", "Ignoring feedback", "Copying every competitor"), 1),
                seed("Design Thinking", "design", "Visual hierarchy helps users by:", List.of("Showing what to notice first", "Removing all navigation", "Hiding key actions", "Making text equally prominent"), 0),
                seed("Design Thinking", "creative", "A moodboard is often used to:", List.of("Plan server migrations", "Explore style, tone, and inspiration", "File taxes", "Sort legal precedents"), 1),
                seed("Design Thinking", "design", "Usability testing is valuable because it:", List.of("Shows how real users interact with the design", "Guarantees awards", "Replaces research forever", "Removes the need for iteration"), 0),
                seed("Design Thinking", "creative", "The strongest design portfolio piece usually explains:", List.of("Only final screens", "Problem, process, decisions, and outcome", "Only your software list", "Only your photo"), 1)
        ));

        addQuestions(questions, "interest_business", "ANY", "ANY", "BUSINESS", List.of(
                seed("Business Aptitude", "business", "Market research is mainly done to:", List.of("Guess without evidence", "Understand customer needs and demand", "Avoid decisions", "Increase font size"), 1),
                seed("Business Aptitude", "analytical", "Gross margin compares revenue with:", List.of("Direct cost of delivering the product", "Only employee attendance", "Website color choice", "Office rent only"), 0),
                seed("Business Aptitude", "business", "A startup's runway tells you:", List.of("How many chairs it has", "How long it can operate before cash runs out", "The speed of the internet", "Its logo quality"), 1),
                seed("Business Aptitude", "team", "Retention is important because it measures:", List.of("How many existing users keep coming back", "Only new office hires", "Only one-day sales", "How many posters are printed"), 0),
                seed("Business Aptitude", "business", "A SWOT analysis reviews strengths, weaknesses, opportunities, and:", List.of("Timing", "Threats", "Talent", "Transactions"), 1),
                seed("Business Aptitude", "analytical", "If customer acquisition cost is rising sharply, a team should first:", List.of("Ignore the trend", "Investigate channels and conversion efficiency", "Double random spending", "Stop measuring data"), 1),
                seed("Business Aptitude", "team", "A good meeting agenda helps by:", List.of("Keeping discussion focused on outcomes", "Removing all accountability", "Avoiding preparation", "Reducing clarity"), 0),
                seed("Business Aptitude", "business", "A value proposition should answer:", List.of("Why the customer should care", "Which movie is popular", "What color the office walls are", "How many coffees were sold nearby"), 0),
                seed("Business Aptitude", "team", "Delegating a task well usually includes:", List.of("Clear expectations and ownership", "No deadline or context", "Assumptions only", "Avoiding follow-up"), 0),
                seed("Business Aptitude", "business", "Pricing a product only by copying competitors is risky because it may ignore:", List.of("Customer value and cost structure", "The weather", "The keyboard brand", "The number of windows"), 0)
        ));

        addQuestions(questions, "interest_health", "ANY", "ANY", "HEALTH", List.of(
                seed("Healthcare & Research", "health", "Evidence-based healthcare mainly means:", List.of("Using best available research with judgment", "Using rumors only", "Avoiding patient context", "Ignoring data"), 0),
                seed("Healthcare & Research", "helping", "Patient confidentiality means you should:", List.of("Share records casually", "Protect private health information", "Post details online", "Discuss cases publicly without purpose"), 1),
                seed("Healthcare & Research", "analytical", "An epidemiologist mainly studies:", List.of("How diseases spread in populations", "Only interior design", "Only tax laws", "Only machine repair"), 0),
                seed("Healthcare & Research", "health", "A balanced plate generally includes:", List.of("Only sugar", "Only protein", "A mix of grains, protein, vegetables, and fruits", "Only fat"), 2),
                seed("Healthcare & Research", "helping", "Informed consent means a person should:", List.of("Agree without explanation", "Understand the procedure and choose voluntarily", "Be forced to sign quickly", "Always say yes"), 1),
                seed("Healthcare & Research", "analytical", "A placebo-controlled study helps researchers compare:", List.of("Only colors in a report", "Actual treatment effects against a baseline", "Only internet speed", "Only staff attendance"), 1),
                seed("Healthcare & Research", "health", "Aseptic technique is important because it helps:", List.of("Increase noise in a lab", "Reduce contamination risk", "Replace measurements", "Skip documentation"), 1),
                seed("Healthcare & Research", "helping", "Mental health support often begins with:", List.of("Dismissing concerns", "Listening and connecting to proper help", "Sharing private details publicly", "Avoiding follow-up"), 1),
                seed("Healthcare & Research", "analytical", "A good research question is usually:", List.of("Specific and measurable", "Random and vague", "Impossible to investigate", "Based only on assumptions"), 0),
                seed("Healthcare & Research", "health", "Public health campaigns mainly aim to:", List.of("Improve outcomes at community or population level", "Increase confusion", "Reduce access to information", "Focus only on logos"), 0)
        ));

        addQuestions(questions, "interest_law", "ANY", "ANY", "LAW", List.of(
                seed("Law & Governance", "logic", "Rule of law means:", List.of("Power belongs only to one person", "Laws apply fairly and consistently", "Only lawyers must follow rules", "Evidence is optional"), 1),
                seed("Law & Governance", "helping", "Public Interest Litigation is generally meant to address:", List.of("Purely private birthday disputes", "Broader public rights and welfare issues", "Only movie reviews", "Only college festivals"), 1),
                seed("Law & Governance", "logic", "Mediation differs from litigation because mediation usually:", List.of("Is a collaborative resolution process", "Always ends in prison", "Avoids any discussion", "Can only be done online"), 0),
                seed("Law & Governance", "business", "A policy brief should mainly be:", List.of("Short, evidence-based, and actionable", "Long and unrelated", "Only emotional slogans", "A list of memes"), 0),
                seed("Law & Governance", "logic", "If two facts appear similar to an older case, a lawyer may rely on:", List.of("Analogy", "Guesswork", "Silence", "Astrology"), 0),
                seed("Law & Governance", "helping", "Due process is important because it protects:", List.of("Fair procedure before state action", "Only brand identity", "Only exam schedules", "Only tax invoices"), 0),
                seed("Law & Governance", "logic", "When reading a legal problem, the best first step is to identify:", List.of("The key issue and relevant facts", "Only the longest sentence", "Only the font style", "Nothing until the end"), 0),
                seed("Law & Governance", "business", "Good governance is most associated with:", List.of("Opacity and secrecy", "Transparency and accountability", "Random decision-making", "No public participation"), 1),
                seed("Law & Governance", "helping", "A citizen charter mainly tells people:", List.of("Expected service standards and grievance paths", "Only political slogans", "Only exam marks", "Only office furniture details"), 0),
                seed("Law & Governance", "logic", "When a claim is unsupported by evidence, the safest conclusion is to:", List.of("Accept it immediately", "Treat it with caution and ask for proof", "Share it widely", "Turn it into policy"), 1)
        ));

        return List.copyOf(questions);
    }

    private void addQuestions(
            List<QTemplate> target,
            String prefix,
            String grade,
            String streamBucket,
            String interestBucket,
            List<QuestionSeed> seeds) {
        for (int i = 0; i < seeds.size(); i++) {
            QuestionSeed seed = seeds.get(i);
            target.add(new QTemplate(
                    prefix + "_" + (i + 1),
                    seed.prompt(),
                    List.copyOf(seed.options()),
                    seed.answerIndex(),
                    grade,
                    streamBucket,
                    interestBucket,
                    seed.domain(),
                    seed.trait()));
        }
    }

    private QuestionSeed seed(String domain, String trait, String prompt, List<String> options, int answerIndex) {
        return new QuestionSeed(domain, trait, prompt, List.copyOf(options), answerIndex);
    }

    private record QuestionSeed(
            String domain,
            String trait,
            String prompt,
            List<String> options,
            int answerIndex) {
    }

    private record QTemplate(
            String id,
            String prompt,
            List<String> options,
            int answerIndex,
            String grade,
            String streamBucket,
            String interestBucket,
            String domain,
            String trait) {
    }
}
