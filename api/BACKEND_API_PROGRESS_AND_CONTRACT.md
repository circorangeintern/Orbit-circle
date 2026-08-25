# Backend API Development Progress and API Contract Documentation

## Overview

This document summarizes the current backend API implementation status for the `Orbit-circle` project and defines the API contract based on the code currently present in the repository.

Base assumptions:

- Runtime base URL: `http://localhost:3002`
- Content type: `application/json`
- Authentication mechanism: `Bearer` token in the `Authorization` header
- Main backend stack: `Express`, `TypeScript`, `PostgreSQL`, `JWT`, `bcrypt`

## Development Progress

### Completed

- Database connection setup is implemented
- Root route is implemented
- Health check route is implemented
- Authentication service layer is implemented
- Authentication controller layer is implemented
- Authentication middleware is implemented
- Auth route definitions are implemented for:
  - signup
  - login
  - profile
  - change password
  - forgot password
  - reset password
  - logout

### Partially Implemented

- Password reset flow is implemented, but the forgot-password response currently returns a debug token in the API response instead of sending email
- Logout is stateless and does not invalidate or blacklist tokens server-side

### Not Yet Implemented

- Quiz endpoints
- Career matching endpoints
- Career detail endpoints
- Saved careers endpoints
- Mentor endpoints
- Mentor request endpoints

These modules appear in the database schema design but do not yet have route/controller/service implementations in the current codebase.



## Current Route Status

### Live Through `server.ts`

| Method | Endpoint | Status | Notes |
| --- | --- | --- | --- |
| `GET` | `/` | Implemented | Returns API welcome message |
| `GET` | `/health` | Implemented | Checks DB responsiveness |

### Defined In `app.ts` and `routes/auth.routes.ts`

| Method | Endpoint | Auth Required | Status |
| --- | --- | --- | --- |
| `POST` | `/auth/signup` | No | Implemented in controller/service |
| `POST` | `/auth/login` | No | Implemented in controller/service |
| `GET` | `/auth/profile` | Yes | Implemented in controller/service |
| `POST` | `/auth/change-password` | Yes | Implemented in controller/service |
| `POST` | `/auth/forgot-password` | No | Implemented in controller/service |
| `POST` | `/auth/reset-password` | No | Implemented in controller/service |
| `POST` | `/auth/logout` | Yes | Implemented in controller/service |

## Authentication Contract

### Auth Header Format

Protected endpoints require:

```http
Authorization: Bearer <jwt_token>
```

### JWT Access Token

- Issued on signup and login
- Signed with `JWT_SECRET`
- Default expiration: `7d`
- Token payload currently includes:

```json
{
  "id": "user-uuid",
  "email": "user@example.com"
}
```

### Password Reset Token

- Generated in forgot-password flow
- Signed with `JWT_SECRET`
- Expiration: `15m`
- Payload includes:

```json
{
  "id": "user-uuid",
  "email": "user@example.com",
  "type": "password_reset"
}
```

## API Contract

## 1. Root Endpoint

### `GET /`

Returns a welcome message.

#### Success Response

Status: `200 OK`

```json
{
  "message": "Welcome to the CareerMap API"
}
```

## 2. Health Check

### `GET /health`

Checks whether the application can successfully query the database.

#### Success Response

Status: `200 OK`

```json
{
  "status": "healthy",
  "database": "connected"
}
```

#### Failure Response

Status: `503 Service Unavailable`

```json
{
  "status": "unhealthy",
  "database": "error"
}
```

## 3. Signup

### `POST /auth/signup`

Creates a new user account.

#### Request Body

```json
{
  "full_name": "Jane Doe",
  "email": "jane@example.com",
  "password": "secret123"
}
```

#### Success Response

Status: `201 Created`

```json
{
  "message": "User added successfully",
  "user": {
    "id": "uuid",
    "full_name": "Jane Doe",
    "email": "jane@example.com",
    "created_at": "2026-07-16T12:00:00.000Z"
  },
  "token": "jwt-token",
  "monthMessage": "Welcome to Orbit Circle. Have a great July."
}
```

#### Validation / Error Responses

Status: `400 Bad Request`

```json
{
  "message": "Full name, email and password are required"
}
```

```json
{
  "message": "Password must be at least 6 characters long"
}
```

```json
{
  "message": "User already exists"
}
```

Status: `500 Internal Server Error`

```json
{
  "message": "Internal server error"
}
```

## 4. Login

### `POST /auth/login`

Authenticates a user and returns an access token.

#### Request Body

```json
{
  "email": "jane@example.com",
  "password": "secret123"
}
```

#### Success Response

Status: `200 OK`

```json
{
  "message": "Login successful",
  "user": {
    "id": "uuid",
    "full_name": "Jane Doe",
    "email": "jane@example.com",
    "created_at": "2026-07-16T12:00:00.000Z"
  },
  "token": "jwt-token"
}
```

#### Error Responses

Status: `401 Unauthorized`

```json
{
  "message": "Invalid credentials"
}
```

Status: `500 Internal Server Error`

```json
{
  "message": "Internal server error"
}
```

## 5. Profile

### `GET /auth/profile`

Returns the authenticated user's profile.

#### Headers

```http
Authorization: Bearer <jwt-token>
```

#### Success Response

Status: `200 OK`

```json
{
  "message": "Profile retrieved successfully",
  "user": {
    "id": "uuid",
    "full_name": "Jane Doe",
    "email": "jane@example.com",
    "created_at": "2026-07-16T12:00:00.000Z"
  }
}
```

#### Error Responses

Status: `401 Unauthorized`

```json
{
  "message": "Access denied. No token provided."
}
```

Status: `404 Not Found`

```json
{
  "message": "User not found"
}
```

Status: `500 Internal Server Error`

```json
{
  "message": "Internal server error"
}
```

## 6. Change Password

### `POST /auth/change-password`

Changes the password for the authenticated user.

#### Headers

```http
Authorization: Bearer <jwt-token>
```

#### Request Body

```json
{
  "currentPassword": "secret123",
  "newPassword": "newsecret123"
}
```

#### Success Response

Status: `200 OK`

```json
{
  "status": "success",
  "message": "Password changed successfully"
}
```

#### Error Responses

Status: `400 Bad Request`

```json
{
  "status": "failed",
  "message": "Current password and new password are required"
}
```

```json
{
  "status": "failed",
  "message": "Current password is incorrect"
}
```

```json
{
  "status": "failed",
  "message": "Password must be at least 6 characters long"
}
```

```json
{
  "status": "failed",
  "message": "Failed to update password"
}
```

Status: `401 Unauthorized`

```json
{
  "status": "failed",
  "message": "Access denied. No token provided."
}
```

Status: `404 Not Found`

```json
{
  "status": "failed",
  "message": "User not found"
}
```

Status: `500 Internal Server Error`

```json
{
  "status": "failed",
  "message": "Internal server error"
}
```

## 7. Forgot Password

### `POST /auth/forgot-password`

Generates a password reset token.

#### Request Body

```json
{
  "email": "jane@example.com"
}
```

#### Success Response

Status: `200 OK`

When the user exists:

```json
{
  "status": "success",
  "message": "Password reset link generated successfully.",
  "debug": {
    "token": "reset-token",
    "resetLink": "http://localhost:3000/reset-password?token=reset-token"
  }
}
```

When the user does not exist:

```json
{
  "status": "success",
  "message": "If an account with that email exists, a reset link has been generated."
}
```

#### Error Responses

Status: `400 Bad Request`

```json
{
  "status": "failed",
  "message": "Email is required"
}
```

Status: `500 Internal Server Error`

```json
{
  "status": "failed",
  "message": "Internal server error"
}
```

## 8. Reset Password

### `POST /auth/reset-password`

Resets a password using a password reset token.

#### Request Body

```json
{
  "token": "reset-token",
  "newPassword": "newsecret123"
}
```

#### Success Response

Status: `200 OK`

```json
{
  "status": "success",
  "message": "Password reset successfully. You can now login with your new password."
}
```

#### Error Responses

Status: `400 Bad Request`

```json
{
  "status": "failed",
  "message": "Token and password are required"
}
```

```json
{
  "status": "failed",
  "message": "Reset token has expired. Please request a new password reset."
}
```

```json
{
  "status": "failed",
  "message": "Invalid reset token. Please request a new password reset."
}
```

```json
{
  "status": "failed",
  "message": "Invalid token type"
}
```

```json
{
  "status": "failed",
  "message": "User not found"
}
```

```json
{
  "status": "failed",
  "message": "Password must be at least 6 characters long"
}
```

Status: `500 Internal Server Error`

```json
{
  "status": "failed",
  "message": "Internal server error"
}
```

## 9. Logout

### `POST /auth/logout`

Logs out the authenticated user on the client side.

#### Headers

```http
Authorization: Bearer <jwt-token>
```

#### Success Response

Status: `200 OK`

```json
{
  "status": "success",
  "message": "Logout successful. Please delete the token from your client storage."
}
```

#### Error Responses

Status: `400 Bad Request`

```json
{
  "status": "failed",
  "message": "No token provided"
}
```

Note:

- If an invalid or expired token is passed after the request reaches the controller, the controller still returns success
- Because logout is currently stateless, this endpoint does not revoke the JWT on the server

## Common Error Codes

| Status Code | Meaning | Typical Cases |
| --- | --- | --- |
| `200` | Success | Login, profile, password reset, logout |
| `201` | Resource created | Signup |
| `400` | Bad request | Missing fields, invalid input, bad reset token |
| `401` | Unauthorized | Missing token, invalid login credentials, expired auth token |
| `403` | Forbidden | Invalid JWT or token verification failure in middleware |
| `404` | Not found | User not found |
| `500` | Internal server error | Unexpected application or DB error |
| `503` | Service unavailable | Database health check failed |

## Data Model Relevant To Auth

Current `users` table fields:

```sql
id UUID PRIMARY KEY
email TEXT UNIQUE NOT NULL
password_hash TEXT NOT NULL
full_name TEXT
created_at TIMESTAMPTZ NOT NULL
```

