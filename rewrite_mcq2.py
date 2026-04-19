import re

java_file_path = "careercompass-backend/src/main/java/com/careercompass/service/RaisecService.java"

with open(java_file_path, "r", encoding="utf-8") as f:
    content = f.read()

java_code = """
        private static class QTemplate {
            String id;
            String letter;
            String diff;
            String stream;
            String prompt;
            java.util.List<String> options;
            int answerIndex;

            public QTemplate(String id, String letter, String diff, String stream, String prompt, java.util.List<String> options, int answerIndex) {
                this.id = id;
                this.letter = letter;
                this.diff = diff;
                this.stream = stream;
                this.prompt = prompt;
                this.options = options;
                this.answerIndex = answerIndex;
            }
        }

        private final List<QTemplate> bank = new ArrayList<>();

        @jakarta.annotation.PostConstruct
        public void initBank() {
            int c = 1;
            // ==========================================
            // MULTIPLE CHOICE DOMAIN-SPECIFIC QUESTIONS
            // ==========================================

            // === PCM / Science ===
            bank.add(new QTemplate("q" + c++, "I", "EASY", "PCM", "A student scores 52, 60, 64 and 68 in four mock tests. What is the average score?", List.of("57", "65", "61", "69"), 2));
            bank.add(new QTemplate("q" + c++, "I", "EASY", "PCM", "If a student solves 6 math questions in 3 minutes, how many will they solve in 12 minutes at the same speed?", List.of("20", "24", "26", "30"), 1));
            bank.add(new QTemplate("q" + c++, "A", "EASY", "PCM", "Which algorithmic notation represents the worst-case time complexity of a purely linear search?", List.of("O(1)", "O(log n)", "O(n)", "O(n^2)"), 2));
            bank.add(new QTemplate("q" + c++, "I", "EASY", "PCM", "In Python, which built-in data structure is primarily used to map unique keys to values?", List.of("List", "Tuple", "Set", "Dictionary"), 3));
            bank.add(new QTemplate("q" + c++, "R", "EASY", "PCM", "When designing a basic web page's styling, which technology dictates the colors and layout?", List.of("HTML", "CSS", "SQL", "C++"), 1));
            bank.add(new QTemplate("q" + c++, "I", "MEDIUM", "PCM", "Solve for x: 3x - 7 = 2x + 5.", List.of("12", "-2", "2", "-12"), 0));
            bank.add(new QTemplate("q" + c++, "R", "MEDIUM", "PCM", "Which machine learning paradigm uses a \\"reward signal\\" to train agents in dynamic environments?", List.of("Supervised Learning", "Unsupervised Learning", "Reinforcement Learning", "Ensemble Learning"), 2));
            bank.add(new QTemplate("q" + c++, "C", "MEDIUM", "PCM", "A training batch has 200 students. If 25% choose computing, how many students choose computing?", List.of("40", "50", "60", "70"), 1));
            bank.add(new QTemplate("q" + c++, "I", "HARD", "PCM", "In calculus, the derivative of f(x) = x^3 - 4x w.r.t x is?", List.of("3x^2 - 4", "3x^2 + 4x", "x^2 - 4", "3x - 4"), 0));
            bank.add(new QTemplate("q" + c++, "A", "HARD", "PCM", "In object-oriented programming, \\"Polymorphism\\" is best described as:", List.of("Hiding variables", "Inheriting attributes", "Many forms or behaviors sharing an interface", "Database linking"), 2));
            bank.add(new QTemplate("q" + c++, "R", "TOUGH", "PCM", "If a quantum state is a linear combination of |0> and |1>, evaluating it is known as:", List.of("Superposition", "Entanglement", "Decoherence", "Interference"), 0));

            // === PCB / Biology ===
            bank.add(new QTemplate("q" + c++, "I", "EASY", "PCB", "Which organelle is universally known as the powerhouse of the cell?", List.of("Nucleus", "Ribosome", "Mitochondria", "Golgi apparatus"), 2));
            bank.add(new QTemplate("q" + c++, "R", "EASY", "PCB", "Which blood type is considered the universal donor in emergencies?", List.of("A positive", "AB negative", "O negative", "O positive"), 2));
            bank.add(new QTemplate("q" + c++, "A", "EASY", "PCB", "A patient requires 500ml of IV fluid over 5 hours. What is the drip rate in ml/hour?", List.of("50 ml/hr", "100 ml/hr", "150 ml/hr", "200 ml/hr"), 1));
            bank.add(new QTemplate("q" + c++, "S", "MEDIUM", "PCB", "What is the primary function of white blood cells (Leukocytes)?", List.of("Oxygen transport", "Clotting", "Immune defense", "Nutrient absorption"), 2));
            bank.add(new QTemplate("q" + c++, "I", "MEDIUM", "PCB", "If an organism has a genotype of 'Aa', its genetic makeup is best described as:", List.of("Homozygous dominant", "Homozygous recessive", "Heterozygous", "Polygenic"), 2));
            bank.add(new QTemplate("q" + c++, "R", "HARD", "PCB", "During cellular respiration, glycolysis strictly occurs where within the cell?", List.of("Mitochondrial matrix", "Nucleus", "Cytoplasm", "Endoplasmic reticulum"), 2));
            bank.add(new QTemplate("q" + c++, "S", "HARD", "PCB", "Which cranial nerve is primarily responsible for transmitting visual information to the brain?", List.of("Olfactory Nerve", "Optic Nerve", "Trigeminal Nerve", "Vagus Nerve"), 1));

            // === COMMERCE ===
            bank.add(new QTemplate("q" + c++, "E", "EASY", "COMMERCE", "If a product costs $40 and is sold for $50, what is the raw profit margin percentage?", List.of("10%", "20%", "25%", "50%"), 2));
            bank.add(new QTemplate("q" + c++, "C", "EASY", "COMMERCE", "Which term refers to absolute liabilities that a company must pay within one year?", List.of("Long-term debts", "Current liabilities", "Equity", "Assets"), 1));
            bank.add(new QTemplate("q" + c++, "E", "EASY", "COMMERCE", "A company earns $20,000 in revenue and has $15,000 in expenses. What is the net income?", List.of("$5,000", "$35,000", "$15,000", "$20,000"), 0));
            bank.add(new QTemplate("q" + c++, "I", "MEDIUM", "COMMERCE", "In accounting terminology, what is the fundamental accounting equation?", List.of("Assets = Liabilities + Equity", "Profit = Revenue - Taxes", "Equity = Assets + Liabilities", "Net Income = Dividends"), 0));
            bank.add(new QTemplate("q" + c++, "C", "MEDIUM", "COMMERCE", "If an investment grows from $1,000 to $1,100 in one year, what was the simple interest rate?", List.of("1%", "5%", "10%", "15%"), 2));
            bank.add(new QTemplate("q" + c++, "E", "HARD", "COMMERCE", "What does 'EBITDA' stand for in financial analysis?", List.of("Earnings Before Interest, Taxes, Depreciation, and Amortization", "Enterprise Board Internal Tax Department Association", "Estimated Budget In Time Deducting Assets", "Equity Backed Interest Term Dividend Accounts"), 0));

            // === ARTS / Humanities ===
            bank.add(new QTemplate("q" + c++, "A", "EASY", "ARTS", "Which famous Renaissance artist painted the ceiling of the Sistine Chapel?", List.of("Leonardo da Vinci", "Raphael", "Michelangelo", "Donatello"), 2));
            bank.add(new QTemplate("q" + c++, "R", "EASY", "ARTS", "In literary analysis, what does the term 'theme' refer strictly to?", List.of("The plot outline", "The main character's name", "The underlying message or central idea", "The setting's physical location"), 2));
            bank.add(new QTemplate("q" + c++, "I", "MEDIUM", "ARTS", "Which historical event famously initiated World War I in 1914?", List.of("The Fall of the Berlin Wall", "The assassination of Archduke Franz Ferdinand", "The signing of the Treaty of Versailles", "The bombing of Pearl Harbor"), 1));
            bank.add(new QTemplate("q" + c++, "A", "MEDIUM", "ARTS", "What is the primary distinction between an 'aria' and a 'recitative' in classical opera?", List.of("Arias are spoken, recitatives are sung", "Arias are melodic solos, recitatives advance the plot with speech-like singing", "Recitatives are choral, arias are instrumental", "There is no actual difference"), 1));
            bank.add(new QTemplate("q" + c++, "I", "HARD", "ARTS", "In philosophy, 'Epistemology' is the formal study of:", List.of("Morals and ethics", "The nature of beauty", "The theory of knowledge and belief", "Political governance structures"), 2));

            // === ANY / General ===
            bank.add(new QTemplate("q" + c++, "I", "EASY", "ANY", "If a car travels 120 miles in 2 hours, what is its average speed?", List.of("50 mph", "60 mph", "70 mph", "80 mph"), 1));
            bank.add(new QTemplate("q" + c++, "A", "EASY", "ANY", "Which of the following describes checking and correcting a text for structural errors?", List.of("Brainstorming", "Proofreading", "Drafting", "Publishing"), 1));
            bank.add(new QTemplate("q" + c++, "S", "MEDIUM", "ANY", "When resolving a professional workplace conflict, the best initial strategy is:", List.of("Active listening and factual clarification", "Immediate escalation to HR", "Ignoring the issue permanently", "Issuing strict demands"), 0));
"""

# Match everything from `private static class QTemplate {` all the way to before `// Helper to generate dynamic variables`
start_marker = "private static class QTemplate {"
end_marker = "// Helper to generate dynamic variables"

start_idx = content.find(start_marker)
end_idx = content.find(end_marker)

if start_idx != -1 and end_idx != -1:
    new_content = content[:start_idx] + java_code + "\\n        " + content[end_idx:]
    with open(java_file_path, "w", encoding="utf-8") as f:
        f.write(new_content)
    print("Java backend modified successfully for MCQ")
else:
    print("Failed to find markers")
