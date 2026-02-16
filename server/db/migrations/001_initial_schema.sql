-- Carlisle CCM Portal — Initial Database Schema

-- Extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- Enum types
CREATE TYPE user_role AS ENUM ('contractor', 'sales_rep', 'ccm_employee', 'inspector', 'guest');
CREATE TYPE job_status AS ENUM ('Planning', 'In Progress', 'Completed');
CREATE TYPE job_type AS ENUM ('Commercial', 'Residential', 'Industrial');
CREATE TYPE inspection_type AS ENUM ('Pre-Installation', 'Mid-Installation', 'Final');
CREATE TYPE inspection_status AS ENUM ('Scheduled', 'Pending', 'In Progress', 'Completed', 'Passed', 'Failed');
CREATE TYPE warranty_type_enum AS ENUM ('Total System', 'Standard');
CREATE TYPE warranty_status AS ENUM ('Active', 'Expired', 'Pending');
CREATE TYPE document_type AS ENUM ('Product Document', 'Photo', 'Warranty Document', 'Safety Data Sheet', 'Installation Guide', 'Technical Data Sheet');
CREATE TYPE activity_type AS ENUM ('inspection', 'job', 'warranty', 'document', 'user', 'system', 'admin', 'customer', 'lead', 'analytics', 'support', 'report');

-- Users
CREATE TABLE users (
    id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    email           VARCHAR(255) UNIQUE NOT NULL,
    password_hash   VARCHAR(255) NOT NULL,
    name            VARCHAR(255) NOT NULL,
    role            user_role NOT NULL DEFAULT 'guest',
    phone           VARCHAR(50),
    is_active       BOOLEAN NOT NULL DEFAULT true,
    created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Contractors
CREATE TABLE contractors (
    id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id         UUID NOT NULL UNIQUE REFERENCES users(id) ON DELETE CASCADE,
    company_name    VARCHAR(255) NOT NULL,
    contact_name    VARCHAR(255) NOT NULL,
    join_date       DATE NOT NULL DEFAULT CURRENT_DATE,
    rating          NUMERIC(3,2) DEFAULT 0.00,
    specialties     TEXT[] DEFAULT '{}',
    created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_contractors_user_id ON contractors(user_id);

-- Sales Reps
CREATE TABLE sales_reps (
    id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id         UUID NOT NULL UNIQUE REFERENCES users(id) ON DELETE CASCADE,
    territory       VARCHAR(255),
    customers       INT DEFAULT 0,
    active_leads    INT DEFAULT 0,
    sales_ytd       NUMERIC(12,2) DEFAULT 0.00,
    quota           NUMERIC(12,2) DEFAULT 0.00,
    top_products    TEXT[] DEFAULT '{}',
    created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_sales_reps_user_id ON sales_reps(user_id);

-- Inspectors
CREATE TABLE inspectors (
    id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id         UUID NOT NULL UNIQUE REFERENCES users(id) ON DELETE CASCADE,
    certifications  TEXT[] DEFAULT '{}',
    created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_inspectors_user_id ON inspectors(user_id);

-- Products
CREATE TABLE products (
    id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    code            VARCHAR(50) UNIQUE NOT NULL,
    name            VARCHAR(255) NOT NULL,
    category        VARCHAR(255),
    description     TEXT,
    spec_thickness  VARCHAR(50),
    spec_width      VARCHAR(50),
    spec_color      VARCHAR(50),
    spec_warranty   VARCHAR(100),
    created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Product Documents
CREATE TABLE product_documents (
    id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    product_id      UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE,
    name            VARCHAR(255) NOT NULL,
    file_type       VARCHAR(50) DEFAULT 'PDF',
    file_size       VARCHAR(50),
    url             VARCHAR(500),
    content_key     VARCHAR(100),
    created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_product_documents_product_id ON product_documents(product_id);

-- Jobs
CREATE TABLE jobs (
    id                  UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    code                VARCHAR(50) UNIQUE NOT NULL,
    name                VARCHAR(255) NOT NULL,
    contractor_id       UUID NOT NULL REFERENCES contractors(id) ON DELETE RESTRICT,
    status              job_status NOT NULL DEFAULT 'Planning',
    type                job_type NOT NULL,
    start_date          DATE,
    estimated_completion DATE,
    completion_date     DATE,
    square_feet         INT DEFAULT 0,
    progress            INT DEFAULT 0 CHECK (progress >= 0 AND progress <= 100),
    created_at          TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at          TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_jobs_contractor_id ON jobs(contractor_id);
CREATE INDEX idx_jobs_status ON jobs(status);

-- Job Products (many-to-many)
CREATE TABLE job_products (
    id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    job_id      UUID NOT NULL REFERENCES jobs(id) ON DELETE CASCADE,
    product_name VARCHAR(255) NOT NULL,
    product_id  UUID REFERENCES products(id) ON DELETE SET NULL,
    UNIQUE(job_id, product_name)
);

CREATE INDEX idx_job_products_job_id ON job_products(job_id);

-- Inspections
CREATE TABLE inspections (
    id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    code            VARCHAR(50) UNIQUE NOT NULL,
    job_id          UUID NOT NULL REFERENCES jobs(id) ON DELETE CASCADE,
    inspector_id    UUID REFERENCES inspectors(id) ON DELETE SET NULL,
    type            inspection_type NOT NULL,
    status          inspection_status NOT NULL DEFAULT 'Pending',
    scheduled_date  DATE,
    checklist       TEXT[] DEFAULT '{}',
    notes           TEXT,
    completed_at    TIMESTAMPTZ,
    created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_inspections_job_id ON inspections(job_id);
CREATE INDEX idx_inspections_inspector_id ON inspections(inspector_id);
CREATE INDEX idx_inspections_status ON inspections(status);

-- Warranties
CREATE TABLE warranties (
    id                  UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    code                VARCHAR(50) UNIQUE NOT NULL,
    job_id              UUID NOT NULL REFERENCES jobs(id) ON DELETE CASCADE,
    contractor_id       UUID NOT NULL REFERENCES contractors(id) ON DELETE RESTRICT,
    warranty_type       warranty_type_enum NOT NULL,
    registration_date   DATE NOT NULL DEFAULT CURRENT_DATE,
    duration            VARCHAR(50) NOT NULL,
    status              warranty_status NOT NULL DEFAULT 'Pending',
    square_feet         INT DEFAULT 0,
    created_at          TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at          TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_warranties_job_id ON warranties(job_id);
CREATE INDEX idx_warranties_contractor_id ON warranties(contractor_id);

-- Warranty Products
CREATE TABLE warranty_products (
    id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    warranty_id     UUID NOT NULL REFERENCES warranties(id) ON DELETE CASCADE,
    product_name    VARCHAR(255) NOT NULL,
    UNIQUE(warranty_id, product_name)
);

CREATE INDEX idx_warranty_products_warranty_id ON warranty_products(warranty_id);

-- Job Documents
CREATE TABLE job_documents (
    id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    job_id          UUID NOT NULL REFERENCES jobs(id) ON DELETE CASCADE,
    type            document_type NOT NULL,
    name            VARCHAR(255) NOT NULL,
    url             VARCHAR(500),
    file_path       VARCHAR(500),
    uploaded_by     VARCHAR(255),
    uploaded_at     DATE DEFAULT CURRENT_DATE,
    created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_job_documents_job_id ON job_documents(job_id);

-- Activity Timeline
CREATE TABLE activity_timeline (
    id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id         UUID REFERENCES users(id) ON DELETE SET NULL,
    type            activity_type NOT NULL,
    user_name       VARCHAR(255),
    action          TEXT NOT NULL,
    details         TEXT,
    created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_activity_timeline_user_id ON activity_timeline(user_id);
CREATE INDEX idx_activity_timeline_created_at ON activity_timeline(created_at DESC);

-- Refresh Tokens
CREATE TABLE refresh_tokens (
    id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id         UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    token_hash      VARCHAR(255) NOT NULL,
    expires_at      TIMESTAMPTZ NOT NULL,
    created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_refresh_tokens_user_id ON refresh_tokens(user_id);
CREATE INDEX idx_refresh_tokens_expires_at ON refresh_tokens(expires_at);

-- Updated_at trigger
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_contractors_updated_at BEFORE UPDATE ON contractors FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_sales_reps_updated_at BEFORE UPDATE ON sales_reps FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_inspectors_updated_at BEFORE UPDATE ON inspectors FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_products_updated_at BEFORE UPDATE ON products FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_jobs_updated_at BEFORE UPDATE ON jobs FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_inspections_updated_at BEFORE UPDATE ON inspections FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_warranties_updated_at BEFORE UPDATE ON warranties FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
