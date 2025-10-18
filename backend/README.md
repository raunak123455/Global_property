# Real Estate Backend API

This is the backend API for the Real Estate application built with Node.js, Express.js, and MongoDB.

## Features

- User Registration (Buyer/Agent)
- User Login
- JWT Authentication
- MongoDB Integration

## Technologies Used

- Node.js
- Express.js
- MongoDB with Mongoose
- JWT for authentication
- Bcrypt for password hashing

## Setup Instructions

1. Clone the repository
2. Navigate to the backend directory: `cd backend`
3. Install dependencies: `npm install`
4. Create a `.env` file with your configuration (see `.env.example`)
5. Start the development server: `npm run dev`

## API Endpoints

### Authentication

- `POST /api/auth/register` - Register a new user
- `POST /api/auth/login` - Login user

## Environment Variables

Create a `.env` file in the root of the backend directory with the following variables:

```
NODE_ENV=development
PORT=5000
MONGODB_URI=your_mongodb_connection_string
JWT_SECRET=your_jwt_secret_key
```

## Folder Structure

```
backend/
├── config/
│   └── db.js
├── controllers/
│   └── authController.js
├── middleware/
│   └── authMiddleware.js
├── models/
│   └── User.js
├── routes/
│   └── auth.js
├── .env
├── server.js
└── package.json
```