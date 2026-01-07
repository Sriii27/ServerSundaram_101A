-- =================================================================
-- IMPACTLENS - SUPABASE SEED DATA (ALIGNED WITH DJANGO MODELS)
-- =================================================================

-- 1. CLEANUP (Optional - Uncomment if reset is needed)
DELETE FROM impact_scores;
DELETE FROM contributions;
DELETE FROM activities;
DELETE FROM pull_requests;
DELETE FROM issues;
DELETE FROM employees;
DELETE FROM teams;
DELETE FROM score_configurations;

-- 2. TEAMS
INSERT INTO teams (team_name, created_at) VALUES 
('Engineering', NOW()),
('Product', NOW()),
('Design', NOW()),
('Marketing', NOW());

-- 3. SCORE CONFIGURATIONS (User's "impact_weights")
-- Mapping "Impact Weights" to score_configurations table
INSERT INTO score_configurations (metric_name, weight, description, created_at) VALUES
('Bug Fixes', 35, 'Critical fixes affecting system stability', NOW()),
('Code Reviews', 25, 'Peer review contributions', NOW()),
('Architecture', 20, 'System design and refactoring', NOW()),
('Feature Delivery', 20, 'New features shipped', NOW());

-- 4. EMPLOYEES
-- Engineering (Include Silent Architects here)
INSERT INTO employees (name, role, is_active, team_id, joined_at) VALUES
('Alice Chen', 'Senior Staff Engineer', TRUE, (SELECT team_id FROM teams WHERE team_name = 'Engineering'), NOW()),
('Bob Smith', 'Senior Engineer', TRUE, (SELECT team_id FROM teams WHERE team_name = 'Engineering'), NOW()),
('Charlie Davis', 'Junior Engineer', TRUE, (SELECT team_id FROM teams WHERE team_name = 'Engineering'), NOW());

-- Product
INSERT INTO employees (name, role, is_active, team_id, joined_at) VALUES
('Dana Lee', 'Product Manager', TRUE, (SELECT team_id FROM teams WHERE team_name = 'Product'), NOW()),
('Evan Wright', 'Associate PM', TRUE, (SELECT team_id FROM teams WHERE team_name = 'Product'), NOW());

-- Design
INSERT INTO employees (name, role, is_active, team_id, joined_at) VALUES
('Fiona Green', 'Senior Designer', TRUE, (SELECT team_id FROM teams WHERE team_name = 'Design'), NOW()),
('George Hall', 'UX Researcher', TRUE, (SELECT team_id FROM teams WHERE team_name = 'Design'), NOW());

-- Marketing
INSERT INTO employees (name, role, is_active, team_id, joined_at) VALUES
('Hannah King', 'Marketing Lead', TRUE, (SELECT team_id FROM teams WHERE team_name = 'Marketing'), NOW()),
('Ian Scott', 'Content Strategist', TRUE, (SELECT team_id FROM teams WHERE team_name = 'Marketing'), NOW());


-- 5. IMPACT SCORES
-- Logic: Silent Architect = Impact >= 85 AND Activity <= 50

-- Alice Chen (Silent Architect #1)
INSERT INTO impact_scores (employee_id, impact_score, activity_score, silent_architect, calculated_at) VALUES
((SELECT employee_id FROM employees WHERE name = 'Alice Chen'), 92.5, 45.0, TRUE, NOW());

-- Bob Smith (High Performer - Balanced)
INSERT INTO impact_scores (employee_id, impact_score, activity_score, silent_architect, calculated_at) VALUES
((SELECT employee_id FROM employees WHERE name = 'Bob Smith'), 88.0, 90.0, FALSE, NOW());

-- Charlie Davis (Junior - Learning)
INSERT INTO impact_scores (employee_id, impact_score, activity_score, silent_architect, calculated_at) VALUES
((SELECT employee_id FROM employees WHERE name = 'Charlie Davis'), 65.0, 75.0, FALSE, NOW());

-- Fiona Green (Silent Architect #2 - Design Side)
INSERT INTO impact_scores (employee_id, impact_score, activity_score, silent_architect, calculated_at) VALUES
((SELECT employee_id FROM employees WHERE name = 'Fiona Green'), 89.0, 48.0, TRUE, NOW());

-- Dana Lee (Product - Balanced)
INSERT INTO impact_scores (employee_id, impact_score, activity_score, silent_architect, calculated_at) VALUES
((SELECT employee_id FROM employees WHERE name = 'Dana Lee'), 82.0, 85.0, FALSE, NOW());

-- Others (Average)
INSERT INTO impact_scores (employee_id, impact_score, activity_score, silent_architect, calculated_at) 
SELECT employee_id, 70.0, 70.0, FALSE, NOW() FROM employees WHERE name NOT IN ('Alice Chen', 'Bob Smith', 'Charlie Davis', 'Fiona Green', 'Dana Lee');


-- 6. EMPLOYEE CONTRIBUTIONS (Split into Contributions and Activities tables)

-- ALICE CHEN (Silent Architect: High Impact "Architecture/Fixes", Low Activity "Reviews")
-- Architecture (Contribution)
INSERT INTO contributions (employee_id, contribution_type, severity, complexity, lines_changed, created_at) VALUES
((SELECT employee_id FROM employees WHERE name = 'Alice Chen'), 'Architecture', 'CRITICAL', 'HIGH', 1500, NOW());
-- Bug Fixes (Contribution)
INSERT INTO contributions (employee_id, contribution_type, severity, complexity, lines_changed, created_at) VALUES
((SELECT employee_id FROM employees WHERE name = 'Alice Chen'), 'Bug Fix', 'MAJOR', 'MEDIUM', 450, NOW());
-- Light Activity
INSERT INTO activities (employee_id, activity_type, count, created_at) VALUES
((SELECT employee_id FROM employees WHERE name = 'Alice Chen'), 'Code Review', 2, NOW());


-- BOB SMITH (High Output: Lots of Features + Lots of Reviews)
-- Features (Contribution)
INSERT INTO contributions (employee_id, contribution_type, severity, complexity, lines_changed, created_at) VALUES
((SELECT employee_id FROM employees WHERE name = 'Bob Smith'), 'Feature', 'MAJOR', 'HIGH', 2000, NOW());
-- Reviews (Activity - High)
INSERT INTO activities (employee_id, activity_type, count, created_at) VALUES
((SELECT employee_id FROM employees WHERE name = 'Bob Smith'), 'Code Review', 15, NOW());
-- Mentoring (Activity)
INSERT INTO activities (employee_id, activity_type, count, created_at) VALUES
((SELECT employee_id FROM employees WHERE name = 'Bob Smith'), 'Mentoring', 5, NOW());


-- FIONA GREEN (Silent Architect - Design)
-- Core Work (Contribution equivalent for Design)
INSERT INTO contributions (employee_id, contribution_type, severity, complexity, lines_changed, created_at) VALUES
((SELECT employee_id FROM employees WHERE name = 'Fiona Green'), 'Optimization', 'CRITICAL', 'HIGH', 0, NOW()); 
-- (Note: lines_changed might be 0 for design, but impact calculated elsewhere or mock logic)

-- Low Activity
INSERT INTO activities (employee_id, activity_type, count, created_at) VALUES
((SELECT employee_id FROM employees WHERE name = 'Fiona Green'), 'Design Review', 3, NOW());


-- GENERIC FILLER FOR OTHERS
INSERT INTO contributions (employee_id, contribution_type, severity, complexity, lines_changed, created_at)
SELECT employee_id, 'Feature', 'MINOR', 'LOW', 100, NOW() 
FROM employees WHERE name NOT IN ('Alice Chen', 'Bob Smith', 'Fiona Green');

INSERT INTO activities (employee_id, activity_type, count, created_at)
SELECT employee_id, 'Standup', 10, NOW() 
FROM employees WHERE name NOT IN ('Alice Chen', 'Bob Smith', 'Fiona Green');
