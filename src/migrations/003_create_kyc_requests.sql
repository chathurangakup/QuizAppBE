CREATE TABLE kyc_requests (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id),
    document_type TEXT CHECK (document_type IN ('NIC', 'PASSPORT', 'DL')) NOT NULL,
    document_number VARCHAR(255) NOT NULL,
    document_image_front_url TEXT NOT NULL,
     document_image_back_url TEXT NOT NULL,
    selfie_image_url TEXT NOT NULL,
    status TEXT CHECK (status IN ('PENDING', 'APPROVED', 'REJECTED')) DEFAULT 'PENDING',
    reviewed_by UUID REFERENCES admin_users(id),
    address TEXT NOT NULL,
    review_note TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    reviewed_at TIMESTAMP
);