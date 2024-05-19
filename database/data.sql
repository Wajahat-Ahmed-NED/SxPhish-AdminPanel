USE user_management;

-- Inserting dummy values into the users table
INSERT INTO users (username, name, virus_total, the_phish, sms_whatsapp_phishing, payment_date) VALUES
('john_doe', 'John Doe', 1, 0, 1, '2024-03-04'),
('jane_smith', 'Jane Smith', 0, 1, 0, '2024-03-05'),
('mike_jones', 'Mike Jones', 1, 1, 1, '2024-03-06');
