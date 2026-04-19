-- 1. Create the database
CREATE DATABASE IF NOT EXISTS careercompass;

-- Select the database
USE careercompass;

-- 2. Create the users table
CREATE TABLE IF NOT EXISTS users (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL,
    role VARCHAR(50) NOT NULL,
    grade VARCHAR(50),
    stream VARCHAR(100),
    city VARCHAR(100),
    mobile VARCHAR(20)
);

-- 3. Create the test_attempts table
CREATE TABLE IF NOT EXISTS test_attempts (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    user_id BIGINT,
    correct INT NOT NULL,
    total INT NOT NULL,
    percent DOUBLE NOT NULL,
    type VARCHAR(100),
    week_key VARCHAR(50),
    domain_scores_json TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- 4. Create the career_recommendations table
CREATE TABLE IF NOT EXISTS career_recommendations (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    user_id BIGINT,
    recommended_career VARCHAR(255) NOT NULL,
    reason TEXT,
    confidence_score DOUBLE NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- Note: Spring Boot (Hibernate) will automatically handle creating and updating these 
-- tables for you as long as 'careercompass' database exists!
