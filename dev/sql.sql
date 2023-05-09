-- INSERT INTO users VALUES (3, "test@gmail.com", "abc", "Astra Spero", "Astra", "Spero");
UPDATE users SET name = "John Doe", given_name = "John", family_name = "Doe" WHERE id = 2;
SELECT * FROM users;