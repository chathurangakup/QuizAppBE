CREATE TABLE quiz_options (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    quiz_id UUID NOT NULL REFERENCES quizzes(id),
    option_text JSONB NOT NULL, -- Stores an array of options
    question TEXT NOT NULL,
    correct_ans TEXT NOT NULL,

);