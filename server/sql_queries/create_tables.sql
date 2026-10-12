CREATE TABLE IF NOT EXISTS credentials (
    email text PRIMARY KEY,
    user_id uuid UNIQUE NOT NULL,
    primary_username text UNIQUE NOT NULL,
    hashed_pass text UNIQUE NOT NULL,
    account_id uuid NOT NULL REFERENCES account_details(account_id),
    verifier_token text DEFAULT NULL,
    verified boolean DEFAULT FALSE,
    created_at timestamp NOT NULL DEFAULT (timezone('utc', now())),
    updated_at timestamp DEFAULT NULL,
    ver_tok_updated_at timestamp DEFAULT NULL,
    ver_tok_expires_at timestamp DEFAULT NULL
);

CREATE TABLE IF NOT EXISTS account_details (
    account_id uuid PRIMARY KEY REFERENCES agent_details(account_id),
    database_name text NOT NULL UNIQUE,
    acc_email text NOT NULL UNIQUE,
    created_at timestamp DEFAULT (timezone('utc', now())),
    updated_at timestamp DEFAULT NULL
);

CREATE TABLE IF NOT EXISTS sessions (
    session_id text PRIMARY KEY,
    csrf_token text NOT NULL,
    user_id uuid NOT NULL REFERENCES credentials(user_id),
    ip_addr inet NOT NULL,
    remember_me boolean NOT NULL DEFAULT false,
    created_at timestamp DEFAULT (timezone('utc', now())),
    expires_at timestamp NOT NULL,
    last_access timestamp DEFAULT (timezone('utc', now()))
);

CREATE TABLE IF NOT EXISTS agent_details (
    resource_id uuid PRIMARY KEY,
    account_id uuid NOT NULL,
    nonce serial,
    agent_type text NOT NULL,
    pub_key text NOT NULL,
    verified boolean DEFAULT false,
    created_at timestamp DEFAULT (timezone('utc', now())),
    updated_at timestamp,
    nonce_expires_at timestamp
);
