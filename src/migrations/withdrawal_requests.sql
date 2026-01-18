CREATE TABLE withdrawal_requests (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id),

    amount DECIMAL(12,2) NOT NULL CHECK (amount > 0),

    payment_method VARCHAR(20) NOT NULL CHECK (
        payment_method IN ('BANK', 'EWALLET')
    ),

    payment_details JSONB NOT NULL,

    status VARCHAR(20) NOT NULL DEFAULT 'PENDING' CHECK (
        status IN ('PENDING', 'APPROVED', 'PAID', 'REJECTED')
    ),

    reviewed_by UUID REFERENCES admin_users(id),

    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    reviewed_at TIMESTAMP
);
