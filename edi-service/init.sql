CREATE TABLE IF NOT EXISTS edi_documents (
    id SERIAL PRIMARY KEY,
    document_type VARCHAR(10) NOT NULL,
    version VARCHAR(10) NOT NULL,
    status VARCHAR(20) NOT NULL,
    sender_id VARCHAR(50),
    receiver_id VARCHAR(50),
    document_date TIMESTAMP,
    document_number VARCHAR(50),
    header JSONB,
    invoices JSONB,
    products JSONB,
    totals JSONB,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
); 