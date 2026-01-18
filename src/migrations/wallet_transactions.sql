CREATE TABLE wallet_transactions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    wallet_id UUID NOT NULL REFERENCES wallets(id) ON DELETE CASCADE,

    type VARCHAR(20) NOT NULL CHECK (
        type IN ('QUIZ_REWARD', 'WITHDRAWAL', 'ADJUSTMENT')
    ),

    amount DECIMAL(12,2) NOT NULL CHECK (amount > 0),

    reference_id UUID, -- quiz_id or withdrawal_id

    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
