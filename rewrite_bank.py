import re

with open("careercompass-backend/src/main/java/com/careercompass/service/RaisecService.java", "r", encoding="utf-8") as f:
    content = f.read()

new_bank = """
                // ==========================================
                // HARDCODED HIGH-QUALITY DOMAIN-SPECIFIC QUESTIONS
                // ==========================================

                // --- EASY ---
                bank.add(new QTemplate("q" + c++, "R", "EASY", "PCM", "how much do you enjoy physically wiring up a Raspberry Pi or Arduino circuit board?"));
                bank.add(new QTemplate("q" + c++, "I", "EASY", "PCM", "would you like writing your very first simple Python script to automate a math calculation?"));
                bank.add(new QTemplate("q" + c++, "A", "EASY", "PCM", "would you enjoy designing the CSS layout and visual aesthetics for a simple web app?"));
                bank.add(new QTemplate("q" + c++, "S", "EASY", "PCM", "how much would you like helping a classmate debug a frustrating error in their code?"));
                bank.add(new QTemplate("q" + c++, "E", "EASY", "PCM", "would you enjoy leading a small team of students in a weekend coding hackathon?"));
                bank.add(new QTemplate("q" + c++, "C", "EASY", "PCM", "could you see yourself meticulously organizing the folder structure and git branches for a project?"));

                bank.add(new QTemplate("q" + c++, "R", "EASY", "PCB", "would you enjoy setting up basic lab equipment like microscopes and slides?"));
                bank.add(new QTemplate("q" + c++, "I", "EASY", "PCB", "how much do you like studying the biological functions of different human cells?"));
                bank.add(new QTemplate("q" + c++, "A", "EASY", "PCB", "could you see yourself sketching anatomical diagrams for a biology project?"));
                bank.add(new QTemplate("q" + c++, "S", "EASY", "PCB", "would you enjoy volunteering at a local clinic to help direct patients?"));
                bank.add(new QTemplate("q" + c++, "E", "EASY", "PCB", "how much would you like organizing a school-wide health and wellness awareness drive?"));
                bank.add(new QTemplate("q" + c++, "C", "EASY", "PCB", "could you meticulously log daily temperature and growth data for a plant experiment?"));

                bank.add(new QTemplate("q" + c++, "R", "EASY", "COMMERCE", "would you enjoy organizing and setting up the physical layout of a small retail booth?"));
                bank.add(new QTemplate("q" + c++, "I", "EASY", "COMMERCE", "how much do you like calculating profit margins and basic taxation percentages?"));
                bank.add(new QTemplate("q" + c++, "A", "EASY", "COMMERCE", "could you see yourself designing an eye-catching logo or flyer for a new product?"));
                bank.add(new QTemplate("q" + c++, "S", "EASY", "COMMERCE", "would you enjoy interacting directly with customers to understand their shopping needs?"));
                bank.add(new QTemplate("q" + c++, "E", "EASY", "COMMERCE", "how much would you like pitching a simple sales idea to your classmates?"));
                bank.add(new QTemplate("q" + c++, "C", "EASY", "COMMERCE", "could you meticulously balance a basic ledger of income and expenses?"));

                bank.add(new QTemplate("q" + c++, "R", "EASY", "ARTS", "would you enjoy physically assembling the stage props for a local theater production?"));
                bank.add(new QTemplate("q" + c++, "I", "EASY", "ARTS", "how much do you like researching the historical origins of ancient mythologies?"));
                bank.add(new QTemplate("q" + c++, "A", "EASY", "ARTS", "could you see yourself writing a creative short story or painting a landscape?"));
                bank.add(new QTemplate("q" + c++, "S", "EASY", "ARTS", "would you enjoy organizing a collaborative art workshop for local neighborhood kids?"));
                bank.add(new QTemplate("q" + c++, "E", "EASY", "ARTS", "how much would you like managing the ticket sales and promotion for a school concert?"));
                bank.add(new QTemplate("q" + c++, "C", "EASY", "ARTS", "could you meticulously catalog and archive hundreds of historical photographs?"));


                // --- MEDIUM ---
                bank.add(new QTemplate("q" + c++, "R", "MEDIUM", "PCM", "how much would you enjoy configuring the hardware and network ports for a local database server?"));
                bank.add(new QTemplate("q" + c++, "I", "MEDIUM", "PCM", "could you see yourself analyzing a massive dataset using SQL to find hidden mathematical patterns?"));
                bank.add(new QTemplate("q" + c++, "A", "MEDIUM", "PCM", "would you like creating the front-end animations for a mobile app using React Native?"));
                bank.add(new QTemplate("q" + c++, "S", "MEDIUM", "PCM", "would you enjoy mentoring a group of beginners on how to build their first Artificial Intelligence model?"));
                bank.add(new QTemplate("q" + c++, "E", "MEDIUM", "PCM", "could you see yourself pitching a new tech startup idea to a panel of software investors?"));
                bank.add(new QTemplate("q" + c++, "C", "MEDIUM", "PCM", "how much would you like writing comprehensive unit tests to ensure a software program never crashes?"));

                bank.add(new QTemplate("q" + c++, "R", "MEDIUM", "PCB", "would you enjoy operating high-tech diagnostic machinery like an MRI or X-ray scanner?"));
                bank.add(new QTemplate("q" + c++, "I", "MEDIUM", "PCB", "how much do you like investigating the root causes of a complex genetic disease?"));
                bank.add(new QTemplate("q" + c++, "A", "MEDIUM", "PCB", "could you see yourself designing an engaging interactive exhibit for a science museum?"));
                bank.add(new QTemplate("q" + c++, "S", "MEDIUM", "PCB", "would you enjoy providing counseling and emotional support to patients recovering from surgery?"));
                bank.add(new QTemplate("q" + c++, "E", "MEDIUM", "PCB", "how much would you like managing the operational budget of a private medical clinic?"));
                bank.add(new QTemplate("q" + c++, "C", "MEDIUM", "PCB", "could you meticulously ensure that a pharmaceutical lab strictly adheres to safety compliance standards?"));

                bank.add(new QTemplate("q" + c++, "R", "MEDIUM", "COMMERCE", "would you enjoy managing the physical supply chain logistics for a large warehouse?"));
                bank.add(new QTemplate("q" + c++, "I", "MEDIUM", "COMMERCE", "how much do you like analyzing market trends to predict the next big stock movement?"));
                bank.add(new QTemplate("q" + c++, "A", "MEDIUM", "COMMERCE", "could you see yourself crafting the creative marketing narrative for a new lifestyle brand?"));
                bank.add(new QTemplate("q" + c++, "S", "MEDIUM", "COMMERCE", "would you enjoy working in Human Resources resolving complex employee conflicts?"));
                bank.add(new QTemplate("q" + c++, "E", "MEDIUM", "COMMERCE", "how much would you like negotiating a highly lucrative contract with a stubborn corporate client?"));
                bank.add(new QTemplate("q" + c++, "C", "MEDIUM", "COMMERCE", "could you meticulously audit the financial records of a company to ensure absolute accuracy?"));

                bank.add(new QTemplate("q" + c++, "R", "MEDIUM", "ARTS", "would you enjoy restoring physical classical sculptures or binding antique books?"));
                bank.add(new QTemplate("q" + c++, "I", "MEDIUM", "ARTS", "how much do you like academically critiquing the sociopolitical themes of 19th-century literature?"));
                bank.add(new QTemplate("q" + c++, "A", "MEDIUM", "ARTS", "could you see yourself composing original background music for an indie video game?"));
                bank.add(new QTemplate("q" + c++, "S", "MEDIUM", "ARTS", "would you enjoy teaching a diverse classroom of students about cultural anthropology?"));
                bank.add(new QTemplate("q" + c++, "E", "MEDIUM", "ARTS", "how much would you like acting as a talent agent to negotiate deals for up-and-coming actors?"));
                bank.add(new QTemplate("q" + c++, "C", "MEDIUM", "ARTS", "could you meticulously organize the logistics and scheduling for a multi-day film festival?"));


                // --- HARD ---
                bank.add(new QTemplate("q" + c++, "R", "HARD", "PCM", "how much would you enjoy designing the low-level embedded C code for a working drone flight controller?"));
                bank.add(new QTemplate("q" + c++, "I", "HARD", "PCM", "could you see yourself writing a complex machine learning algorithm from scratch using calculus and linear algebra?"));
                bank.add(new QTemplate("q" + c++, "A", "HARD", "PCM", "would you enjoy architecting the entire user experience flow for a complex virtual reality game?"));
                bank.add(new QTemplate("q" + c++, "S", "HARD", "PCM", "how much would you like managing an open-source coding community with thousands of global contributors?"));
                bank.add(new QTemplate("q" + c++, "E", "HARD", "PCM", "could you see yourself serving as the Chief Technology Officer (CTO) strategizing a company's cloud migration?"));
                bank.add(new QTemplate("q" + c++, "C", "HARD", "PCM", "would you enjoy strictly enforcing cybersecurity protocols and code-review standards across a global tech network?"));

                bank.add(new QTemplate("q" + c++, "R", "HARD", "PCB", "would you enjoy performing highly precise physical procedures like robotic-assisted surgery?"));
                bank.add(new QTemplate("q" + c++, "I", "HARD", "PCB", "how much do you like conducting advanced epidemiological research to track global virus mutations?"));
                bank.add(new QTemplate("q" + c++, "A", "HARD", "PCB", "could you see yourself as a cosmetic surgeon blending medical knowledge with aesthetic artistry?"));
                bank.add(new QTemplate("q" + c++, "S", "HARD", "PCB", "would you enjoy leading a psychiatric rehabilitation program for patients with severe trauma?"));
                bank.add(new QTemplate("q" + c++, "E", "HARD", "PCB", "how much would you like founding a biotech startup and securing $50 million in venture capital?"));
                bank.add(new QTemplate("q" + c++, "C", "HARD", "PCB", "could you meticulously manage the logistical supply chain of vaccines for an entire continent?"));

                bank.add(new QTemplate("q" + c++, "R", "HARD", "COMMERCE", "would you enjoy overseeing the construction and physical development of massive commercial real estate projects?"));
                bank.add(new QTemplate("q" + c++, "I", "HARD", "COMMERCE", "how much do you like structuring complex mathematical models for algorithmic high-frequency trading?"));
                bank.add(new QTemplate("q" + c++, "A", "HARD", "COMMERCE", "could you see yourself as a Creative Director dictating the global advertising strategy for a luxury car brand?"));
                bank.add(new QTemplate("q" + c++, "S", "HARD", "COMMERCE", "would you enjoy mediating international trade disputes between high-level corporate executives?"));
                bank.add(new QTemplate("q" + c++, "E", "HARD", "COMMERCE", "how much would you like aggressively expanding a multinational corporation into volatile emerging markets?"));
                bank.add(new QTemplate("q" + c++, "C", "HARD", "COMMERCE", "could you meticulously structure enterprise tax avoidance strategies using obscure holding accounts?"));

                bank.add(new QTemplate("q" + c++, "R", "HARD", "ARTS", "would you enjoy physically sculpting a massive marble monument that takes years of precise labor to complete?"));
                bank.add(new QTemplate("q" + c++, "I", "HARD", "ARTS", "how much do you like decoding forgotten ancient languages to piece together lost historical events?"));
                bank.add(new QTemplate("q" + c++, "A", "HARD", "ARTS", "could you see yourself writing and directing a critically acclaimed, high-budget Hollywood feature film?"));
                bank.add(new QTemplate("q" + c++, "S", "HARD", "ARTS", "would you enjoy working as an embedded journalist in a conflict zone to share human stories with the world?"));
                bank.add(new QTemplate("q" + c++, "E", "HARD", "ARTS", "how much would you like launching an independent music label and aggressively promoting unknown artists?"));
                bank.add(new QTemplate("q" + c++, "C", "HARD", "ARTS", "could you meticulously parse thousands of pages of centuries-old copyright law to find a legal loophole?"));


                // --- TOUGH ---
                bank.add(new QTemplate("q" + c++, "R", "TOUGH", "PCM", "would you enjoy spending 80 hours a week optimizing the physical bit-level memory allocation of a custom operating system?"));
                bank.add(new QTemplate("q" + c++, "I", "TOUGH", "PCM", "could you see yourself researching unproven quantum computing algorithms to solve unsolvable cryptographic mathematics?"));
                bank.add(new QTemplate("q" + c++, "A", "TOUGH", "PCM", "how much would you like pioneering a brand new paradigm of generative AI design that blends code with human neuroscience?"));
                bank.add(new QTemplate("q" + c++, "S", "TOUGH", "PCM", "would you enjoy resolving intense technical disputes between senior software engineers on a high-stakes enterprise project?"));
                bank.add(new QTemplate("q" + c++, "E", "TOUGH", "PCM", "could you prioritize and manage the deployment of a risky $10-million AI infrastructure upgrade while facing extreme board pressure?"));
                bank.add(new QTemplate("q" + c++, "C", "TOUGH", "PCM", "would you enjoy writing a 500-page regulatory compliance framework for autonomous vehicle decision-making logic?"));

                bank.add(new QTemplate("q" + c++, "R", "TOUGH", "PCB", "would you enjoy performing 16-hour experimental organ transplant surgeries where absolute physical endurance is required?"));
                bank.add(new QTemplate("q" + c++, "I", "TOUGH", "PCB", "could you see yourself spending decades mathematically modeling the protein folding of an incurable neurodegenerative disease?"));
                bank.add(new QTemplate("q" + c++, "A", "TOUGH", "PCB", "how much would you like pioneering a new form of bio-art that uses living genetically modified organisms as the canvas?"));
                bank.add(new QTemplate("q" + c++, "S", "TOUGH", "PCB", "would you enjoy serving as a front-line Doctor Without Borders in a region dealing with a massive viral outbreak?"));
                bank.add(new QTemplate("q" + c++, "E", "TOUGH", "PCB", "could you forcefully lobby federal lawmakers to pass controversial legislation protecting experimental stem cell research?"));
                bank.add(new QTemplate("q" + c++, "C", "TOUGH", "PCB", "would you enjoy strictly managing the triple-blind, heavily regulated, 10-year clinical trial data for a new cancer drug?"));

                bank.add(new QTemplate("q" + c++, "R", "TOUGH", "COMMERCE", "would you enjoy physically relocating every month to aggressively oversee the hostile takeover of failing factories?"));
                bank.add(new QTemplate("q" + c++, "I", "TOUGH", "COMMERCE", "could you see yourself designing derivative financial instruments so mathematically complex that almost no one understands them?"));
                bank.add(new QTemplate("q" + c++, "A", "TOUGH", "COMMERCE", "how much would you like completely rebranding a disgraced global corporation to restore public trust against all odds?"));
                bank.add(new QTemplate("q" + c++, "S", "TOUGH", "COMMERCE", "would you enjoy negotiating an incredibly tense labor strike between a furious massive union and an unforgiving CEO?"));
                bank.add(new QTemplate("q" + c++, "E", "TOUGH", "COMMERCE", "could you ruthlessly manage international trade regulations during an unprecedented global economic depression?"));
                bank.add(new QTemplate("q" + c++, "C", "TOUGH", "COMMERCE", "would you enjoy manually auditing 10 years of deeply fragmented, encrypted blockchain transactions to locate missing institutional funds?"));

                bank.add(new QTemplate("q" + c++, "R", "TOUGH", "ARTS", "would you enjoy spending isolating years in a remote workshop to physically forge a masterwork instrument by hand?"));
                bank.add(new QTemplate("q" + c++, "I", "TOUGH", "ARTS", "could you see yourself spending your career attempting to solve the linguistic mysteries of an undeciphered, ancient civilization?"));
                bank.add(new QTemplate("q" + c++, "A", "TOUGH", "ARTS", "how much would you like writing a 1,500-page literary masterpiece that forces you to confront the darkest aspects of your own psyche?"));
                bank.add(new QTemplate("q" + c++, "S", "TOUGH", "ARTS", "would you enjoy rehabilitating deeply traumatized violent criminal offenders through intensive, highly emotional art therapy?"));
                bank.add(new QTemplate("q" + c++, "E", "TOUGH", "ARTS", "could you maintain your composure while ruthlessly challenging absolute dictators by publishing highly controversial, suppressed journalism?"));
                bank.add(new QTemplate("q" + c++, "C", "TOUGH", "ARTS", "would you enjoy painstakingly preserving and digitizing a fragile archive of one million decomposing historical manuscripts?"));

"""

# Match everything between int c = 1; and // Massive Fallback
pattern = re.compile(r"int c = 1;\s*// ==========================================.*?// Massive Fallback generic generation", re.DOTALL)
new_content = pattern.sub("int c = 1;\n" + new_bank + "\n                // Massive Fallback generic generation", content)

with open("careercompass-backend/src/main/java/com/careercompass/service/RaisecService.java", "w", encoding="utf-8") as f:
    f.write(new_content)

print("Questions replaced successfully.")

