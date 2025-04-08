-- Create extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create Assembly table
CREATE TABLE IF NOT EXISTS assembly (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(255) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Create Political Party table
CREATE TABLE IF NOT EXISTS political_party (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(255) NOT NULL,
    acronym VARCHAR(50),
    color VARCHAR(50),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Create Elected Officials table
CREATE TABLE IF NOT EXISTS elected_official (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    first_name VARCHAR(255) NOT NULL,
    last_name VARCHAR(255) NOT NULL,
    party_id UUID REFERENCES political_party(id),
    constituency VARCHAR(255),
    mandate_start DATE,
    mandate_end DATE,
    assembly_id UUID REFERENCES assembly(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Create Decision table
CREATE TABLE IF NOT EXISTS decision (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    title VARCHAR(255) NOT NULL,
    summary TEXT,
    full_text TEXT,
    date DATE NOT NULL,
    source VARCHAR(512),
    assembly_id UUID REFERENCES assembly(id),
    in_favor INTEGER DEFAULT 0,
    against INTEGER DEFAULT 0,
    abstention INTEGER DEFAULT 0,
    absent INTEGER DEFAULT 0,
    total_voters INTEGER DEFAULT 0,
    is_passed BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Create Individual Votes table
CREATE TABLE IF NOT EXISTS individual_vote (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    decision_id UUID REFERENCES decision(id),
    elected_official_id UUID REFERENCES elected_official(id),
    vote_value VARCHAR(50) NOT NULL, -- 'IN_FAVOR', 'AGAINST', 'ABSTENTION', 'ABSENT'
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT unique_vote UNIQUE (decision_id, elected_official_id)
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_elected_official_party ON elected_official(party_id);
CREATE INDEX IF NOT EXISTS idx_elected_official_assembly ON elected_official(assembly_id);
CREATE INDEX IF NOT EXISTS idx_decision_assembly ON decision(assembly_id);
CREATE INDEX IF NOT EXISTS idx_individual_vote_decision ON individual_vote(decision_id);
CREATE INDEX IF NOT EXISTS idx_individual_vote_official ON individual_vote(elected_official_id);

-- Create trigger functions for automatic updated_at timestamps
CREATE OR REPLACE FUNCTION update_modified_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE 'plpgsql';

-- Create triggers for each table
DO $$ 
DECLARE
    t text;
BEGIN
    FOR t IN 
        SELECT table_name FROM information_schema.tables 
        WHERE table_schema = current_schema() 
        AND table_name IN ('assembly', 'political_party', 'elected_official', 'decision', 'individual_vote')
    LOOP
        EXECUTE format('
            DROP TRIGGER IF EXISTS set_%I_updated_at ON %I;
            CREATE TRIGGER set_%I_updated_at
            BEFORE UPDATE ON %I
            FOR EACH ROW
            EXECUTE FUNCTION update_modified_column();
        ', t, t, t, t);
    END LOOP;
END $$; 