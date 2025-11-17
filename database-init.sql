CREATE TABLE
  IF NOT EXISTS users (
    id SERIAL PRIMARY KEY,
    first_name VARCHAR(255),
    last_name VARCHAR(255),
    birthdate DATE,
    biography TEXT,
    city VARCHAR(255)
  );

-- Seeding the database with 1 000 000 users
INSERT INTO users (first_name, last_name, birthdate, biography, city)
SELECT 
  first_names[floor(random() * array_length(first_names, 1) + 1)],
  last_names[floor(random() * array_length(last_names, 1) + 1)],
  DATE '1950-01-01' + FLOOR(random() * (DATE '2025-01-01' - DATE '1950-01-01'))::INTEGER,
  CASE 
    WHEN random() < 0.7 THEN lorem_ipsum[floor(random() * array_length(lorem_ipsum, 1) + 1)]
    ELSE NULL 
  END,
  cities[floor(random() * array_length(cities, 1) + 1)]
FROM 
  generate_series(1, 2000000),
  (SELECT array['James', 'Mary', 'John', 'Patricia', 'Robert', 'Jennifer', 'Michael', 'Linda', 'William', 'Elizabeth', 'David', 'Barbara', 'Richard', 'Susan', 'Joseph', 'Jessica', 'Thomas', 'Sarah', 'Charles', 'Karen'] as first_names) AS fn,
  (SELECT array['Smith', 'Johnson', 'Williams', 'Brown', 'Jones', 'Garcia', 'Miller', 'Davis', 'Rodriguez', 'Martinez', 'Hernandez', 'Lopez', 'Gonzalez', 'Wilson', 'Anderson', 'Thomas', 'Taylor', 'Moore', 'Jackson', 'Martin'] as last_names) AS ln,
  (SELECT array['New York', 'Los Angeles', 'Chicago', 'Houston', 'Phoenix', 'Philadelphia', 'San Antonio', 'San Diego', 'Dallas', 'San Jose', 'Austin', 'Jacksonville', 'Fort Worth', 'Columbus', 'San Francisco', 'Charlotte', 'Indianapolis', 'Seattle', 'Denver', 'Washington'] as cities) AS c,
  (SELECT array[
    'Experienced professional with a passion for technology.',
    'Creative thinker and problem solver with extensive industry knowledge.',
    'Dedicated individual with strong communication skills and team spirit.',
    'Award-winning expert in their field with numerous publications.',
    'World traveler and adventurer with unique life experiences.',
    'Community volunteer and activist making a difference locally.',
    'Tech enthusiast and early adopter of emerging technologies.',
    'Family-oriented person with strong traditional values.',
    'Fitness enthusiast and health-conscious individual.',
    'Art lover and patron of local cultural events.'
  ] as lorem_ipsum) AS li;