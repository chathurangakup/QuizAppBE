CREATE TABLE quiz_submissions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    quiz_id UUID NOT NULL REFERENCES quizzes(id),
    user_id UUID NOT NULL REFERENCES users(id),

    total_questions INT NOT NULL,
    correct_answers INT NOT NULL,
    wrong_answers INT NOT NULL,
    score INT NOT NULL,

    -- JSON fields
    answers JSONB NOT NULL,         -- user answers
    evaluation JSONB NOT NULL,      -- question-wise result

    submitted_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    UNIQUE (quiz_id, user_id)
);
