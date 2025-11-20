-- Seed quiz themes for Geography category
INSERT INTO quiz_themes (theme_key, theme_name, category, description, icon, is_active)
VALUES
('skylines', 'City Skylines', 'Geography', 'Recognize cities by their skyline', '🌆', 1),
('city-vibes', 'City Vibes', 'Geography', 'Experience the atmosphere and architecture of cities', '🏙️', 1);

-- ============================================================================
-- SKYLINES THEMED QUESTIONS
-- ============================================================================

-- Atlanta
INSERT INTO questions (type, question, category, difficulty, theme, info)
VALUES ('picture', 'Which city skyline is this?', 'Geography', 'medium', 'skylines', '{"imageUrl":"https://quizzercdn.pablomarti.dev/geography/skyline/atlanta_1024x768.webp"}');
INSERT INTO answers (question_id, answer_text, is_correct, answer_order)
SELECT (SELECT MAX(id) FROM questions), 'Charlotte', 0, 0
UNION ALL SELECT (SELECT MAX(id) FROM questions), 'Atlanta', 1, 1
UNION ALL SELECT (SELECT MAX(id) FROM questions), 'Nashville', 0, 2
UNION ALL SELECT (SELECT MAX(id) FROM questions), 'Miami', 0, 3;

-- Bangkok
INSERT INTO questions (type, question, category, difficulty, theme, info)
VALUES ('picture', 'Which city skyline is this?', 'Geography', 'medium', 'skylines', '{"imageUrl":"https://quizzercdn.pablomarti.dev/geography/skyline/bangkok_1024x768.webp"}');
INSERT INTO answers (question_id, answer_text, is_correct, answer_order)
SELECT (SELECT MAX(id) FROM questions), 'Manila', 0, 0
UNION ALL SELECT (SELECT MAX(id) FROM questions), 'Bangkok', 1, 1
UNION ALL SELECT (SELECT MAX(id) FROM questions), 'Jakarta', 0, 2
UNION ALL SELECT (SELECT MAX(id) FROM questions), 'Ho Chi Minh City', 0, 3;

-- Beijing
INSERT INTO questions (type, question, category, difficulty, theme, info)
VALUES ('picture', 'Which city skyline is this?', 'Geography', 'hard', 'skylines', '{"imageUrl":"https://quizzercdn.pablomarti.dev/geography/skyline/beijing_1024x768.webp"}');
INSERT INTO answers (question_id, answer_text, is_correct, answer_order)
SELECT (SELECT MAX(id) FROM questions), 'Shanghai', 0, 0
UNION ALL SELECT (SELECT MAX(id) FROM questions), 'Beijing', 1, 1
UNION ALL SELECT (SELECT MAX(id) FROM questions), 'Guangzhou', 0, 2
UNION ALL SELECT (SELECT MAX(id) FROM questions), 'Shenzhen', 0, 3;

-- Chicago
INSERT INTO questions (type, question, category, difficulty, theme, info)
VALUES ('picture', 'Which city skyline is this?', 'Geography', 'easy', 'skylines', '{"imageUrl":"https://quizzercdn.pablomarti.dev/geography/skyline/chicago_1024x768.webp"}');
INSERT INTO answers (question_id, answer_text, is_correct, answer_order)
SELECT (SELECT MAX(id) FROM questions), 'New York', 0, 0
UNION ALL SELECT (SELECT MAX(id) FROM questions), 'Chicago', 1, 1
UNION ALL SELECT (SELECT MAX(id) FROM questions), 'Toronto', 0, 2
UNION ALL SELECT (SELECT MAX(id) FROM questions), 'Boston', 0, 3;

-- Chicago 2
INSERT INTO questions (type, question, category, difficulty, theme, info)
VALUES ('picture', 'Which city skyline is this?', 'Geography', 'easy', 'skylines', '{"imageUrl":"https://quizzercdn.pablomarti.dev/geography/skyline/chicago2_1024x768.webp"}');
INSERT INTO answers (question_id, answer_text, is_correct, answer_order)
SELECT (SELECT MAX(id) FROM questions), 'Toronto', 0, 0
UNION ALL SELECT (SELECT MAX(id) FROM questions), 'Chicago', 1, 1
UNION ALL SELECT (SELECT MAX(id) FROM questions), 'Seattle', 0, 2
UNION ALL SELECT (SELECT MAX(id) FROM questions), 'Detroit', 0, 3;

-- Doha
INSERT INTO questions (type, question, category, difficulty, theme, info)
VALUES ('picture', 'Which city skyline is this?', 'Geography', 'hard', 'skylines', '{"imageUrl":"https://quizzercdn.pablomarti.dev/geography/skyline/doha_1024x768.webp"}');
INSERT INTO answers (question_id, answer_text, is_correct, answer_order)
SELECT (SELECT MAX(id) FROM questions), 'Dubai', 0, 0
UNION ALL SELECT (SELECT MAX(id) FROM questions), 'Doha', 1, 1
UNION ALL SELECT (SELECT MAX(id) FROM questions), 'Abu Dhabi', 0, 2
UNION ALL SELECT (SELECT MAX(id) FROM questions), 'Manama', 0, 3;

-- Dubai
INSERT INTO questions (type, question, category, difficulty, theme, info)
VALUES ('picture', 'Which city skyline is this?', 'Geography', 'medium', 'skylines', '{"imageUrl":"https://quizzercdn.pablomarti.dev/geography/skyline/dubai_1024x768.webp"}');
INSERT INTO answers (question_id, answer_text, is_correct, answer_order)
SELECT (SELECT MAX(id) FROM questions), 'Abu Dhabi', 0, 0
UNION ALL SELECT (SELECT MAX(id) FROM questions), 'Dubai', 1, 1
UNION ALL SELECT (SELECT MAX(id) FROM questions), 'Doha', 0, 2
UNION ALL SELECT (SELECT MAX(id) FROM questions), 'Kuwait City', 0, 3;

-- Dubai 4
INSERT INTO questions (type, question, category, difficulty, theme, info)
VALUES ('picture', 'Which city skyline is this?', 'Geography', 'medium', 'skylines', '{"imageUrl":"https://quizzercdn.pablomarti.dev/geography/skyline/dubai4_1024x768.webp"}');
INSERT INTO answers (question_id, answer_text, is_correct, answer_order)
SELECT (SELECT MAX(id) FROM questions), 'Doha', 0, 0
UNION ALL SELECT (SELECT MAX(id) FROM questions), 'Dubai', 1, 1
UNION ALL SELECT (SELECT MAX(id) FROM questions), 'Abu Dhabi', 0, 2
UNION ALL SELECT (SELECT MAX(id) FROM questions), 'Riyadh', 0, 3;

-- Dubai 5
INSERT INTO questions (type, question, category, difficulty, theme, info)
VALUES ('picture', 'Which city skyline is this?', 'Geography', 'medium', 'skylines', '{"imageUrl":"https://quizzercdn.pablomarti.dev/geography/skyline/dubai5_1024x768.webp"}');
INSERT INTO answers (question_id, answer_text, is_correct, answer_order)
SELECT (SELECT MAX(id) FROM questions), 'Abu Dhabi', 0, 0
UNION ALL SELECT (SELECT MAX(id) FROM questions), 'Dubai', 1, 1
UNION ALL SELECT (SELECT MAX(id) FROM questions), 'Manama', 0, 2
UNION ALL SELECT (SELECT MAX(id) FROM questions), 'Doha', 0, 3;

-- Hong Kong 2
INSERT INTO questions (type, question, category, difficulty, theme, info)
VALUES ('picture', 'Which city skyline is this?', 'Geography', 'medium', 'skylines', '{"imageUrl":"https://quizzercdn.pablomarti.dev/geography/skyline/hong-kong2_1024x768.webp"}');
INSERT INTO answers (question_id, answer_text, is_correct, answer_order)
SELECT (SELECT MAX(id) FROM questions), 'Singapore', 0, 0
UNION ALL SELECT (SELECT MAX(id) FROM questions), 'Hong Kong', 1, 1
UNION ALL SELECT (SELECT MAX(id) FROM questions), 'Shanghai', 0, 2
UNION ALL SELECT (SELECT MAX(id) FROM questions), 'Shenzhen', 0, 3;

-- Hong Kong 3
INSERT INTO questions (type, question, category, difficulty, theme, info)
VALUES ('picture', 'Which city skyline is this?', 'Geography', 'medium', 'skylines', '{"imageUrl":"https://quizzercdn.pablomarti.dev/geography/skyline/hong-kong3_1024x768.webp"}');
INSERT INTO answers (question_id, answer_text, is_correct, answer_order)
SELECT (SELECT MAX(id) FROM questions), 'Macau', 0, 0
UNION ALL SELECT (SELECT MAX(id) FROM questions), 'Hong Kong', 1, 1
UNION ALL SELECT (SELECT MAX(id) FROM questions), 'Singapore', 0, 2
UNION ALL SELECT (SELECT MAX(id) FROM questions), 'Shanghai', 0, 3;

-- Hong Kong 4
INSERT INTO questions (type, question, category, difficulty, theme, info)
VALUES ('picture', 'Which city skyline is this?', 'Geography', 'medium', 'skylines', '{"imageUrl":"https://quizzercdn.pablomarti.dev/geography/skyline/hong-kong4_1024x768.webp"}');
INSERT INTO answers (question_id, answer_text, is_correct, answer_order)
SELECT (SELECT MAX(id) FROM questions), 'Shenzhen', 0, 0
UNION ALL SELECT (SELECT MAX(id) FROM questions), 'Hong Kong', 1, 1
UNION ALL SELECT (SELECT MAX(id) FROM questions), 'Singapore', 0, 2
UNION ALL SELECT (SELECT MAX(id) FROM questions), 'Taipei', 0, 3;

-- Kuala Lumpur
INSERT INTO questions (type, question, category, difficulty, theme, info)
VALUES ('picture', 'Which city skyline is this?', 'Geography', 'medium', 'skylines', '{"imageUrl":"https://quizzercdn.pablomarti.dev/geography/skyline/kuala-lumpur_1024x768.webp"}');
INSERT INTO answers (question_id, answer_text, is_correct, answer_order)
SELECT (SELECT MAX(id) FROM questions), 'Singapore', 0, 0
UNION ALL SELECT (SELECT MAX(id) FROM questions), 'Kuala Lumpur', 1, 1
UNION ALL SELECT (SELECT MAX(id) FROM questions), 'Bangkok', 0, 2
UNION ALL SELECT (SELECT MAX(id) FROM questions), 'Jakarta', 0, 3;

-- Kuala Lumpur 2
INSERT INTO questions (type, question, category, difficulty, theme, info)
VALUES ('picture', 'Which city skyline is this?', 'Geography', 'medium', 'skylines', '{"imageUrl":"https://quizzercdn.pablomarti.dev/geography/skyline/kuala-lumpur2_1024x768.webp"}');
INSERT INTO answers (question_id, answer_text, is_correct, answer_order)
SELECT (SELECT MAX(id) FROM questions), 'Bangkok', 0, 0
UNION ALL SELECT (SELECT MAX(id) FROM questions), 'Kuala Lumpur', 1, 1
UNION ALL SELECT (SELECT MAX(id) FROM questions), 'Singapore', 0, 2
UNION ALL SELECT (SELECT MAX(id) FROM questions), 'Manila', 0, 3;

-- London 3
INSERT INTO questions (type, question, category, difficulty, theme, info)
VALUES ('picture', 'Which city skyline is this?', 'Geography', 'easy', 'skylines', '{"imageUrl":"https://quizzercdn.pablomarti.dev/geography/skyline/london3_768x1024.webp"}');
INSERT INTO answers (question_id, answer_text, is_correct, answer_order)
SELECT (SELECT MAX(id) FROM questions), 'Manchester', 0, 0
UNION ALL SELECT (SELECT MAX(id) FROM questions), 'London', 1, 1
UNION ALL SELECT (SELECT MAX(id) FROM questions), 'Birmingham', 0, 2
UNION ALL SELECT (SELECT MAX(id) FROM questions), 'Liverpool', 0, 3;

-- Melbourne
INSERT INTO questions (type, question, category, difficulty, theme, info)
VALUES ('picture', 'Which city skyline is this?', 'Geography', 'medium', 'skylines', '{"imageUrl":"https://quizzercdn.pablomarti.dev/geography/skyline/melbourne_1024x768.webp"}');
INSERT INTO answers (question_id, answer_text, is_correct, answer_order)
SELECT (SELECT MAX(id) FROM questions), 'Sydney', 0, 0
UNION ALL SELECT (SELECT MAX(id) FROM questions), 'Melbourne', 1, 1
UNION ALL SELECT (SELECT MAX(id) FROM questions), 'Brisbane', 0, 2
UNION ALL SELECT (SELECT MAX(id) FROM questions), 'Auckland', 0, 3;

-- Mexico City
INSERT INTO questions (type, question, category, difficulty, theme, info)
VALUES ('picture', 'Which city skyline is this?', 'Geography', 'hard', 'skylines', '{"imageUrl":"https://quizzercdn.pablomarti.dev/geography/skyline/mexico-city_1024x768.webp"}');
INSERT INTO answers (question_id, answer_text, is_correct, answer_order)
SELECT (SELECT MAX(id) FROM questions), 'Guadalajara', 0, 0
UNION ALL SELECT (SELECT MAX(id) FROM questions), 'Mexico City', 1, 1
UNION ALL SELECT (SELECT MAX(id) FROM questions), 'Monterrey', 0, 2
UNION ALL SELECT (SELECT MAX(id) FROM questions), 'Bogotá', 0, 3;

-- Milan
INSERT INTO questions (type, question, category, difficulty, theme, info)
VALUES ('picture', 'Which city skyline is this?', 'Geography', 'hard', 'skylines', '{"imageUrl":"https://quizzercdn.pablomarti.dev/geography/skyline/milan_1024x768.webp"}');
INSERT INTO answers (question_id, answer_text, is_correct, answer_order)
SELECT (SELECT MAX(id) FROM questions), 'Turin', 0, 0
UNION ALL SELECT (SELECT MAX(id) FROM questions), 'Milan', 1, 1
UNION ALL SELECT (SELECT MAX(id) FROM questions), 'Bologna', 0, 2
UNION ALL SELECT (SELECT MAX(id) FROM questions), 'Rome', 0, 3;

-- New York
INSERT INTO questions (type, question, category, difficulty, theme, info)
VALUES ('picture', 'Which city skyline is this?', 'Geography', 'easy', 'skylines', '{"imageUrl":"https://quizzercdn.pablomarti.dev/geography/skyline/new-york_1024x768.webp"}');
INSERT INTO answers (question_id, answer_text, is_correct, answer_order)
SELECT (SELECT MAX(id) FROM questions), 'Chicago', 0, 0
UNION ALL SELECT (SELECT MAX(id) FROM questions), 'New York', 1, 1
UNION ALL SELECT (SELECT MAX(id) FROM questions), 'Toronto', 0, 2
UNION ALL SELECT (SELECT MAX(id) FROM questions), 'Boston', 0, 3;

-- New York 3
INSERT INTO questions (type, question, category, difficulty, theme, info)
VALUES ('picture', 'Which city skyline is this?', 'Geography', 'easy', 'skylines', '{"imageUrl":"https://quizzercdn.pablomarti.dev/geography/skyline/new-york3_1024x768.webp"}');
INSERT INTO answers (question_id, answer_text, is_correct, answer_order)
SELECT (SELECT MAX(id) FROM questions), 'Boston', 0, 0
UNION ALL SELECT (SELECT MAX(id) FROM questions), 'New York', 1, 1
UNION ALL SELECT (SELECT MAX(id) FROM questions), 'Chicago', 0, 2
UNION ALL SELECT (SELECT MAX(id) FROM questions), 'Philadelphia', 0, 3;

-- New York 4
INSERT INTO questions (type, question, category, difficulty, theme, info)
VALUES ('picture', 'Which city skyline is this?', 'Geography', 'easy', 'skylines', '{"imageUrl":"https://quizzercdn.pablomarti.dev/geography/skyline/new-york4_1024x768.webp"}');
INSERT INTO answers (question_id, answer_text, is_correct, answer_order)
SELECT (SELECT MAX(id) FROM questions), 'Toronto', 0, 0
UNION ALL SELECT (SELECT MAX(id) FROM questions), 'New York', 1, 1
UNION ALL SELECT (SELECT MAX(id) FROM questions), 'Chicago', 0, 2
UNION ALL SELECT (SELECT MAX(id) FROM questions), 'Seattle', 0, 3;

-- Paris 4
INSERT INTO questions (type, question, category, difficulty, theme, info)
VALUES ('picture', 'Which city skyline is this?', 'Geography', 'medium', 'skylines', '{"imageUrl":"https://quizzercdn.pablomarti.dev/geography/skyline/paris4_1024x768.webp"}');
INSERT INTO answers (question_id, answer_text, is_correct, answer_order)
SELECT (SELECT MAX(id) FROM questions), 'Lyon', 0, 0
UNION ALL SELECT (SELECT MAX(id) FROM questions), 'Paris', 1, 1
UNION ALL SELECT (SELECT MAX(id) FROM questions), 'Brussels', 0, 2
UNION ALL SELECT (SELECT MAX(id) FROM questions), 'Amsterdam', 0, 3;

-- San Francisco
INSERT INTO questions (type, question, category, difficulty, theme, info)
VALUES ('picture', 'Which city skyline is this?', 'Geography', 'medium', 'skylines', '{"imageUrl":"https://quizzercdn.pablomarti.dev/geography/skyline/san-francisco_1024x768.webp"}');
INSERT INTO answers (question_id, answer_text, is_correct, answer_order)
SELECT (SELECT MAX(id) FROM questions), 'Seattle', 0, 0
UNION ALL SELECT (SELECT MAX(id) FROM questions), 'San Francisco', 1, 1
UNION ALL SELECT (SELECT MAX(id) FROM questions), 'Los Angeles', 0, 2
UNION ALL SELECT (SELECT MAX(id) FROM questions), 'Oakland', 0, 3;

-- São Paulo
INSERT INTO questions (type, question, category, difficulty, theme, info)
VALUES ('picture', 'Which city skyline is this?', 'Geography', 'hard', 'skylines', '{"imageUrl":"https://quizzercdn.pablomarti.dev/geography/skyline/sao-paulo_1024x768.webp"}');
INSERT INTO answers (question_id, answer_text, is_correct, answer_order)
SELECT (SELECT MAX(id) FROM questions), 'Rio de Janeiro', 0, 0
UNION ALL SELECT (SELECT MAX(id) FROM questions), 'São Paulo', 1, 1
UNION ALL SELECT (SELECT MAX(id) FROM questions), 'Buenos Aires', 0, 2
UNION ALL SELECT (SELECT MAX(id) FROM questions), 'Santiago', 0, 3;

-- Seattle
INSERT INTO questions (type, question, category, difficulty, theme, info)
VALUES ('picture', 'Which city skyline is this?', 'Geography', 'medium', 'skylines', '{"imageUrl":"https://quizzercdn.pablomarti.dev/geography/skyline/seattle_1024x768.webp"}');
INSERT INTO answers (question_id, answer_text, is_correct, answer_order)
SELECT (SELECT MAX(id) FROM questions), 'San Francisco', 0, 0
UNION ALL SELECT (SELECT MAX(id) FROM questions), 'Seattle', 1, 1
UNION ALL SELECT (SELECT MAX(id) FROM questions), 'Portland', 0, 2
UNION ALL SELECT (SELECT MAX(id) FROM questions), 'Vancouver', 0, 3;

-- Shanghai
INSERT INTO questions (type, question, category, difficulty, theme, info)
VALUES ('picture', 'Which city skyline is this?', 'Geography', 'medium', 'skylines', '{"imageUrl":"https://quizzercdn.pablomarti.dev/geography/skyline/shangai_1024x768.webp"}');
INSERT INTO answers (question_id, answer_text, is_correct, answer_order)
SELECT (SELECT MAX(id) FROM questions), 'Hong Kong', 0, 0
UNION ALL SELECT (SELECT MAX(id) FROM questions), 'Shanghai', 1, 1
UNION ALL SELECT (SELECT MAX(id) FROM questions), 'Guangzhou', 0, 2
UNION ALL SELECT (SELECT MAX(id) FROM questions), 'Shenzhen', 0, 3;

-- Shanghai 2
INSERT INTO questions (type, question, category, difficulty, theme, info)
VALUES ('picture', 'Which city skyline is this?', 'Geography', 'medium', 'skylines', '{"imageUrl":"https://quizzercdn.pablomarti.dev/geography/skyline/shangai2_1024x768.webp"}');
INSERT INTO answers (question_id, answer_text, is_correct, answer_order)
SELECT (SELECT MAX(id) FROM questions), 'Guangzhou', 0, 0
UNION ALL SELECT (SELECT MAX(id) FROM questions), 'Shanghai', 1, 1
UNION ALL SELECT (SELECT MAX(id) FROM questions), 'Hong Kong', 0, 2
UNION ALL SELECT (SELECT MAX(id) FROM questions), 'Beijing', 0, 3;

-- Shanghai 3
INSERT INTO questions (type, question, category, difficulty, theme, info)
VALUES ('picture', 'Which city skyline is this?', 'Geography', 'medium', 'skylines', '{"imageUrl":"https://quizzercdn.pablomarti.dev/geography/skyline/shangai3_1024x768.webp"}');
INSERT INTO answers (question_id, answer_text, is_correct, answer_order)
SELECT (SELECT MAX(id) FROM questions), 'Shenzhen', 0, 0
UNION ALL SELECT (SELECT MAX(id) FROM questions), 'Shanghai', 1, 1
UNION ALL SELECT (SELECT MAX(id) FROM questions), 'Hong Kong', 0, 2
UNION ALL SELECT (SELECT MAX(id) FROM questions), 'Guangzhou', 0, 3;

-- Singapore
INSERT INTO questions (type, question, category, difficulty, theme, info)
VALUES ('picture', 'Which city skyline is this?', 'Geography', 'medium', 'skylines', '{"imageUrl":"https://quizzercdn.pablomarti.dev/geography/skyline/singapore_1024x768.webp"}');
INSERT INTO answers (question_id, answer_text, is_correct, answer_order)
SELECT (SELECT MAX(id) FROM questions), 'Hong Kong', 0, 0
UNION ALL SELECT (SELECT MAX(id) FROM questions), 'Singapore', 1, 1
UNION ALL SELECT (SELECT MAX(id) FROM questions), 'Kuala Lumpur', 0, 2
UNION ALL SELECT (SELECT MAX(id) FROM questions), 'Bangkok', 0, 3;

-- Singapore 2
INSERT INTO questions (type, question, category, difficulty, theme, info)
VALUES ('picture', 'Which city skyline is this?', 'Geography', 'medium', 'skylines', '{"imageUrl":"https://quizzercdn.pablomarti.dev/geography/skyline/singapore2_1024x768.webp"}');
INSERT INTO answers (question_id, answer_text, is_correct, answer_order)
SELECT (SELECT MAX(id) FROM questions), 'Kuala Lumpur', 0, 0
UNION ALL SELECT (SELECT MAX(id) FROM questions), 'Singapore', 1, 1
UNION ALL SELECT (SELECT MAX(id) FROM questions), 'Hong Kong', 0, 2
UNION ALL SELECT (SELECT MAX(id) FROM questions), 'Dubai', 0, 3;

-- Tokyo
INSERT INTO questions (type, question, category, difficulty, theme, info)
VALUES ('picture', 'Which city skyline is this?', 'Geography', 'medium', 'skylines', '{"imageUrl":"https://quizzercdn.pablomarti.dev/geography/skyline/tokyo_1024x768.webp"}');
INSERT INTO answers (question_id, answer_text, is_correct, answer_order)
SELECT (SELECT MAX(id) FROM questions), 'Osaka', 0, 0
UNION ALL SELECT (SELECT MAX(id) FROM questions), 'Tokyo', 1, 1
UNION ALL SELECT (SELECT MAX(id) FROM questions), 'Seoul', 0, 2
UNION ALL SELECT (SELECT MAX(id) FROM questions), 'Yokohama', 0, 3;

-- Toronto
INSERT INTO questions (type, question, category, difficulty, theme, info)
VALUES ('picture', 'Which city skyline is this?', 'Geography', 'medium', 'skylines', '{"imageUrl":"https://quizzercdn.pablomarti.dev/geography/skyline/toronto_1024x768.webp"}');
INSERT INTO answers (question_id, answer_text, is_correct, answer_order)
SELECT (SELECT MAX(id) FROM questions), 'Chicago', 0, 0
UNION ALL SELECT (SELECT MAX(id) FROM questions), 'Toronto', 1, 1
UNION ALL SELECT (SELECT MAX(id) FROM questions), 'Montreal', 0, 2
UNION ALL SELECT (SELECT MAX(id) FROM questions), 'Seattle', 0, 3;

-- ============================================================================
-- CITY-VIBES THEMED QUESTIONS
-- ============================================================================

-- Amsterdam
INSERT INTO questions (type, question, category, difficulty, theme, info)
VALUES ('picture', 'Which city does this vibe belong to?', 'Geography', 'medium', 'city-vibes', '{"imageUrl":"https://quizzercdn.pablomarti.dev/geography/city-vibes/amsterdam_1024x768.webp"}');
INSERT INTO answers (question_id, answer_text, is_correct, answer_order)
SELECT (SELECT MAX(id) FROM questions), 'Utrecht', 0, 0
UNION ALL SELECT (SELECT MAX(id) FROM questions), 'Amsterdam', 1, 1
UNION ALL SELECT (SELECT MAX(id) FROM questions), 'Bruges', 0, 2
UNION ALL SELECT (SELECT MAX(id) FROM questions), 'Copenhagen', 0, 3;

-- Amsterdam 2
INSERT INTO questions (type, question, category, difficulty, theme, info)
VALUES ('picture', 'Which city does this vibe belong to?', 'Geography', 'medium', 'city-vibes', '{"imageUrl":"https://quizzercdn.pablomarti.dev/geography/city-vibes/amsterdam2_1024x768.webp"}');
INSERT INTO answers (question_id, answer_text, is_correct, answer_order)
SELECT (SELECT MAX(id) FROM questions), 'Bruges', 0, 0
UNION ALL SELECT (SELECT MAX(id) FROM questions), 'Amsterdam', 1, 1
UNION ALL SELECT (SELECT MAX(id) FROM questions), 'Utrecht', 0, 2
UNION ALL SELECT (SELECT MAX(id) FROM questions), 'Ghent', 0, 3;

-- Amsterdam 3
INSERT INTO questions (type, question, category, difficulty, theme, info)
VALUES ('picture', 'Which city does this vibe belong to?', 'Geography', 'medium', 'city-vibes', '{"imageUrl":"https://quizzercdn.pablomarti.dev/geography/city-vibes/amsterdam3_768x1024.webp"}');
INSERT INTO answers (question_id, answer_text, is_correct, answer_order)
SELECT (SELECT MAX(id) FROM questions), 'Copenhagen', 0, 0
UNION ALL SELECT (SELECT MAX(id) FROM questions), 'Amsterdam', 1, 1
UNION ALL SELECT (SELECT MAX(id) FROM questions), 'Bruges', 0, 2
UNION ALL SELECT (SELECT MAX(id) FROM questions), 'Utrecht', 0, 3;

-- Amsterdam 4
INSERT INTO questions (type, question, category, difficulty, theme, info)
VALUES ('picture', 'Which city does this vibe belong to?', 'Geography', 'medium', 'city-vibes', '{"imageUrl":"https://quizzercdn.pablomarti.dev/geography/city-vibes/amsterdam4_768x1024.webp"}');
INSERT INTO answers (question_id, answer_text, is_correct, answer_order)
SELECT (SELECT MAX(id) FROM questions), 'Utrecht', 0, 0
UNION ALL SELECT (SELECT MAX(id) FROM questions), 'Amsterdam', 1, 1
UNION ALL SELECT (SELECT MAX(id) FROM questions), 'Leiden', 0, 2
UNION ALL SELECT (SELECT MAX(id) FROM questions), 'Haarlem', 0, 3;

-- Antalya
INSERT INTO questions (type, question, category, difficulty, theme, info)
VALUES ('picture', 'Which city does this vibe belong to?', 'Geography', 'hard', 'city-vibes', '{"imageUrl":"https://quizzercdn.pablomarti.dev/geography/city-vibes/antalya_768x1024.webp"}');
INSERT INTO answers (question_id, answer_text, is_correct, answer_order)
SELECT (SELECT MAX(id) FROM questions), 'Izmir', 0, 0
UNION ALL SELECT (SELECT MAX(id) FROM questions), 'Antalya', 1, 1
UNION ALL SELECT (SELECT MAX(id) FROM questions), 'Bodrum', 0, 2
UNION ALL SELECT (SELECT MAX(id) FROM questions), 'Alanya', 0, 3;

-- Bangkok 2
INSERT INTO questions (type, question, category, difficulty, theme, info)
VALUES ('picture', 'Which city does this vibe belong to?', 'Geography', 'medium', 'city-vibes', '{"imageUrl":"https://quizzercdn.pablomarti.dev/geography/city-vibes/bangkok2_768x1024.webp"}');
INSERT INTO answers (question_id, answer_text, is_correct, answer_order)
SELECT (SELECT MAX(id) FROM questions), 'Chiang Mai', 0, 0
UNION ALL SELECT (SELECT MAX(id) FROM questions), 'Bangkok', 1, 1
UNION ALL SELECT (SELECT MAX(id) FROM questions), 'Ho Chi Minh City', 0, 2
UNION ALL SELECT (SELECT MAX(id) FROM questions), 'Hanoi', 0, 3;

-- Berlin
INSERT INTO questions (type, question, category, difficulty, theme, info)
VALUES ('picture', 'Which city does this vibe belong to?', 'Geography', 'medium', 'city-vibes', '{"imageUrl":"https://quizzercdn.pablomarti.dev/geography/city-vibes/berlin_768x1024.webp"}');
INSERT INTO answers (question_id, answer_text, is_correct, answer_order)
SELECT (SELECT MAX(id) FROM questions), 'Munich', 0, 0
UNION ALL SELECT (SELECT MAX(id) FROM questions), 'Berlin', 1, 1
UNION ALL SELECT (SELECT MAX(id) FROM questions), 'Hamburg', 0, 2
UNION ALL SELECT (SELECT MAX(id) FROM questions), 'Dresden', 0, 3;

-- Bologna
INSERT INTO questions (type, question, category, difficulty, theme, info)
VALUES ('picture', 'Which city does this vibe belong to?', 'Geography', 'hard', 'city-vibes', '{"imageUrl":"https://quizzercdn.pablomarti.dev/geography/city-vibes/bologna_768x1024.webp"}');
INSERT INTO answers (question_id, answer_text, is_correct, answer_order)
SELECT (SELECT MAX(id) FROM questions), 'Modena', 0, 0
UNION ALL SELECT (SELECT MAX(id) FROM questions), 'Bologna', 1, 1
UNION ALL SELECT (SELECT MAX(id) FROM questions), 'Parma', 0, 2
UNION ALL SELECT (SELECT MAX(id) FROM questions), 'Florence', 0, 3;

-- Bratislava
INSERT INTO questions (type, question, category, difficulty, theme, info)
VALUES ('picture', 'Which city does this vibe belong to?', 'Geography', 'hard', 'city-vibes', '{"imageUrl":"https://quizzercdn.pablomarti.dev/geography/city-vibes/bratislava_768x1024.webp"}');
INSERT INTO answers (question_id, answer_text, is_correct, answer_order)
SELECT (SELECT MAX(id) FROM questions), 'Prague', 0, 0
UNION ALL SELECT (SELECT MAX(id) FROM questions), 'Bratislava', 1, 1
UNION ALL SELECT (SELECT MAX(id) FROM questions), 'Budapest', 0, 2
UNION ALL SELECT (SELECT MAX(id) FROM questions), 'Vienna', 0, 3;

-- Budapest
INSERT INTO questions (type, question, category, difficulty, theme, info)
VALUES ('picture', 'Which city does this vibe belong to?', 'Geography', 'medium', 'city-vibes', '{"imageUrl":"https://quizzercdn.pablomarti.dev/geography/city-vibes/budapest_1024x768.webp"}');
INSERT INTO answers (question_id, answer_text, is_correct, answer_order)
SELECT (SELECT MAX(id) FROM questions), 'Vienna', 0, 0
UNION ALL SELECT (SELECT MAX(id) FROM questions), 'Budapest', 1, 1
UNION ALL SELECT (SELECT MAX(id) FROM questions), 'Prague', 0, 2
UNION ALL SELECT (SELECT MAX(id) FROM questions), 'Bratislava', 0, 3;

-- Burano
INSERT INTO questions (type, question, category, difficulty, theme, info)
VALUES ('picture', 'Which city does this vibe belong to?', 'Geography', 'hard', 'city-vibes', '{"imageUrl":"https://quizzercdn.pablomarti.dev/geography/city-vibes/burano_1024x768.webp"}');
INSERT INTO answers (question_id, answer_text, is_correct, answer_order)
SELECT (SELECT MAX(id) FROM questions), 'Venice', 0, 0
UNION ALL SELECT (SELECT MAX(id) FROM questions), 'Burano', 1, 1
UNION ALL SELECT (SELECT MAX(id) FROM questions), 'Murano', 0, 2
UNION ALL SELECT (SELECT MAX(id) FROM questions), 'Procida', 0, 3;

-- Chicago 3
INSERT INTO questions (type, question, category, difficulty, theme, info)
VALUES ('picture', 'Which city does this vibe belong to?', 'Geography', 'medium', 'city-vibes', '{"imageUrl":"https://quizzercdn.pablomarti.dev/geography/city-vibes/chicago3_1024x768.webp"}');
INSERT INTO answers (question_id, answer_text, is_correct, answer_order)
SELECT (SELECT MAX(id) FROM questions), 'Detroit', 0, 0
UNION ALL SELECT (SELECT MAX(id) FROM questions), 'Chicago', 1, 1
UNION ALL SELECT (SELECT MAX(id) FROM questions), 'Milwaukee', 0, 2
UNION ALL SELECT (SELECT MAX(id) FROM questions), 'Cleveland', 0, 3;

-- Chicago 4
INSERT INTO questions (type, question, category, difficulty, theme, info)
VALUES ('picture', 'Which city does this vibe belong to?', 'Geography', 'medium', 'city-vibes', '{"imageUrl":"https://quizzercdn.pablomarti.dev/geography/city-vibes/chicago4_1024x768.webp"}');
INSERT INTO answers (question_id, answer_text, is_correct, answer_order)
SELECT (SELECT MAX(id) FROM questions), 'Milwaukee', 0, 0
UNION ALL SELECT (SELECT MAX(id) FROM questions), 'Chicago', 1, 1
UNION ALL SELECT (SELECT MAX(id) FROM questions), 'Detroit', 0, 2
UNION ALL SELECT (SELECT MAX(id) FROM questions), 'Minneapolis', 0, 3;

-- Dubai 2
INSERT INTO questions (type, question, category, difficulty, theme, info)
VALUES ('picture', 'Which city does this vibe belong to?', 'Geography', 'medium', 'city-vibes', '{"imageUrl":"https://quizzercdn.pablomarti.dev/geography/city-vibes/dubai2_1024x768.webp"}');
INSERT INTO answers (question_id, answer_text, is_correct, answer_order)
SELECT (SELECT MAX(id) FROM questions), 'Abu Dhabi', 0, 0
UNION ALL SELECT (SELECT MAX(id) FROM questions), 'Dubai', 1, 1
UNION ALL SELECT (SELECT MAX(id) FROM questions), 'Doha', 0, 2
UNION ALL SELECT (SELECT MAX(id) FROM questions), 'Sharjah', 0, 3;

-- Dublin
INSERT INTO questions (type, question, category, difficulty, theme, info)
VALUES ('picture', 'Which city does this vibe belong to?', 'Geography', 'medium', 'city-vibes', '{"imageUrl":"https://quizzercdn.pablomarti.dev/geography/city-vibes/dublin_1024x768.webp"}');
INSERT INTO answers (question_id, answer_text, is_correct, answer_order)
SELECT (SELECT MAX(id) FROM questions), 'Cork', 0, 0
UNION ALL SELECT (SELECT MAX(id) FROM questions), 'Dublin', 1, 1
UNION ALL SELECT (SELECT MAX(id) FROM questions), 'Edinburgh', 0, 2
UNION ALL SELECT (SELECT MAX(id) FROM questions), 'Belfast', 0, 3;

-- Guangzhou
INSERT INTO questions (type, question, category, difficulty, theme, info)
VALUES ('picture', 'Which city does this vibe belong to?', 'Geography', 'hard', 'city-vibes', '{"imageUrl":"https://quizzercdn.pablomarti.dev/geography/city-vibes/guanzhou_1024x768.webp"}');
INSERT INTO answers (question_id, answer_text, is_correct, answer_order)
SELECT (SELECT MAX(id) FROM questions), 'Shenzhen', 0, 0
UNION ALL SELECT (SELECT MAX(id) FROM questions), 'Guangzhou', 1, 1
UNION ALL SELECT (SELECT MAX(id) FROM questions), 'Hangzhou', 0, 2
UNION ALL SELECT (SELECT MAX(id) FROM questions), 'Xiamen', 0, 3;

-- Hong Kong
INSERT INTO questions (type, question, category, difficulty, theme, info)
VALUES ('picture', 'Which city does this vibe belong to?', 'Geography', 'medium', 'city-vibes', '{"imageUrl":"https://quizzercdn.pablomarti.dev/geography/city-vibes/hong-kong_1024x768.webp"}');
INSERT INTO answers (question_id, answer_text, is_correct, answer_order)
SELECT (SELECT MAX(id) FROM questions), 'Macau', 0, 0
UNION ALL SELECT (SELECT MAX(id) FROM questions), 'Hong Kong', 1, 1
UNION ALL SELECT (SELECT MAX(id) FROM questions), 'Shenzhen', 0, 2
UNION ALL SELECT (SELECT MAX(id) FROM questions), 'Singapore', 0, 3;

-- Istanbul
INSERT INTO questions (type, question, category, difficulty, theme, info)
VALUES ('picture', 'Which city does this vibe belong to?', 'Geography', 'medium', 'city-vibes', '{"imageUrl":"https://quizzercdn.pablomarti.dev/geography/city-vibes/istanbul_1024x768.webp"}');
INSERT INTO answers (question_id, answer_text, is_correct, answer_order)
SELECT (SELECT MAX(id) FROM questions), 'Izmir', 0, 0
UNION ALL SELECT (SELECT MAX(id) FROM questions), 'Istanbul', 1, 1
UNION ALL SELECT (SELECT MAX(id) FROM questions), 'Athens', 0, 2
UNION ALL SELECT (SELECT MAX(id) FROM questions), 'Ankara', 0, 3;

-- Istanbul 3
INSERT INTO questions (type, question, category, difficulty, theme, info)
VALUES ('picture', 'Which city does this vibe belong to?', 'Geography', 'medium', 'city-vibes', '{"imageUrl":"https://quizzercdn.pablomarti.dev/geography/city-vibes/istanbul3_1024x768.webp"}');
INSERT INTO answers (question_id, answer_text, is_correct, answer_order)
SELECT (SELECT MAX(id) FROM questions), 'Athens', 0, 0
UNION ALL SELECT (SELECT MAX(id) FROM questions), 'Istanbul', 1, 1
UNION ALL SELECT (SELECT MAX(id) FROM questions), 'Izmir', 0, 2
UNION ALL SELECT (SELECT MAX(id) FROM questions), 'Bursa', 0, 3;

-- Istanbul 4
INSERT INTO questions (type, question, category, difficulty, theme, info)
VALUES ('picture', 'Which city does this vibe belong to?', 'Geography', 'medium', 'city-vibes', '{"imageUrl":"https://quizzercdn.pablomarti.dev/geography/city-vibes/istanbul4_1024x768.webp"}');
INSERT INTO answers (question_id, answer_text, is_correct, answer_order)
SELECT (SELECT MAX(id) FROM questions), 'Ankara', 0, 0
UNION ALL SELECT (SELECT MAX(id) FROM questions), 'Istanbul', 1, 1
UNION ALL SELECT (SELECT MAX(id) FROM questions), 'Izmir', 0, 2
UNION ALL SELECT (SELECT MAX(id) FROM questions), 'Athens', 0, 3;

-- London
INSERT INTO questions (type, question, category, difficulty, theme, info)
VALUES ('picture', 'Which city does this vibe belong to?', 'Geography', 'easy', 'city-vibes', '{"imageUrl":"https://quizzercdn.pablomarti.dev/geography/city-vibes/london_1024x768.webp"}');
INSERT INTO answers (question_id, answer_text, is_correct, answer_order)
SELECT (SELECT MAX(id) FROM questions), 'Edinburgh', 0, 0
UNION ALL SELECT (SELECT MAX(id) FROM questions), 'London', 1, 1
UNION ALL SELECT (SELECT MAX(id) FROM questions), 'Manchester', 0, 2
UNION ALL SELECT (SELECT MAX(id) FROM questions), 'Dublin', 0, 3;

-- London 4
INSERT INTO questions (type, question, category, difficulty, theme, info)
VALUES ('picture', 'Which city does this vibe belong to?', 'Geography', 'easy', 'city-vibes', '{"imageUrl":"https://quizzercdn.pablomarti.dev/geography/city-vibes/london4_1024x768.webp"}');
INSERT INTO answers (question_id, answer_text, is_correct, answer_order)
SELECT (SELECT MAX(id) FROM questions), 'Manchester', 0, 0
UNION ALL SELECT (SELECT MAX(id) FROM questions), 'London', 1, 1
UNION ALL SELECT (SELECT MAX(id) FROM questions), 'Birmingham', 0, 2
UNION ALL SELECT (SELECT MAX(id) FROM questions), 'Bristol', 0, 3;

-- London 5
INSERT INTO questions (type, question, category, difficulty, theme, info)
VALUES ('picture', 'Which city does this vibe belong to?', 'Geography', 'easy', 'city-vibes', '{"imageUrl":"https://quizzercdn.pablomarti.dev/geography/city-vibes/london5_1024x768.webp"}');
INSERT INTO answers (question_id, answer_text, is_correct, answer_order)
SELECT (SELECT MAX(id) FROM questions), 'Bristol', 0, 0
UNION ALL SELECT (SELECT MAX(id) FROM questions), 'London', 1, 1
UNION ALL SELECT (SELECT MAX(id) FROM questions), 'Liverpool', 0, 2
UNION ALL SELECT (SELECT MAX(id) FROM questions), 'Manchester', 0, 3;

-- Los Angeles
INSERT INTO questions (type, question, category, difficulty, theme, info)
VALUES ('picture', 'Which city does this vibe belong to?', 'Geography', 'medium', 'city-vibes', '{"imageUrl":"https://quizzercdn.pablomarti.dev/geography/city-vibes/los-angeles_1024x768.webp"}');
INSERT INTO answers (question_id, answer_text, is_correct, answer_order)
SELECT (SELECT MAX(id) FROM questions), 'San Diego', 0, 0
UNION ALL SELECT (SELECT MAX(id) FROM questions), 'Los Angeles', 1, 1
UNION ALL SELECT (SELECT MAX(id) FROM questions), 'Santa Monica', 0, 2
UNION ALL SELECT (SELECT MAX(id) FROM questions), 'Long Beach', 0, 3;

-- Lund
INSERT INTO questions (type, question, category, difficulty, theme, info)
VALUES ('picture', 'Which city does this vibe belong to?', 'Geography', 'hard', 'city-vibes', '{"imageUrl":"https://quizzercdn.pablomarti.dev/geography/city-vibes/lund_768x1024.webp"}');
INSERT INTO answers (question_id, answer_text, is_correct, answer_order)
SELECT (SELECT MAX(id) FROM questions), 'Uppsala', 0, 0
UNION ALL SELECT (SELECT MAX(id) FROM questions), 'Lund', 1, 1
UNION ALL SELECT (SELECT MAX(id) FROM questions), 'Malmö', 0, 2
UNION ALL SELECT (SELECT MAX(id) FROM questions), 'Göteborg', 0, 3;

-- Madinah
INSERT INTO questions (type, question, category, difficulty, theme, info)
VALUES ('picture', 'Which city does this vibe belong to?', 'Geography', 'medium', 'city-vibes', '{"imageUrl":"https://quizzercdn.pablomarti.dev/geography/city-vibes/madinah_768x1024.webp"}');
INSERT INTO answers (question_id, answer_text, is_correct, answer_order)
SELECT (SELECT MAX(id) FROM questions), 'Mecca', 0, 0
UNION ALL SELECT (SELECT MAX(id) FROM questions), 'Madinah', 1, 1
UNION ALL SELECT (SELECT MAX(id) FROM questions), 'Jeddah', 0, 2
UNION ALL SELECT (SELECT MAX(id) FROM questions), 'Riyadh', 0, 3;

-- Minneapolis
INSERT INTO questions (type, question, category, difficulty, theme, info)
VALUES ('picture', 'Which city does this vibe belong to?', 'Geography', 'hard', 'city-vibes', '{"imageUrl":"https://quizzercdn.pablomarti.dev/geography/city-vibes/minneapolis_768x1024.webp"}');
INSERT INTO answers (question_id, answer_text, is_correct, answer_order)
SELECT (SELECT MAX(id) FROM questions), 'Milwaukee', 0, 0
UNION ALL SELECT (SELECT MAX(id) FROM questions), 'Minneapolis', 1, 1
UNION ALL SELECT (SELECT MAX(id) FROM questions), 'St. Paul', 0, 2
UNION ALL SELECT (SELECT MAX(id) FROM questions), 'Madison', 0, 3;

-- Montenegro
INSERT INTO questions (type, question, category, difficulty, theme, info)
VALUES ('picture', 'Which city does this vibe belong to?', 'Geography', 'hard', 'city-vibes', '{"imageUrl":"https://quizzercdn.pablomarti.dev/geography/city-vibes/montenegro_768x1024.webp"}');
INSERT INTO answers (question_id, answer_text, is_correct, answer_order)
SELECT (SELECT MAX(id) FROM questions), 'Dubrovnik', 0, 0
UNION ALL SELECT (SELECT MAX(id) FROM questions), 'Kotor', 1, 1
UNION ALL SELECT (SELECT MAX(id) FROM questions), 'Split', 0, 2
UNION ALL SELECT (SELECT MAX(id) FROM questions), 'Zadar', 0, 3;

-- Moscow
INSERT INTO questions (type, question, category, difficulty, theme, info)
VALUES ('picture', 'Which city does this vibe belong to?', 'Geography', 'medium', 'city-vibes', '{"imageUrl":"https://quizzercdn.pablomarti.dev/geography/city-vibes/moscow_1024x768.webp"}');
INSERT INTO answers (question_id, answer_text, is_correct, answer_order)
SELECT (SELECT MAX(id) FROM questions), 'St. Petersburg', 0, 0
UNION ALL SELECT (SELECT MAX(id) FROM questions), 'Moscow', 1, 1
UNION ALL SELECT (SELECT MAX(id) FROM questions), 'Kiev', 0, 2
UNION ALL SELECT (SELECT MAX(id) FROM questions), 'Minsk', 0, 3;

-- Paris
INSERT INTO questions (type, question, category, difficulty, theme, info)
VALUES ('picture', 'Which city does this vibe belong to?', 'Geography', 'easy', 'city-vibes', '{"imageUrl":"https://quizzercdn.pablomarti.dev/geography/city-vibes/paris_768x1024.webp"}');
INSERT INTO answers (question_id, answer_text, is_correct, answer_order)
SELECT (SELECT MAX(id) FROM questions), 'Lyon', 0, 0
UNION ALL SELECT (SELECT MAX(id) FROM questions), 'Paris', 1, 1
UNION ALL SELECT (SELECT MAX(id) FROM questions), 'Brussels', 0, 2
UNION ALL SELECT (SELECT MAX(id) FROM questions), 'Marseille', 0, 3;

-- Paris 2
INSERT INTO questions (type, question, category, difficulty, theme, info)
VALUES ('picture', 'Which city does this vibe belong to?', 'Geography', 'easy', 'city-vibes', '{"imageUrl":"https://quizzercdn.pablomarti.dev/geography/city-vibes/paris2_768x1024.webp"}');
INSERT INTO answers (question_id, answer_text, is_correct, answer_order)
SELECT (SELECT MAX(id) FROM questions), 'Brussels', 0, 0
UNION ALL SELECT (SELECT MAX(id) FROM questions), 'Paris', 1, 1
UNION ALL SELECT (SELECT MAX(id) FROM questions), 'Lyon', 0, 2
UNION ALL SELECT (SELECT MAX(id) FROM questions), 'Nice', 0, 3;

-- Prague
INSERT INTO questions (type, question, category, difficulty, theme, info)
VALUES ('picture', 'Which city does this vibe belong to?', 'Geography', 'medium', 'city-vibes', '{"imageUrl":"https://quizzercdn.pablomarti.dev/geography/city-vibes/prague_1024x768.webp"}');
INSERT INTO answers (question_id, answer_text, is_correct, answer_order)
SELECT (SELECT MAX(id) FROM questions), 'Vienna', 0, 0
UNION ALL SELECT (SELECT MAX(id) FROM questions), 'Prague', 1, 1
UNION ALL SELECT (SELECT MAX(id) FROM questions), 'Budapest', 0, 2
UNION ALL SELECT (SELECT MAX(id) FROM questions), 'Bratislava', 0, 3;

-- Prague 2
INSERT INTO questions (type, question, category, difficulty, theme, info)
VALUES ('picture', 'Which city does this vibe belong to?', 'Geography', 'medium', 'city-vibes', '{"imageUrl":"https://quizzercdn.pablomarti.dev/geography/city-vibes/prague2_1024x768.webp"}');
INSERT INTO answers (question_id, answer_text, is_correct, answer_order)
SELECT (SELECT MAX(id) FROM questions), 'Budapest', 0, 0
UNION ALL SELECT (SELECT MAX(id) FROM questions), 'Prague', 1, 1
UNION ALL SELECT (SELECT MAX(id) FROM questions), 'Vienna', 0, 2
UNION ALL SELECT (SELECT MAX(id) FROM questions), 'Krakow', 0, 3;

-- Puerto Vallarta
INSERT INTO questions (type, question, category, difficulty, theme, info)
VALUES ('picture', 'Which city does this vibe belong to?', 'Geography', 'hard', 'city-vibes', '{"imageUrl":"https://quizzercdn.pablomarti.dev/geography/city-vibes/puerto-vallarta_1024x768.webp"}');
INSERT INTO answers (question_id, answer_text, is_correct, answer_order)
SELECT (SELECT MAX(id) FROM questions), 'Cancún', 0, 0
UNION ALL SELECT (SELECT MAX(id) FROM questions), 'Puerto Vallarta', 1, 1
UNION ALL SELECT (SELECT MAX(id) FROM questions), 'Cabo San Lucas', 0, 2
UNION ALL SELECT (SELECT MAX(id) FROM questions), 'Playa del Carmen', 0, 3;

-- Rome
INSERT INTO questions (type, question, category, difficulty, theme, info)
VALUES ('picture', 'Which city does this vibe belong to?', 'Geography', 'medium', 'city-vibes', '{"imageUrl":"https://quizzercdn.pablomarti.dev/geography/city-vibes/rome_768x1024.webp"}');
INSERT INTO answers (question_id, answer_text, is_correct, answer_order)
SELECT (SELECT MAX(id) FROM questions), 'Florence', 0, 0
UNION ALL SELECT (SELECT MAX(id) FROM questions), 'Rome', 1, 1
UNION ALL SELECT (SELECT MAX(id) FROM questions), 'Naples', 0, 2
UNION ALL SELECT (SELECT MAX(id) FROM questions), 'Milan', 0, 3;

-- San Francisco 2
INSERT INTO questions (type, question, category, difficulty, theme, info)
VALUES ('picture', 'Which city does this vibe belong to?', 'Geography', 'medium', 'city-vibes', '{"imageUrl":"https://quizzercdn.pablomarti.dev/geography/city-vibes/san-francisco2_1024x768.webp"}');
INSERT INTO answers (question_id, answer_text, is_correct, answer_order)
SELECT (SELECT MAX(id) FROM questions), 'Oakland', 0, 0
UNION ALL SELECT (SELECT MAX(id) FROM questions), 'San Francisco', 1, 1
UNION ALL SELECT (SELECT MAX(id) FROM questions), 'Berkeley', 0, 2
UNION ALL SELECT (SELECT MAX(id) FROM questions), 'Seattle', 0, 3;

-- San Francisco 3
INSERT INTO questions (type, question, category, difficulty, theme, info)
VALUES ('picture', 'Which city does this vibe belong to?', 'Geography', 'medium', 'city-vibes', '{"imageUrl":"https://quizzercdn.pablomarti.dev/geography/city-vibes/san-francisco3_768x1024.webp"}');
INSERT INTO answers (question_id, answer_text, is_correct, answer_order)
SELECT (SELECT MAX(id) FROM questions), 'Seattle', 0, 0
UNION ALL SELECT (SELECT MAX(id) FROM questions), 'San Francisco', 1, 1
UNION ALL SELECT (SELECT MAX(id) FROM questions), 'Portland', 0, 2
UNION ALL SELECT (SELECT MAX(id) FROM questions), 'Los Angeles', 0, 3;

-- Santorini
INSERT INTO questions (type, question, category, difficulty, theme, info)
VALUES ('picture', 'Which city does this vibe belong to?', 'Geography', 'medium', 'city-vibes', '{"imageUrl":"https://quizzercdn.pablomarti.dev/geography/city-vibes/santorini_1024x768.webp"}');
INSERT INTO answers (question_id, answer_text, is_correct, answer_order)
SELECT (SELECT MAX(id) FROM questions), 'Mykonos', 0, 0
UNION ALL SELECT (SELECT MAX(id) FROM questions), 'Santorini', 1, 1
UNION ALL SELECT (SELECT MAX(id) FROM questions), 'Crete', 0, 2
UNION ALL SELECT (SELECT MAX(id) FROM questions), 'Rhodes', 0, 3;

-- Seoul
INSERT INTO questions (type, question, category, difficulty, theme, info)
VALUES ('picture', 'Which city does this vibe belong to?', 'Geography', 'medium', 'city-vibes', '{"imageUrl":"https://quizzercdn.pablomarti.dev/geography/city-vibes/seoul_768x1024.webp"}');
INSERT INTO answers (question_id, answer_text, is_correct, answer_order)
SELECT (SELECT MAX(id) FROM questions), 'Busan', 0, 0
UNION ALL SELECT (SELECT MAX(id) FROM questions), 'Seoul', 1, 1
UNION ALL SELECT (SELECT MAX(id) FROM questions), 'Tokyo', 0, 2
UNION ALL SELECT (SELECT MAX(id) FROM questions), 'Osaka', 0, 3;

-- Seville
INSERT INTO questions (type, question, category, difficulty, theme, info)
VALUES ('picture', 'Which city does this vibe belong to?', 'Geography', 'hard', 'city-vibes', '{"imageUrl":"https://quizzercdn.pablomarti.dev/geography/city-vibes/seville_768x1024.webp"}');
INSERT INTO answers (question_id, answer_text, is_correct, answer_order)
SELECT (SELECT MAX(id) FROM questions), 'Granada', 0, 0
UNION ALL SELECT (SELECT MAX(id) FROM questions), 'Seville', 1, 1
UNION ALL SELECT (SELECT MAX(id) FROM questions), 'Córdoba', 0, 2
UNION ALL SELECT (SELECT MAX(id) FROM questions), 'Valencia', 0, 3;

-- Singapore 3
INSERT INTO questions (type, question, category, difficulty, theme, info)
VALUES ('picture', 'Which city does this vibe belong to?', 'Geography', 'medium', 'city-vibes', '{"imageUrl":"https://quizzercdn.pablomarti.dev/geography/city-vibes/singapore3_1024x768.webp"}');
INSERT INTO answers (question_id, answer_text, is_correct, answer_order)
SELECT (SELECT MAX(id) FROM questions), 'Kuala Lumpur', 0, 0
UNION ALL SELECT (SELECT MAX(id) FROM questions), 'Singapore', 1, 1
UNION ALL SELECT (SELECT MAX(id) FROM questions), 'Hong Kong', 0, 2
UNION ALL SELECT (SELECT MAX(id) FROM questions), 'Bangkok', 0, 3;

-- Singapore 4
INSERT INTO questions (type, question, category, difficulty, theme, info)
VALUES ('picture', 'Which city does this vibe belong to?', 'Geography', 'medium', 'city-vibes', '{"imageUrl":"https://quizzercdn.pablomarti.dev/geography/city-vibes/singapore4_768x1024.webp"}');
INSERT INTO answers (question_id, answer_text, is_correct, answer_order)
SELECT (SELECT MAX(id) FROM questions), 'Hong Kong', 0, 0
UNION ALL SELECT (SELECT MAX(id) FROM questions), 'Singapore', 1, 1
UNION ALL SELECT (SELECT MAX(id) FROM questions), 'Kuala Lumpur', 0, 2
UNION ALL SELECT (SELECT MAX(id) FROM questions), 'Jakarta', 0, 3;

-- Sydney
INSERT INTO questions (type, question, category, difficulty, theme, info)
VALUES ('picture', 'Which city does this vibe belong to?', 'Geography', 'medium', 'city-vibes', '{"imageUrl":"https://quizzercdn.pablomarti.dev/geography/city-vibes/sydney_768x1024.webp"}');
INSERT INTO answers (question_id, answer_text, is_correct, answer_order)
SELECT (SELECT MAX(id) FROM questions), 'Melbourne', 0, 0
UNION ALL SELECT (SELECT MAX(id) FROM questions), 'Sydney', 1, 1
UNION ALL SELECT (SELECT MAX(id) FROM questions), 'Brisbane', 0, 2
UNION ALL SELECT (SELECT MAX(id) FROM questions), 'Perth', 0, 3;

-- Thun
INSERT INTO questions (type, question, category, difficulty, theme, info)
VALUES ('picture', 'Which city does this vibe belong to?', 'Geography', 'hard', 'city-vibes', '{"imageUrl":"https://quizzercdn.pablomarti.dev/geography/city-vibes/thun_768x1024.webp"}');
INSERT INTO answers (question_id, answer_text, is_correct, answer_order)
SELECT (SELECT MAX(id) FROM questions), 'Lucerne', 0, 0
UNION ALL SELECT (SELECT MAX(id) FROM questions), 'Thun', 1, 1
UNION ALL SELECT (SELECT MAX(id) FROM questions), 'Interlaken', 0, 2
UNION ALL SELECT (SELECT MAX(id) FROM questions), 'Bern', 0, 3;

-- Torun
INSERT INTO questions (type, question, category, difficulty, theme, info)
VALUES ('picture', 'Which city does this vibe belong to?', 'Geography', 'hard', 'city-vibes', '{"imageUrl":"https://quizzercdn.pablomarti.dev/geography/city-vibes/torun_1024x768.webp"}');
INSERT INTO answers (question_id, answer_text, is_correct, answer_order)
SELECT (SELECT MAX(id) FROM questions), 'Gdansk', 0, 0
UNION ALL SELECT (SELECT MAX(id) FROM questions), 'Torun', 1, 1
UNION ALL SELECT (SELECT MAX(id) FROM questions), 'Krakow', 0, 2
UNION ALL SELECT (SELECT MAX(id) FROM questions), 'Wroclaw', 0, 3;

-- Trondheim
INSERT INTO questions (type, question, category, difficulty, theme, info)
VALUES ('picture', 'Which city does this vibe belong to?', 'Geography', 'hard', 'city-vibes', '{"imageUrl":"https://quizzercdn.pablomarti.dev/geography/city-vibes/trondheim_1024x768.webp"}');
INSERT INTO answers (question_id, answer_text, is_correct, answer_order)
SELECT (SELECT MAX(id) FROM questions), 'Bergen', 0, 0
UNION ALL SELECT (SELECT MAX(id) FROM questions), 'Trondheim', 1, 1
UNION ALL SELECT (SELECT MAX(id) FROM questions), 'Stavanger', 0, 2
UNION ALL SELECT (SELECT MAX(id) FROM questions), 'Tromsø', 0, 3;

-- Venice
INSERT INTO questions (type, question, category, difficulty, theme, info)
VALUES ('picture', 'Which city does this vibe belong to?', 'Geography', 'easy', 'city-vibes', '{"imageUrl":"https://quizzercdn.pablomarti.dev/geography/city-vibes/venice_1024x768.webp"}');
INSERT INTO answers (question_id, answer_text, is_correct, answer_order)
SELECT (SELECT MAX(id) FROM questions), 'Burano', 0, 0
UNION ALL SELECT (SELECT MAX(id) FROM questions), 'Venice', 1, 1
UNION ALL SELECT (SELECT MAX(id) FROM questions), 'Murano', 0, 2
UNION ALL SELECT (SELECT MAX(id) FROM questions), 'Florence', 0, 3;

-- Venice 2
INSERT INTO questions (type, question, category, difficulty, theme, info)
VALUES ('picture', 'Which city does this vibe belong to?', 'Geography', 'easy', 'city-vibes', '{"imageUrl":"https://quizzercdn.pablomarti.dev/geography/city-vibes/venice2_768x1024.webp"}');
INSERT INTO answers (question_id, answer_text, is_correct, answer_order)
SELECT (SELECT MAX(id) FROM questions), 'Florence', 0, 0
UNION ALL SELECT (SELECT MAX(id) FROM questions), 'Venice', 1, 1
UNION ALL SELECT (SELECT MAX(id) FROM questions), 'Rome', 0, 2
UNION ALL SELECT (SELECT MAX(id) FROM questions), 'Naples', 0, 3;

-- Venice 3
INSERT INTO questions (type, question, category, difficulty, theme, info)
VALUES ('picture', 'Which city does this vibe belong to?', 'Geography', 'easy', 'city-vibes', '{"imageUrl":"https://quizzercdn.pablomarti.dev/geography/city-vibes/venice3_1024x768.webp"}');
INSERT INTO answers (question_id, answer_text, is_correct, answer_order)
SELECT (SELECT MAX(id) FROM questions), 'Murano', 0, 0
UNION ALL SELECT (SELECT MAX(id) FROM questions), 'Venice', 1, 1
UNION ALL SELECT (SELECT MAX(id) FROM questions), 'Burano', 0, 2
UNION ALL SELECT (SELECT MAX(id) FROM questions), 'Verona', 0, 3;

-- Verona
INSERT INTO questions (type, question, category, difficulty, theme, info)
VALUES ('picture', 'Which city does this vibe belong to?', 'Geography', 'hard', 'city-vibes', '{"imageUrl":"https://quizzercdn.pablomarti.dev/geography/city-vibes/verona_768x1024.webp"}');
INSERT INTO answers (question_id, answer_text, is_correct, answer_order)
SELECT (SELECT MAX(id) FROM questions), 'Venice', 0, 0
UNION ALL SELECT (SELECT MAX(id) FROM questions), 'Verona', 1, 1
UNION ALL SELECT (SELECT MAX(id) FROM questions), 'Padua', 0, 2
UNION ALL SELECT (SELECT MAX(id) FROM questions), 'Vicenza', 0, 3;

-- Verona 2
INSERT INTO questions (type, question, category, difficulty, theme, info)
VALUES ('picture', 'Which city does this vibe belong to?', 'Geography', 'hard', 'city-vibes', '{"imageUrl":"https://quizzercdn.pablomarti.dev/geography/city-vibes/verona2_1024x768.webp"}');
INSERT INTO answers (question_id, answer_text, is_correct, answer_order)
SELECT (SELECT MAX(id) FROM questions), 'Padua', 0, 0
UNION ALL SELECT (SELECT MAX(id) FROM questions), 'Verona', 1, 1
UNION ALL SELECT (SELECT MAX(id) FROM questions), 'Brescia', 0, 2
UNION ALL SELECT (SELECT MAX(id) FROM questions), 'Mantua', 0, 3;

-- Vienna
INSERT INTO questions (type, question, category, difficulty, theme, info)
VALUES ('picture', 'Which city does this vibe belong to?', 'Geography', 'medium', 'city-vibes', '{"imageUrl":"https://quizzercdn.pablomarti.dev/geography/city-vibes/viena_768x1024.webp"}');
INSERT INTO answers (question_id, answer_text, is_correct, answer_order)
SELECT (SELECT MAX(id) FROM questions), 'Prague', 0, 0
UNION ALL SELECT (SELECT MAX(id) FROM questions), 'Vienna', 1, 1
UNION ALL SELECT (SELECT MAX(id) FROM questions), 'Budapest', 0, 2
UNION ALL SELECT (SELECT MAX(id) FROM questions), 'Salzburg', 0, 3;
