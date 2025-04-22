# Event Planning Portal - Backend

A backend API for an Event Planning Portal application built with Express.js, TypeScript, PostgreSQL, and Sequelize.

## Features

- User authentication with JWT (Admin and Client roles)
- Event management for administrators
- Event browsing and booking for clients
- Data validation with Yup
- PostgreSQL database with Sequelize ORM
- RESTful API architecture

## Requirements

- Node.js (v22.11.0+(LTS))
- PostgreSQL (v16+)
- pnpm or yarn or npm

## Installation

1. Clone this repository
2. Navigate to the cloned directory
3. Install dependencies: by running `npm install` or `pnpm install` or `yarn install`

```bash
npm install
```

4. Set up environment variables - copy `.env.example` to `.env` and update the values:

```
NODE_ENV=development
PORT=5000

# Database
DB_HOST=localhost
DB_USER=postgres
DB_PASS=postgres
DB_NAME=event_planning_portal
DB_PORT=5432

# JWT
JWT_SECRET=your_jwt_secret_key_here
JWT_EXPIRE=7d
```

5. Create a PostgreSQL database for the application

## Database Setup

Create a PostgreSQL database using the following commands:

```sql
CREATE DATABASE event_planning_portal; `yould give it any name, but let the name match the DB_NAME in your .env file`
```

## Running the Application

### Development

```bash
yarn start or pnpm start
```

### Production

```bash
npm run build
npm start
```

### Seeding the Database

```bash
npm run seed
```

## API Documentation

### Authentication Endpoints

- **POST /api/auth/register** - Register a new user
  - Request: `{ "name": "User Name", "email": "user@example.com", "password": "password123", "role": "admin" }`
  - Response: User object with token

- **POST /api/auth/login** - Login a user
  - Request: `{ "email": "user@example.com", "password": "password123" }`
  - Response: User object with token

- **GET /api/auth/me** - Get current user
  - Headers: `Authorization: Bearer your-token`
  - Response: User object

### Event Endpoints

- **GET /api/events** - Get all events
  - Query params: `category`, `location`, `date`, `sort`
  - Response: Array of events

- **GET /api/events/:id** - Get single event
  - Response: Event object

- **POST /api/events** - Create new event (Admin only)
  - Headers: `Authorization: Bearer your-token`
  - Request: Event object
  - Response: Created event

- **PUT /api/events/:id** - Update event (Admin only)
  - Headers: `Authorization: Bearer your-token`
  - Request: Event object
  - Response: Updated event

- **DELETE /api/events/:id** - Delete event (Admin only)
  - Headers: `Authorization: Bearer your-token`
  - Response: Empty object

- **GET /api/events/:id/bookings** - Get event bookings (Admin only)
  - Headers: `Authorization: Bearer your-token`
  - Response: Array of bookings

### Booking Endpoints

- **POST /api/bookings** - Book an event (Client only)
  - Headers: `Authorization: Bearer your-token`
  - Request: `{ "eventId": 1 }`
  - Response: Booking object

- **GET /api/bookings** - Get user bookings
  - Headers: `Authorization: Bearer your-token`
  - Response: Array of bookings

- **DELETE /api/bookings/:id** - Cancel booking (Client only)
  - Headers: `Authorization: Bearer your-token`
  - Response: Success message

## Architecture

This application follows a layered architecture pattern:

1. **Routes** - Define API endpoints and HTTP methods
2. **Controllers** - Handle request/response logic
3. **Services** - Contain business logic
4. **Models** - Database schema definitions using Sequelize
5. **Middleware** - Authentication, validation, error handling

## Data Models

### User
- id (PK)
- name
- email
- password (hashed)
- role (admin/client)
- createdAt
- updatedAt

### Event
- id (PK)
- title
- description
- date
- time
- location
- capacity
- availableSlots
- image (optional)
- category (optional)
- creatorId (FK to User)
- createdAt
- updatedAt

### Booking
- id (PK)
- userId (FK to User)
- eventId (FK to Event)
- bookingDate
- status (confirmed/cancelled)
- createdAt
- updatedAt