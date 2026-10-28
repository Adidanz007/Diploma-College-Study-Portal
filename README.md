# Diploma College Study Portal

A comprehensive web-based platform for diploma college students to access course information, instructor details, and previous year question papers (PYQs) across all engineering branches.

## Features

- **User Authentication System**
  - User registration and login
  - Secure session management
  - Password protection

- **Multiple Engineering Branches**
  - Computer Science Engineering (CSE)
  - Electrical and Electronics Engineering (EEE)
  - Electronics & Communication Engineering (ECE)
  - Civil Engineering (CE)
  - Mechanical Engineering (ME)

- **Previous Year Question Papers (PYQs)**
  - Organized by subject and semester
  - Easy-to-access PDF downloads
  - Multiple exam sessions (2021-2023)
  - Common subjects for all branches

- **Department Information**
  - Instructor/HOD details
  - Department descriptions
  - Subject-wise resource allocation

- **Responsive Design**
  - Mobile-friendly interface
  - Clean and intuitive UI

## Technologies Used

- **Frontend**
  - HTML5
  - CSS3
  - JavaScript

- **Backend**
  - PHP
  - MySQL (for user database)

- **Server**
  - XAMPP (Apache + MySQL + PHP)

## Installation & Setup

### Prerequisites
- XAMPP installed on your system
- Web browser (Chrome, Firefox, etc.)

### Steps

1. **Clone the repository**
   ```bash
   git clone https://github.com/Adidanz007/diploma-college-study-portal.git
   cd diploma-college-study-portal

2. Place in XAMPP
Copy the project folder to: C:\xampp\htdocs\

3. Start XAMPP Services

Open XAMPP Control Panel
Start Apache and MySQL

4. Configure Database
Open http://localhost/phpmyadmin
Create a new database
Import the database configuration from login system/config.php

5. Access the Application
Navigate to: http://localhost/diploma-college-study-portal/

## Usage
For Students
    : Register a new account on the registration page
    : Login with your credentials
    : Browse PYQs by engineering branch
    : Download question papers for exam preparation
    : View department information and instructor details

## Database Schema 

User Table

CREATE TABLE users (
  id INT PRIMARY KEY AUTO_INCREMENT,
  name VARCHAR(100),
  email VARCHAR(100) UNIQUE,
  password VARCHAR(255),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

## Security Notes
- Keep `.env` local and use `.env.example` as the configuration template.
- Use HTTPS in production.
- Login attempts are limited in memory. Configure `LOGIN_RATE_LIMIT` and
  `LOGIN_RATE_WINDOW_MS`; limits reset when the server restarts and are not
  shared between multiple server instances.
- `POST /api/auth/logout` revokes the current JWT for the lifetime of the
  running server. The frontend also removes its `sessionStorage` token.
- JWT revocation is intentionally process-local and stores only a SHA-256
  token identifier. Use shared storage before running multiple backend
  instances.
- Regularly back up user data and PDFs.
- Validate and sanitize all user inputs.

## Testing

The default test command runs database-independent tests:

```powershell
npm test
```

Database integration tests are deliberately isolated from the development
database. They require the explicitly named `user_db_test` database and never
create it automatically:

```powershell
$env:DB_NAME = "user_db_test"
npm run test:integration
Remove-Item Env:DB_NAME
```

The integration runner performs a read-only preflight for `user_db_test` and
its `users` table. If either is unavailable, it reports `SKIP` and exits
without running database tests. Create `user_db_test` and its schema manually
only after confirming the database credentials. Never set `DB_NAME` to
`user_db` for integration tests.

## License
This project is created for educational purposes. PDFs and materials are property of the diploma college.

## Contributors
Created as Final Year Project
College: [Anjuman-E-Islamic Polytechnic Gadag]
Year: 2024-2025
