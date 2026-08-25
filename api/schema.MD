-- ============================================================
-- CareerMap MVP Schema — PostgreSQL
-- Based on: quiz -> matching -> results -> career detail -> mentor -> saved flow
-- ============================================================

-- ---------- USERS ----------
CREATE TABLE users (
    id              VARCHAR(4) PRIMARY KEY,
    email           TEXT UNIQUE NOT NULL,
    password_hash   TEXT NOT NULL,
    full_name       TEXT,
    created_at      TIMESTAMPTZ NOT NULL DEFAULT now(),
    
);

-- ---------- CAREER CLUSTERS (the 5 fixed clusters) ----------
CREATE TABLE career_clusters (
    id              SMALLSERIAL PRIMARY KEY,
    name            TEXT NOT NULL UNIQUE,      -- e.g. 'Build & Fix'
    description     TEXT
);
-- Seed: Build & Fix, Care & Guide, Create & Design, Organize & Lead, Analyze & Solve

-- ---------- QUIZ QUESTIONS ----------
-- options stored as JSONB so you can add/reword questions without a migration
CREATE TABLE quiz_questions (
    id              SERIAL PRIMARY KEY,
    order_index     SMALLINT NOT NULL,
    prompt          TEXT NOT NULL,
    question_type   TEXT NOT NULL DEFAULT 'this_or_that', -- 'this_or_that' | 'single_select'
    -- each option maps to 1-2 clusters with a weight, e.g.
    -- [{"label":"Fixing something broken","cluster_weights":{"1":1.0}},
    --  {"label":"Explaining an idea to someone","cluster_weights":{"2":1.0}}]
    options         JSONB NOT NULL,
    active          BOOLEAN NOT NULL DEFAULT true
);

-- ---------- QUIZ ATTEMPTS (one per time a user takes/retakes the quiz) ----------
CREATE TABLE quiz_attempts (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id         VARCHAR(4) REFERENCES users(id) ON DELETE CASCADE,
    started_at      TIMESTAMPTZ NOT NULL DEFAULT now(),
    completed_at    TIMESTAMPTZ,
    -- final accumulated score per cluster after all answers, e.g. {"1":0.42,"3":0.31,...}
    cluster_scores  JSONB
);

-- ---------- QUIZ RESPONSES (raw answer log, useful for "Quiz History") ----------
CREATE TABLE quiz_responses (
    id              BIGSERIAL PRIMARY KEY,
    attempt_id      UUID NOT NULL REFERENCES quiz_attempts(id) ON DELETE CASCADE,
    question_id     INT NOT NULL REFERENCES quiz_questions(id),
    selected_option JSONB NOT NULL,   -- the chosen option object, snapshot at answer time
    answered_at     TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ---------- CAREERS ----------
CREATE TABLE careers (
    id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title               TEXT NOT NULL,                 -- 'Software Engineering'
    description         TEXT,
    why_this_summary    TEXT,                           -- "You lean toward solving problems..."
    key_skills          TEXT[],                         -- short tags: logic, patience, attention to detail
    salary_local_min    NUMERIC(12,2),
    salary_local_max    NUMERIC(12,2),
    salary_local_currency TEXT DEFAULT 'NGN',
    salary_intl_min     NUMERIC(12,2),
    salary_intl_max     NUMERIC(12,2),
    salary_intl_currency TEXT DEFAULT 'USD',
    is_blended          BOOLEAN NOT NULL DEFAULT false, -- e.g. Law, evenly split across clusters
    created_at          TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ---------- CAREER <-> CLUSTER weights (the core matching table) ----------
-- Enforce "weights sum to 100%" at the app layer on write (trigger optional, see below)
CREATE TABLE career_cluster_weights (
    career_id       UUID NOT NULL REFERENCES careers(id) ON DELETE CASCADE,
    cluster_id      SMALLINT NOT NULL REFERENCES career_clusters(id),
    weight          NUMERIC(4,3) NOT NULL CHECK (weight > 0 AND weight <= 1),
    PRIMARY KEY (career_id, cluster_id)
);

-- Optional integrity trigger: keep weights honest at write time
CREATE OR REPLACE FUNCTION check_career_weights_sum()
RETURNS TRIGGER AS $$
DECLARE total NUMERIC;
BEGIN
    SELECT SUM(weight) INTO total FROM career_cluster_weights WHERE career_id = NEW.career_id;
    IF total > 1.001 THEN
        RAISE EXCEPTION 'Career % cluster weights exceed 100%%', NEW.career_id;
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_check_career_weights
AFTER INSERT OR UPDATE ON career_cluster_weights
FOR EACH ROW EXECUTE FUNCTION check_career_weights_sum();

-- ---------- LEARNING RESOURCES ----------
CREATE TABLE learning_resources (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    career_id       UUID NOT NULL REFERENCES careers(id) ON DELETE CASCADE,
    title           TEXT NOT NULL,
    url             TEXT NOT NULL,
    resource_type   TEXT   -- 'course' | 'article' | 'video' etc
);

-- ---------- MENTORS ----------
CREATE TABLE mentors (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    full_name       TEXT NOT NULL,
    headline        TEXT,             -- 'Senior Software Engineer @ X'
    bio             TEXT,
    photo_url       TEXT,
    is_active       BOOLEAN NOT NULL DEFAULT true,
    created_at      TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ---------- CAREER <-> MENTOR (a career links to one or more mentor profiles) ----------
CREATE TABLE career_mentors (
    career_id       UUID NOT NULL REFERENCES careers(id) ON DELETE CASCADE,
    mentor_id       UUID NOT NULL REFERENCES mentors(id) ON DELETE CASCADE,
    PRIMARY KEY (career_id, mentor_id)
);

-- ---------- SAVED CAREERS ----------
CREATE TABLE saved_careers (
    user_id         VARCHAR(4) NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    career_id       UUID NOT NULL REFERENCES careers(id) ON DELETE CASCADE,
    saved_at        TIMESTAMPTZ NOT NULL DEFAULT now(),
    PRIMARY KEY (user_id, career_id)
);

-- ---------- MENTOR REQUESTS ----------
CREATE TABLE mentor_requests (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id         VARCHAR(4) NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    mentor_id       UUID NOT NULL REFERENCES mentors(id),
    career_id       UUID REFERENCES careers(id),
    message         TEXT NOT NULL,
    status          TEXT NOT NULL DEFAULT 'sent',  -- 'sent' | 'confirmed' | 'closed'
    created_at      TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ============================================================
-- Example query: top 3-5 career matches for a completed quiz attempt
-- ============================================================
-- SELECT c.id, c.title,
--        SUM(ccw.weight * (a.cluster_scores ->> ccw.cluster_id::text)::numeric) AS match_score
-- FROM careers c
-- JOIN career_cluster_weights ccw ON ccw.career_id = c.id
-- CROSS JOIN quiz_attempts a
-- WHERE a.id = :attempt_id
-- GROUP BY c.id, c.title
-- ORDER BY match_score DESC
-- LIMIT 5;