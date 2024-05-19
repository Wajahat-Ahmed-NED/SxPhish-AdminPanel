USE user_management;

CREATE TABLE users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    username VARCHAR(255),
    name VARCHAR(255),
    virus_total BOOLEAN,
    the_phish BOOLEAN,
    sms_whatsapp_phishing BOOLEAN,
    payment_date DATE
);