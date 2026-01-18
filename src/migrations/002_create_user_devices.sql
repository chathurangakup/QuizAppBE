CREATE TABLE user_devices (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(id),
    device_id VARCHAR NOT NULL,
    ip_address VARCHAR NOT NULL,
    user_agent TEXT,
    last_seen_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);