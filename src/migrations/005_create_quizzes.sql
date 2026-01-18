CREATE TABLE quizzes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title VARCHAR(255) NOT NULL,
    description TEXT,
    image_url TEXT,
    total_questions INT NOT NULL,
    reward_amount DECIMAL(10,2) NOT NULL,
    difficulty TEXT CHECK (difficulty IN ('EASY', 'MEDIUM', 'HARD')) NOT NULL,

    deadline TIMESTAMP NOT NULL,
    status TEXT CHECK (status IN ('ACTIVE', 'PROCESSING', 'COMPLETED')) DEFAULT 'ACTIVE',
    is_active BOOLEAN DEFAULT TRUE,
    created_by UUID NOT NULL REFERENCES admin_users(id),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);