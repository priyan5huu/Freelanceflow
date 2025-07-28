# FreelanceFlow API Documentation

## Base URL
```
Development: http://localhost:5000/api
Production: https://your-domain.com/api
```

## Authentication
All protected endpoints require a Bearer token in the Authorization header:
```
Authorization: Bearer <your-jwt-token>
```

## Endpoints

### Authentication Endpoints

#### POST /auth/signup
Register a new user.

**Request Body:**
```json
{
  "name": "John Doe",
  "email": "john@example.com",
  "password": "password123",
  "userType": "client|freelancer",
  "company": "Company Name (optional for clients)",
  "skills": ["JavaScript", "React"] // optional for freelancers
}
```

**Response:**
```json
{
  "message": "User created successfully",
  "token": "jwt-token",
  "user": {
    "id": "user-id",
    "name": "John Doe",
    "email": "john@example.com",
    "userType": "client"
  }
}
```

#### POST /auth/login
Login existing user.

**Request Body:**
```json
{
  "email": "john@example.com",
  "password": "password123"
}
```

#### POST /auth/demo-login
Demo login for testing.

**Request Body:**
```json
{
  "userType": "client|freelancer|admin"
}
```

#### GET /auth/me
Get current user information (requires authentication).

### Project Endpoints

#### GET /projects
Get all active projects with optional filtering.

**Query Parameters:**
- `search`: Search in title/description
- `skills`: Filter by skills (comma-separated)
- `minBudget`: Minimum budget
- `maxBudget`: Maximum budget
- `page`: Page number (default: 1)
- `limit`: Items per page (default: 10)

#### POST /projects
Create a new project (client only).

**Request Body:**
```json
{
  "title": "Project Title",
  "description": "Detailed project description",
  "budget": 5000,
  "deadline": "2024-12-31",
  "skills": ["React", "Node.js"]
}
```

#### GET /projects/:id
Get project details by ID.

#### POST /projects/:id/bids
Submit a bid for a project (freelancer only).

**Request Body:**
```json
{
  "amount": 4500,
  "message": "Detailed proposal message",
  "deliveryTime": 21
}
```

#### PUT /projects/:id
Update project (owner only).

#### DELETE /projects/:id
Delete project (owner only).

### Admin Endpoints

#### GET /admin/stats
Get platform statistics (admin only).

#### GET /admin/users
Get all users (admin only).

#### PATCH /admin/users/:id
Update user details (admin only).

#### GET /admin/projects
Get all projects (admin only).

## Error Responses

All endpoints return standardized error responses:

```json
{
  "message": "Error description",
  "errors": [...] // Validation errors if applicable
}
```

## HTTP Status Codes

- `200`: Success
- `201`: Created
- `400`: Bad Request (validation errors)
- `401`: Unauthorized
- `403`: Forbidden
- `404`: Not Found
- `429`: Too Many Requests
- `500`: Internal Server Error
