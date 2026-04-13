# MathSprint API

A production-ready RESTful API for a gamified math learning application built with Node.js, Express.js, and Firebase.

---

## 🚀 Features

- **JWT-Based Authentication**: Secure, token-based user authentication with role-based access control (RBAC)
- **Firebase Integration**: Real-time database for question persistence with local fallback for reliability
- **Role-Based Access Control**: Admin users can manage questions; regular users can only access questions
- **Comprehensive Validation**: Request validation using Joi for all endpoints
- **Error Handling**: Centralized error handling middleware for consistent error responses
- **Rate Limiting**: Built-in API throttling for security
- **CORS Support**: Configurable cross-origin requests
- **HTTP Security**: Helmet.js for HTTP header security
- **Logging**: Morgan HTTP request logging
- **Fallback Data**: Local question bank ensures API reliability when Firebase is unavailable

---

## 📋 Tech Stack

- **Runtime**: Node.js (LTS)
- **Framework**: Express.js
- **Database**: Firebase Realtime Database or Firestore
- **Authentication**: JWT (JSON Web Token)
- **Validation**: Joi schema validation
- **Security**: Helmet.js, express-rate-limit, CORS
- **Logging**: Morgan
- **ID Generation**: UUID
- **Development**: Nodemon

---

## 📁 Project Structure

```
mathsprint-api/
├── src/
│   ├── app.js                    # Express server entry point
│   ├── config/
│   │   └── firebase.js           # Firebase Admin SDK configuration
│   ├── controllers/
│   │   └── questionController.js # Route handlers for questions API
│   ├── routes/
│   │   ├── auth.js               # Authentication endpoints
│   │   └── questions.js          # Questions API endpoints
│   ├── middleware/
│   │   ├── verifyToken.js        # JWT verification middleware
│   │   ├── errorHandler.js       # Centralized error handling
│   │   └── requireAdmin.js       # Admin role verification
│   ├── services/
│   │   └── questionService.js    # Business logic & Firebase queries
│   ├── validators/
│   │   └── questionValidator.js  # Joi validation schemas
│   ├── data/
│   │   ├── fallbackQuestions.js  # Local fallback question bank
│   │   └── questionBank.js       # Original question templates (legacy)
│   └── serviceAccountKey.json    # Firebase credentials (git-ignored)
├── .env                          # Environment variables (git-ignored)
├── .env.example                  # Environment template
├── .gitignore                    # Git ignore rules
├── package.json                  # Node.js dependencies
├── package-lock.json
└── README.md                     # This file
```

---

## 🔧 Setup Instructions

### Prerequisites

- Node.js 14+ and npm
- Firebase project with Realtime Database or Firestore
- Firebase service account credentials

### Installation

1. **Clone or extract the project**:
   ```bash
   cd mathsprint-api
   ```

2. **Install dependencies**:
   ```bash
   npm install
   ```

3. **Set up environment variables**:
   ```bash
   # Copy the example file
   cp .env.example .env
   
   # Edit .env with your Firebase credentials and secrets
   nano .env
   ```

### Environment Variables

| Variable | Description | Example |
|----------|-------------|---------|
| `PORT` | Server port | `3000` |
| `JWT_SECRET` | Secret for signing JWT tokens | 64-char hex string |
| `FIREBASE_DATABASE_URL` | Firebase Realtime Database URL | `https://project.firebaseio.com` |
| `FIREBASE_PROJECT_ID` | Firebase project ID | `my-project-id` |
| `FIREBASE_CLIENT_EMAIL` | Firebase service account email | `firebase-adminsdk@...` |
| `FIREBASE_PRIVATE_KEY` | Firebase private key (with `\n`) | Multiline key |
| `ALLOWED_ORIGINS` | Comma-separated CORS origins | `http://localhost:3000,http://localhost:5173` |
| `RATE_LIMIT_WINDOW_MS` | Rate limit window in ms | `60000` |
| `RATE_LIMIT_MAX_REQUESTS` | Max requests per window | `60` |

### Firebase Setup

1. **Create a Firebase project** (if not already created)
2. **Download service account credentials**:
   - Go to Firebase Console → Project Settings → Service Accounts
   - Click "Generate New Private Key"
   - Place the JSON file as `src/serviceAccountKey.json` (DO NOT commit)
3. **Create Realtime Database**: Enable Firestore/Realtime Database in Firebase
4. **Set up Firebase rules** (optional but recommended):
   ```json
   {
     "rules": {
       "questions": {
         ".read": true,
         ".write": "root.child('users').child(auth.uid).child('role').val() === 'admin'"
       },
       "users": {
         "$uid": {
           ".read": "$uid === auth.uid || root.child('users').child(auth.uid).child('role').val() === 'admin'",
           ".write": "$uid === auth.uid || root.child('users').child(auth.uid).child('role').val() === 'admin'"
         }
       }
     }
   }
   ```

### Firebase User Setup

In your Firebase Realtime Database, create users with this structure:

```json
{
  "users": {
    "user123": {
      "username": "JohnDoe",
      "skillLevel": "beginner",
      "role": "user"
    },
    "admin456": {
      "username": "AdminUser",
      "skillLevel": "advanced",
      "role": "admin"
    }
  }
}
```

**Fields**:
- `username`: Display name of the user
- `skillLevel`: One of `beginner`, `intermediate`, `advanced`
- `role`: One of `user`, `admin` (determines access level)

---

## 🏃 Running the Server

### Development (with hot reload)

```bash
npm run dev
```

The server will restart automatically when you modify files.

### Production

```bash
npm start
```

---

## 📖 API Documentation

### Base URL

```
http://localhost:3000
```

### Authentication

All endpoints (except `/health` and POST `/auth/get-token`) require a Bearer token in the `Authorization` header:

```
Authorization: Bearer <JWT_TOKEN>
```

### Response Format

All responses follow this format:

```json
{
  "success": true,
  "message": "Optional message",
  "data": {},
  "timestamp": "2026-04-13T10:30:00.000Z"
}
```

---

## 🔐 Authentication Endpoints

### Get JWT Token

**Endpoint**: `POST /auth/get-token`

**Authentication**: None required

**Request Body**:
```json
{
  "userId": "user123"
}
```

**Response** (Success):
```json
{
  "success": true,
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

**Token Structure** (decoded):
```json
{
  "uid": "user123",
  "username": "JohnDoe",
  "skillLevel": "beginner",
  "role": "user",
  "iat": 1681000000,
  "exp": 1681604800
}
```

**cURL Example**:
```bash
curl -X POST http://localhost:3000/auth/get-token \
  -H "Content-Type: application/json" \
  -d '{"userId": "user123"}'
```

---

## ❓ Questions Endpoints

### Get Questions

**Endpoint**: `GET /api/questions`

**Authentication**: Required (any authenticated user)

**Query Parameters**:
| Parameter | Type | Required | Default | Max |
|-----------|------|----------|---------|-----|
| `level` | string | Yes | - | - |
| `topic` | string | No | All | - |
| `tags` | string | No | All | - |
| `limit` | number | No | 10 | 50 |

**Valid Levels**: `beginner`, `intermediate`, `advanced`

**Response** (Success):
```json
{
  "success": true,
  "source": "firebase",
  "count": 10,
  "questions": [
    {
      "id": "q1",
      "questionText": "What is 5 + 7?",
      "options": ["10", "11", "12", "13"],
      "correctAnswer": "12",
      "explanation": "5 + 7 = 12",
      "topic": "addition",
      "difficulty": 1,
      "points": 5,
      "timeLimit": 10,
      "tags": ["basic", "arithmetic"],
      "isActive": true,
      "createdAt": 1710000000000,
      "updatedAt": 1710000000000
    }
  ],
  "timestamp": "2026-04-13T10:30:00.000Z"
}
```

**cURL Example**:
```bash
# Get 10 beginner questions
curl http://localhost:3000/api/questions?level=beginner \
  -H "Authorization: Bearer YOUR_TOKEN"

# Get 5 beginner addition questions
curl "http://localhost:3000/api/questions?level=beginner&topic=addition&limit=5" \
  -H "Authorization: Bearer YOUR_TOKEN"

# Get questions with tags
curl "http://localhost:3000/api/questions?level=intermediate&tags=ssc,railway&limit=10" \
  -H "Authorization: Bearer YOUR_TOKEN"
```

---

### Get Topics

**Endpoint**: `GET /api/questions/topics`

**Authentication**: Required (any authenticated user)

**Query Parameters**:
| Parameter | Type | Required |
|-----------|------|----------|
| `level` | string | Yes |

**Response** (Success):
```json
{
  "success": true,
  "level": "beginner",
  "source": "firebase",
  "count": 3,
  "topics": [
    { "id": "addition", "label": "Addition" },
    { "id": "geometry", "label": "Geometry" },
    { "id": "fractions", "label": "Fractions" }
  ],
  "timestamp": "2026-04-13T10:30:00.000Z"
}
```

**cURL Example**:
```bash
curl "http://localhost:3000/api/questions/topics?level=beginner" \
  -H "Authorization: Bearer YOUR_TOKEN"
```

---

### Create Question

**Endpoint**: `POST /api/questions`

**Authentication**: Required (admin role only)

**Request Body**:
```json
{
  "questionText": "What is the area of a circle with radius 5?",
  "options": ["75 cm²", "78.5 cm²", "85 cm²", "90 cm²"],
  "correctAnswer": "78.5 cm²",
  "explanation": "Area = πr² = 3.14 × 25 = 78.5 cm²",
  "level": "beginner",
  "topic": "geometry",
  "difficulty": 2,
  "points": 10,
  "timeLimit": 15,
  "tags": ["circle", "area"]
}
```

**Response** (Success):
```json
{
  "success": true,
  "message": "Question created successfully",
  "question": {
    "id": "q1a2b3c4",
    "questionText": "What is the area of a circle with radius 5?",
    "options": ["75 cm²", "78.5 cm²", "85 cm²", "90 cm²"],
    "correctAnswer": "78.5 cm²",
    "explanation": "Area = πr² = 3.14 × 25 = 78.5 cm²",
    "level": "beginner",
    "topic": "geometry",
    "difficulty": 2,
    "points": 10,
    "timeLimit": 15,
    "tags": ["circle", "area"],
    "isActive": true,
    "createdAt": 1710000000000,
    "updatedAt": 1710000000000
  },
  "timestamp": "2026-04-13T10:30:00.000Z"
}
```

**cURL Example**:
```bash
curl -X POST http://localhost:3000/api/questions \
  -H "Authorization: Bearer ADMIN_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "questionText": "What is 2 × 3?",
    "options": ["4", "5", "6", "7"],
    "correctAnswer": "6",
    "explanation": "2 × 3 = 6",
    "level": "beginner",
    "topic": "multiplication",
    "difficulty": 1,
    "points": 5,
    "timeLimit": 10,
    "tags": ["basic"]
  }'
```

**Validation Errors**:
- `400 Bad Request` - Invalid request body
- `403 Forbidden` - User role is not admin
- `401 Unauthorized` - Invalid or missing token

---

### Update Question

**Endpoint**: `PUT /api/questions/:id`

**Authentication**: Required (admin role only)

**Path Parameters**:
| Parameter | Type | Description |
|-----------|------|-------------|
| `id` | string | Question ID |

**Request Body** (all fields optional except `level`):
```json
{
  "level": "beginner",
  "questionText": "Updated question text",
  "options": ["new1", "new2", "new3", "new4"],
  "correctAnswer": "new1",
  "difficulty": 3,
  "points": 15
}
```

**Response** (Success):
```json
{
  "success": true,
  "message": "Question updated successfully",
  "question": {
    "id": "q1a2b3c4",
    "questionText": "Updated question text",
    ...
    "updatedAt": 1710001000000
  },
  "timestamp": "2026-04-13T10:30:00.000Z"
}
```

**cURL Example**:
```bash
curl -X PUT http://localhost:3000/api/questions/q1a2b3c4 \
  -H "Authorization: Bearer ADMIN_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "level": "beginner",
    "difficulty": 3,
    "points": 15
  }'
```

---

### Delete Question (Soft Delete)

**Endpoint**: `DELETE /api/questions/:id`

**Authentication**: Required (admin role only)

**Path Parameters**:
| Parameter | Type | Description |
|-----------|------|-------------|
| `id` | string | Question ID |

**Request Body**:
```json
{
  "level": "beginner"
}
```

**Response** (Success):
```json
{
  "success": true,
  "message": "Question deleted successfully",
  "questionId": "q1a2b3c4",
  "timestamp": "2026-04-13T10:30:00.000Z"
}
```

**Note**: This is a soft delete. The question's `isActive` field is set to `false`, not physically deleted, allowing recovery if needed.

**cURL Example**:
```bash
curl -X DELETE http://localhost:3000/api/questions/q1a2b3c4 \
  -H "Authorization: Bearer ADMIN_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"level": "beginner"}'
```

---

### Health Check

**Endpoint**: `GET /health`

**Authentication**: None required

**Response** (Success):
```json
{
  "status": "ok",
  "timestamp": "2026-04-13T10:30:00.000Z"
}
```

**cURL Example**:
```bash
curl http://localhost:3000/health
```

---

## 🧪 Testing

### Quick Test Sequence

1. **Health Check**:
   ```bash
   curl http://localhost:3000/health
   ```

2. **Get Token (User)**:
   ```bash
   export USER_TOKEN=$(curl -s -X POST http://localhost:3000/auth/get-token \
     -H "Content-Type: application/json" \
     -d '{"userId": "user123"}' | jq -r '.token')
   echo "User Token: $USER_TOKEN"
   ```

3. **Get Token (Admin)**:
   ```bash
   export ADMIN_TOKEN=$(curl -s -X POST http://localhost:3000/auth/get-token \
     -H "Content-Type: application/json" \
     -d '{"userId": "admin456"}' | jq -r '.token')
   echo "Admin Token: $ADMIN_TOKEN"
   ```

4. **Get Questions (User)**:
   ```bash
   curl "http://localhost:3000/api/questions?level=beginner&limit=3" \
     -H "Authorization: Bearer $USER_TOKEN" | jq
   ```

5. **Get Topics (User)**:
   ```bash
   curl "http://localhost:3000/api/questions/topics?level=beginner" \
     -H "Authorization: Bearer $USER_TOKEN" | jq
   ```

6. **Create Question (Admin)**:
   ```bash
   curl -X POST http://localhost:3000/api/questions \
     -H "Authorization: Bearer $ADMIN_TOKEN" \
     -H "Content-Type: application/json" \
     -d '{
       "questionText": "What is 1 + 1?",
       "options": ["1", "2", "3", "4"],
       "correctAnswer": "2",
       "explanation": "Basic addition",
       "level": "beginner",
       "topic": "addition",
       "difficulty": 1,
       "points": 5,
       "timeLimit": 5,
       "tags": ["basic"]
     }' | jq
   ```

7. **Try Admin Endpoint with User Token (Should Fail with 403)**:
   ```bash
   curl -X POST http://localhost:3000/api/questions \
     -H "Authorization: Bearer $USER_TOKEN" \
     -H "Content-Type: application/json" \
     -d '{
       "questionText": "Test",
       "options": ["A", "B"],
       "correctAnswer": "A",
       "level": "beginner",
       "topic": "test",
       "difficulty": 1,
       "points": 5,
       "timeLimit": 10
     }' | jq
   ```

---

## 🚨 Error Responses

### Response Format

All errors return with appropriate HTTP status codes:

```json
{
  "success": false,
  "error": "Error message description"
}
```

### Common Error Codes

| Code | Scenario | Example |
|------|----------|---------|
| `400` | Validation error, malformed request | Invalid `level` parameter |
| `401` | Missing or invalid authentication token | Expired JWT, missing Authorization header |
| `403` | User lacks required role/permissions | Regular user trying to create question |
| `404` | Resource not found | Question ID doesn't exist |
| `429` | Rate limit exceeded | Too many requests in time window |
| `500` | Server error | Firebase connection failure |

### Example Error Responses

**Invalid Level**:
```json
{
  "success": false,
  "error": "Validation error",
  "details": [
    {
      "message": "\"level\" must be one of: beginner, intermediate, advanced"
    }
  ]
}
```

**Missing Token**:
```json
{
  "success": false,
  "error": "Authentication required"
}
```

**Insufficient Permissions**:
```json
{
  "success": false,
  "error": "Admin access required"
}
```

---

## 🔄 Firebase ↔️ Fallback Logic

The API implements intelligent fallback: 

1. **Try Firebase First**: Queries `/questions/{level}/{questionId}`
2. **If Firebase fails or returns empty**: Falls back to local `src/data/fallbackQuestions.js`
3. **Response includes source**: `"source": "firebase"` or `"source": "fallback"`

This ensures the API remains operational even if Firebase is temporarily unavailable.

### Fallback Data Structure

```javascript
{
  "beginner": [ { questions }, { questions } ],
  "intermediate": [ { questions }, { questions } ],
  "advanced": [ { questions }, { questions } ]
}
```

Includes **36+ questions** (12 per level) for comprehensive fallback coverage.

---

## 🛡️ Security Features

- **JWT Authentication**: Secure token-based auth with 7-day expiration
- **Role-Based Access Control**: Admin-only endpoints protected by `requireAdmin` middleware
- **Request Validation**: Joi schemas validate all inputs
- **Rate Limiting**: 60 requests/minute general, 5 requests/15 minutes for auth
- **Helmet Security**: HTTP header security protection
- **CORS Filtering**: Only whitelisted origins can access API
- **Payload Limits**: Max 10KB request body size
- **Error Messages**: Generic errors prevent information leakage

---

## 📤 Deployment

### Render (Recommended)

1. **Push code to GitHub**
2. **Create new Render service**
3. **Connect repository**
4. **Set environment variables** in Render dashboard
5. **Enable auto-deploy** from Git

### Railway

1. **Push code to GitHub/GitLab**
2. **Create Railway project**
3. **Connect repository**
4. **Set environment variables**
5. **Deploy automatically or manually**

### Heroku

```bash
# Create Heroku app
heroku create mathsprint-api

# Set environment variables
heroku config:set JWT_SECRET=your_secret
heroku config:set FIREBASE_DATABASE_URL=your_url
# ... set other variables

# Deploy
git push heroku main
```

### Environment Variables for Production

- Use strong, random `JWT_SECRET` (32+ characters)
- Ensure `NODE_ENV=production`
- Set restrictive `ALLOWED_ORIGINS`
- Maintain tight rate limit thresholds
- Use HTTPS only for production deployments

---

## 📊 Monitoring & Logging

- **Morgan Logging**: HTTP requests logged to console
- **Error Logging**: All errors logged with context
- **Firebase Logs**: Monitor in Firebase Console

Example Log Output:
```
GET /api/questions?level=beginner 401 15.234 ms - 32
POST /api/questions 403 8.456 ms - 48
```

---

## 🐛 Debugging

### Enable Verbose Logging

Set `DEBUG=*` environment variable:
```bash
DEBUG=* npm run dev
```

### Firebase Debugging

Enable in `src/config/firebase.js`:
```javascript
admin.database.enableLogging(true);
```

### Test Database Connection

```bash
curl -X GET "https://your-project.firebaseio.com/questions/beginner.json"
```

---

## 📝 Sample Firebase Questions Structure

```json
{
  "questions": {
    "beginner": {
      "q1": {
        "id": "q1",
        "questionText": "What is 5 + 7?",
        "options": ["10", "11", "12", "13"],
        "correctAnswer": "12",
        "explanation": "5 + 7 = 12",
        "topic": "addition",
        "difficulty": 1,
        "points": 5,
        "timeLimit": 10,
        "tags": ["basic", "arithmetic"],
        "isActive": true,
        "createdAt": 1681000000000,
        "updatedAt": 1681000000000
      }
    }
  }
}
```

---

## 🤝 Contributing

To contribute improvements:

1. Create a feature branch
2. Make changes
3. Test thoroughly with cURL examples
4. Submit pull request with description

---

## 📄 License

This project is proprietary and confidential.

---

## 📧 Support

For issues or questions, contact the development team.

---

## 🎯 Roadmap

- [ ] User progress tracking
- [ ] Leaderboard system
- [ ] Submission analytics
- [ ] Advanced filtering (category, tags)
- [ ] Question review system for admins
- [ ] Bulk question import
- [ ] GraphQL alternative endpoint
- [ ] Mobile app SDKs
- [ ] WebSocket real-time updates

---

**Last Updated**: April 13, 2026  
**Version**: 1.0.0  
**Status**: Production Ready
