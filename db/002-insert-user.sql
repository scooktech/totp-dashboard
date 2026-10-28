CREATE EXTENSION IF NOT EXISTS pgcrypto;

INSERT INTO
  users (
    username,
    password_hash
  )
VALUES 
  (
    'test',
    crypt('password1234', gen_salt('bf', 10))
  );
