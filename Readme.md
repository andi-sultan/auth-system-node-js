# Authentication System with Node.js, PostgreSQL, and Passport.js

A secure authentication system featuring user registration, login, email verification, and password reset functionality.

## Features

- User registration with password hashing
- Login/logout functionality
- Session management
- Email verification
- Password reset flow
- Form validation

## Technologies Used

- Node.js
- Express.js
- PostgreSQL
- Passport.js (Local Strategy)
- EJS (Embedded JavaScript templates)
- Bcrypt.js (Password hashing)
- Connect-flash (Flash messages)
- Nodemailer (Email sending)

## Prerequisites

- Node.js (v14 or higher)
- PostgreSQL (v12 or higher)
- npm (comes with Node.js)

## Installation

1. Clone the repository:
```bash
git clone https://github.com/andi-sultan/auth-system-node-js.git
cd auth-system
```

2. Install dependencies:
```bash
npm install
```

3. Set up your environment variables:
```bash
cp .env.example .env
```
Edit the `.env` file with your database credentials and email settings.

## Database Setup

### Option 1: Execute queries manually

1. Connect to your PostgreSQL database:
```bash
psql -U your_username -d your_database
```

2. Run the SQL commands from `queries.sql`:
```bash
\i queries.sql
```

### Option 2: Execute queries automatically

1. Run the setup script (requires `psql` in your PATH):
```bash
npm run db:setup
```
*Note: This requires the `db:setup` script in your `package.json`:
```json
"scripts": {
  "db:setup": "psql -U your_username -d your_database -f queries.sql"
}
```

## Database Schema

The required database tables are created by the `queries.sql` file, which includes:

1. `users` table for storing user accounts
2. `user_sessions` table for session storage

## Running the Application

1. Start the development server:
```bash
npm run dev
```

2. Access the application at:
```
http://localhost:3000
```

## API Endpoints

| Route | Method | Description |
|-------|--------|-------------|
| /register | GET | Registration form |
| /register | POST | Create new account |
| /login | GET | Login form |
| /login | POST | Authenticate user |
| /logout | GET | Logout user |
| /verify-email/:token | GET | Verify email address |
| /forgot-password | GET | Password reset request form |
| /forgot-password | POST | Send password reset email |
| /reset-password/:token | GET | Password reset form |
| /reset-password/:token | POST | Update password |

## Project Structure

```
/auth-system/
├── config/               # Configuration files
│   ├── passport-config.js
│   └── database.js
├── controllers/          # Route controllers
│   └── authController.js
├── models/               # Database models
│   └── user.js
├── routes/               # Route definitions
│   └── authRoutes.js
├── views/                # EJS templates
│   └── auth/             # Authentication views
├── queries.sql           # Database setup queries
├── app.js                # Main application file
└── package.json
```

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.
