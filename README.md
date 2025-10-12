# 🚀 AirTribe TaskMaster

**A Collaborative Task Tracking System** - A comprehensive backend API for managing tasks, projects, and team collaboration with real-time notifications.

![Node.js](https://img.shields.io/badge/Node.js-43853D?style=for-the-badge&logo=node.js&logoColor=white)
![Express.js](https://img.shields.io/badge/Express.js-404D59?style=for-the-badge)
![MongoDB](https://img.shields.io/badge/MongoDB-4EA94B?style=for-the-badge&logo=mongodb&logoColor=white)
![Socket.io](https://img.shields.io/badge/Socket.io-black?style=for-the-badge&logo=socket.io&badgeColor=010101)
![JWT](https://img.shields.io/badge/JWT-black?style=for-the-badge&logo=JSON%20web%20tokens)

## 📋 Table of Contents

- [Features](#-features)
- [Tech Stack](#-tech-stack)
- [Project Structure](#-project-structure)
- [Installation & Setup](#-installation--setup)
- [Environment Variables](#-environment-variables)
- [API Documentation](#-api-documentation)
  - [Authentication Routes](#authentication-routes)
  - [Task Management Routes](#task-management-routes)
  - [Project Management Routes](#project-management-routes)
- [Database Models](#-database-models)
- [Middleware & Validation](#-middleware--validation)
- [File Upload System](#-file-upload-system)
- [Real-time Features](#-real-time-features)
- [Error Handling](#-error-handling)
- [Contributing](#-contributing)
- [License](#-license)

## ✨ Features

### 🔐 **Authentication & Authorization**
- Role-based user registration (Admin/User)
- JWT-based authentication with token blacklisting
- Secure password hashing with bcrypt
- Profile management with authorization checks

### 📝 **Task Management**
- Create, read, update, and delete tasks
- Task assignment to multiple users
- Status tracking (Pending, In-Progress, Completed)
- Due date management
- Task search and filtering capabilities
- Comments system for task collaboration
- File attachments support

### 👥 **Project Management**
- Create collaborative projects
- Invite team members to projects
- Accept/decline project invitations
- Member role management (Owner/Member)
- Project-based task organization

### 🔔 **Real-time Features**
- Socket.io integration for live notifications
- Real-time task assignment notifications
- User presence management

### 📁 **File Management**
- Secure file upload with validation
- Support for images and documents
- File size limitations (5MB)
- Automatic file cleanup on errors

## 🛠 Tech Stack

- **Backend Framework:** Node.js with Express.js
- **Database:** MongoDB with Mongoose ODM
- **Authentication:** JWT (JSON Web Tokens)
- **Real-time Communication:** Socket.io
- **File Upload:** Multer
- **Validation:** Express-validator
- **Password Hashing:** bcrypt
- **Environment Management:** dotenv

## 📁 Project Structure

```
AirTribe_TaskMaster/
├── controllers/           # Business logic handlers
│   ├── userController.js     # User authentication & profile
│   ├── taskController.js     # Task CRUD operations
│   └── projectController.js  # Project management
├── middlewares/          # Request validation & authentication
│   ├── userMiddleware.js     # User-specific middleware
│   ├── taskMiddleware.js     # Task-specific middleware  
│   ├── projectMiddleware.js  # Project-specific middleware
│   └── validations.js        # Input validation rules
├── models/               # Database schemas
│   ├── userModels.js         # User schema
│   ├── taskModels.js         # Task schema with comments/attachments
│   ├── projectModels.js      # Project schema with members
│   └── blackListTokenModels.js # Token blacklist schema
├── routes/               # API route definitions
│   ├── userRoutes.js         # User authentication routes
│   ├── taskRoutes.js         # Task management routes
│   └── projectRoutes.js      # Project management routes
├── utils/                # Utility functions
│   └── multerConfig.js       # File upload configuration
├── uploads/              # File storage directory
├── app.js                # Express app configuration
├── server.js             # Server initialization & Socket.io
└── package.json          # Dependencies & scripts
```

## 🚀 Installation & Setup

### Prerequisites
- Node.js (v14 or higher)
- MongoDB (local or cloud instance)
- npm or yarn package manager

### Installation Steps

1. **Clone the repository**
   ```bash
   git clone https://github.com/Gobinda17/AirTribe_TaskMaster.git
   cd AirTribe_TaskMaster
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Create environment file**
   ```bash
   cp .env.example .env
   ```

4. **Configure environment variables** (see [Environment Variables](#-environment-variables))

5. **Create uploads directory**
   ```bash
   mkdir uploads
   ```

6. **Start the server**
   ```bash
   # Development mode with auto-restart
   npm run dev
   
   # Production mode
   npm start
   ```

The server will start on `http://localhost:3001` (or your configured PORT).

## 🔧 Environment Variables

Create a `.env` file in the root directory with the following variables:

```env
# Server Configuration
PORT=3001

# Database Configuration
MONGODB_URI=mongodb://localhost:27017/airtribe_taskmaster

# JWT Configuration
JWT_SECRET=your_super_secret_jwt_key_here
JWT_EXPIRATION=24h

# File Upload Configuration (Optional)
MAX_FILE_SIZE=5242880  # 5MB in bytes
```

## 📚 API Documentation

**Base URL:** `http://localhost:3001/airtribe/taskmaster/app/api/v1`

## 📊 Routes Overview Table

### 🔐 Authentication Routes

| Method | Endpoint | Parameters | Headers | Request Body | Success Response | Error Responses |
|--------|----------|------------|---------|--------------|------------------|-----------------|
| `POST` | `/register/:role` | `role`: `user`\|`admin` | `Content-Type: application/json` | `{"name": "string", "email": "string", "password": "string"}` | **201** - `"User registered with role: {role}"` | **400** - Validation errors<br>**409** - Email already exists<br>**500** - Server error |
| `POST` | `/login/:role` | `role`: `user`\|`admin` | `Content-Type: application/json` | `{"email": "string", "password": "string"}` | **200** - `{"status": "success", "message": "Login successful", "user": "User Name: {name}, User Email: {email}", "token": "jwt_token"}` | **400** - Validation errors<br>**401** - Invalid credentials<br>**404** - Email not found<br>**500** - Server error |
| `PATCH` | `/profile/user/:id` | `id`: User ID | `Authorization: Bearer {token}`<br>`Content-Type: application/json` | `{"name": "string", "email": "string"}` (both optional) | **200** - `{"status": "success", "message": "User profile updated successfully"}` | **400** - Validation errors<br>**401** - Unauthorized<br>**403** - Forbidden<br>**500** - Server error |
| `POST` | `/logout` | None | `Authorization: Bearer {token}` | None | **200** - `{"status": "success", "message": "Logged out successfully. Token invalidated."}` | **401** - Unauthorized/Token blacklisted<br>**500** - Server error |

### 📝 Task Management Routes

| Method | Endpoint | Parameters | Headers | Request Body | Success Response | Error Responses |
|--------|----------|------------|---------|--------------|------------------|-----------------|
| `POST` | `/task` | None | `Authorization: Bearer {token}`<br>`Content-Type: application/json` | `{"title": "string", "description": "string", "status": "pending\|in-progress\|completed", "dueDate": "ISO8601", "assignedTo": ["userId1", "userId2"]}` | **201** - `{"status": "success", "message": "Task created successfully", "task": {taskObject}}` | **400** - Validation errors<br>**401** - Unauthorized<br>**409** - Duplicate task title<br>**500** - Server error |
| `GET` | `/task` | None | `Authorization: Bearer {token}` | None | **200** - `{"status": "success", "tasks": [taskArray]}` | **401** - Unauthorized<br>**404** - No tasks found<br>**500** - Server error |
| `PATCH` | `/task/:id` | `id`: Task ID | `Authorization: Bearer {token}`<br>`Content-Type: application/json` | `{"title": "string", "description": "string", "status": "string", "dueDate": "ISO8601", "addAssignedTo": ["userId"], "removeAssignedTo": ["userId"]}` (all optional) | **200** - `{"status": "success", "message": "Task updated successfully", "task": {taskObject}}` | **400** - Validation errors<br>**401** - Unauthorized<br>**404** - Task not found<br>**500** - Server error |
| `GET` | `/task/search` | `query`: Search term | `Authorization: Bearer {token}` | None | **200** - `{"status": "success", "count": number, "tasks": [taskArray]}` | **400** - Missing query<br>**401** - Unauthorized<br>**404** - No matching tasks<br>**500** - Server error |
| `GET` | `/task/filter` | `status`: `pending`\|`in-progress`\|`completed` | `Authorization: Bearer {token}` | None | **200** - `{"status": "success", "count": number, "tasks": [taskArray]}` | **400** - Invalid/missing status<br>**401** - Unauthorized<br>**500** - Server error |
| `PATCH` | `/task/:id/comment` | `id`: Task ID | `Authorization: Bearer {token}`<br>`Content-Type: application/json` | `{"text": "string"}` | **200** - `{"status": "success", "message": "Comment added successfully", "task": {taskObject}}` | **400** - Missing comment text<br>**401** - Unauthorized<br>**404** - Task not found<br>**500** - Server error |
| `PATCH` | `/task/:id/attachment` | `id`: Task ID | `Authorization: Bearer {token}`<br>`Content-Type: multipart/form-data` | Form Data: `attachment`: File (jpg, jpeg, png, pdf, doc, docx) | **200** - `{"status": "success", "message": "Attachment added successfully.", "task": {taskObject}}` | **400** - No file uploaded<br>**401** - Unauthorized<br>**404** - Task not found<br>**500** - Server error |
| `DELETE` | `/task/:id` | `id`: Task ID | `Authorization: Bearer {token}` | None | **200** - `{"status": "success", "message": "Task deleted successfully.", "task": {deletedTaskObject}}` | **401** - Unauthorized<br>**404** - Task not found<br>**500** - Server error |

### 👥 Project Management Routes

| Method | Endpoint | Parameters | Headers | Request Body | Success Response | Error Responses |
|--------|----------|------------|---------|--------------|------------------|-----------------|
| `POST` | `/project` | None | `Authorization: Bearer {token}`<br>`Content-Type: application/json` | `{"name": "string", "description": "string", "members": ["userId1", "userId2"]}` (description & members optional) | **201** - `{"status": "success", "message": "Project created successfully", "project": {projectObject}}` | **400** - Validation errors<br>**401** - Unauthorized<br>**409** - Project name exists<br>**500** - Server error |
| `POST` | `/project/:id/invite` | `id`: Project ID | `Authorization: Bearer {token}`<br>`Content-Type: application/json` | `{"members": ["userId1", "userId2"]}` | **200** - `{"status": "success", "message": "Members invited successfully", "project": {projectObject}}` | **400** - Validation errors<br>**401** - Unauthorized<br>**403** - Not authorized<br>**404** - Project not found<br>**500** - Server error |
| `PATCH` | `/project/:id/:accept` | `id`: Project ID<br>`accept`: `true`\|`false` | `Authorization: Bearer {token}` | None | **200** - `{"status": "success", "message": "Invite accepted/declined", "project": {projectObject}}` | **400** - Invite already accepted<br>**401** - Unauthorized<br>**403** - No invite found<br>**404** - Project not found<br>**500** - Server error |

## 📋 HTTP Status Code Reference

| Status Code | Meaning | When It Occurs |
|-------------|---------|----------------|
| **200** | OK | Successful GET, PATCH, DELETE operations |
| **201** | Created | Successful POST operations (user registration, task creation, project creation) |
| **400** | Bad Request | Validation errors, missing required fields, invalid data format |
| **401** | Unauthorized | Missing/invalid JWT token, token blacklisted |
| **403** | Forbidden | User doesn't have permission (e.g., updating other user's profile) |
| **404** | Not Found | Resource doesn't exist (user, task, project not found) |
| **409** | Conflict | Duplicate data (email already exists, duplicate task title, project name exists) |
| **500** | Internal Server Error | Database errors, server crashes, unexpected errors |

## 📝 Detailed Request/Response Examples

### Authentication Routes

#### 🔐 User Registration
```http
POST /register/:role
```

**Parameters:**
- `role` (path): `user` or `admin`

**Request Body:**
```json
{
  "name": "John Doe",
  "email": "john@example.com",
  "password": "password123"
}
```

**Response:**
```json
"User registered with role: user"
```

#### 🔓 User Login
```http
POST /login/:role
```

**Parameters:**
- `role` (path): `user` or `admin`

**Request Body:**
```json
{
  "email": "john@example.com",
  "password": "password123"
}
```

**Response:**
```json
{
  "status": "success",
  "message": "Login successful",
  "user": "User Name: John Doe, User Email: john@example.com",
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

#### 👤 Update Profile
```http
PATCH /profile/user/:id
```

**Headers:**
```
Authorization: Bearer <your_jwt_token>
```

**Request Body:**
```json
{
  "name": "John Smith",
  "email": "johnsmith@example.com"
}
```

#### 🚪 Logout
```http
POST /logout
```

**Headers:**
```
Authorization: Bearer <your_jwt_token>
```

### Task Management Routes

#### ➕ Create Task
```http
POST /task
```

**Headers:**
```
Authorization: Bearer <your_jwt_token>
```

**Request Body:**
```json
{
  "title": "Complete API Documentation",
  "description": "Write comprehensive API documentation for the project",
  "status": "pending",
  "dueDate": "2025-10-20T10:00:00.000Z",
  "assignedTo": ["user_id_1", "user_id_2"]
}
```

#### 📋 View Assigned Tasks
```http
GET /task
```

**Headers:**
```
Authorization: Bearer <your_jwt_token>
```

#### ✏️ Update Task
```http
PATCH /task/:id
```

**Headers:**
```
Authorization: Bearer <your_jwt_token>
```

**Request Body:**
```json
{
  "title": "Updated Task Title",
  "status": "in-progress",
  "addAssignedTo": ["new_user_id"],
  "removeAssignedTo": ["old_user_id"]
}
```

#### 🔍 Search Tasks
```http
GET /task/search?query=API
```

**Headers:**
```
Authorization: Bearer <your_jwt_token>
```

**Query Parameters:**
- `query`: Search term for title or description

#### 🏷️ Filter Tasks by Status
```http
GET /task/filter?status=pending
```

**Headers:**
```
Authorization: Bearer <your_jwt_token>
```

**Query Parameters:**
- `status`: `pending`, `in-progress`, or `completed`

#### 💬 Add Comment to Task
```http
PATCH /task/:id/comment
```

**Headers:**
```
Authorization: Bearer <your_jwt_token>
```

**Request Body:**
```json
{
  "text": "This task is progressing well!"
}
```

#### 📎 Add Attachment to Task
```http
PATCH /task/:id/attachment
```

**Headers:**
```
Authorization: Bearer <your_jwt_token>
Content-Type: multipart/form-data
```

**Form Data:**
- `attachment`: File (images: jpg, jpeg, png; documents: pdf, doc, docx)

#### 🗑️ Delete Task
```http
DELETE /task/:id
```

**Headers:**
```
Authorization: Bearer <your_jwt_token>
```

### Project Management Routes

#### 🆕 Create Project
```http
POST /project
```

**Headers:**
```
Authorization: Bearer <your_jwt_token>
```

**Request Body:**
```json
{
  "name": "Website Redesign Project",
  "description": "Complete redesign of company website",
  "members": ["user_id_1", "user_id_2"]
}
```

#### 📧 Send Project Invitations
```http
POST /project/:id/invite
```

**Headers:**
```
Authorization: Bearer <your_jwt_token>
```

**Request Body:**
```json
{
  "members": ["user_id_3", "user_id_4"]
}
```

#### ✅ Accept/Decline Project Invitation
```http
PATCH /project/:id/:accept
```

**Headers:**
```
Authorization: Bearer <your_jwt_token>
```

**Parameters:**
- `id`: Project ID
- `accept`: `true` to accept, `false` to decline

## 🗄️ Database Models

### User Model
```javascript
{
  name: String (required),
  email: String (required, unique),
  password: String (required, hashed),
  role: String (enum: ['admin', 'user']),
  createdAt: Date,
  updatedAt: Date
}
```

### Task Model
```javascript
{
  title: String (required),
  description: String (required),
  createdBy: ObjectId (ref: Users),
  status: String (enum: ['pending', 'in-progress', 'completed']),
  assignedTo: [ObjectId] (ref: Users),
  dueDate: Date (required),
  comments: [{
    user: ObjectId (ref: User),
    text: String,
    createdAt: Date
  }],
  attachments: [{
    fileName: String,
    fileUrl: String,
    uploadedBy: ObjectId (ref: User),
    uploadedAt: Date
  }],
  createdAt: Date,
  updatedAt: Date
}
```

### Project Model
```javascript
{
  name: String (required, unique),
  description: String,
  createdBy: ObjectId (ref: User),
  members: [{
    user: ObjectId (ref: User),
    role: String (enum: ['owner', 'member']),
    invitedAt: Date,
    joined: Boolean
  }],
  createdAt: Date,
  updatedAt: Date
}
```

### BlacklistedToken Model
```javascript
{
  token: String (required),
  expiresAt: Date (required, TTL index)
}
```

## 🛡️ Middleware & Validation

### Authentication Middleware
- **JWT Verification:** Validates JWT tokens and checks blacklist
- **User Existence:** Ensures authenticated users still exist in database
- **Role-based Access:** Controls access based on user roles

### Validation Rules
- **Input Validation:** Express-validator for request data validation
- **File Type Validation:** Restricts file uploads to allowed formats
- **Size Limitations:** Prevents large file uploads
- **MongoDB ObjectId Validation:** Ensures valid database references

### Security Features
- **Password Hashing:** bcrypt with salt rounds
- **Token Blacklisting:** Immediate token invalidation on logout
- **CORS Configuration:** Configurable cross-origin requests
- **File Upload Security:** Type and size restrictions

## 📁 File Upload System

### Supported File Types
- **Images:** JPEG, JPG, PNG
- **Documents:** PDF, DOC, DOCX

### Configuration
- **Storage:** Local disk storage with unique filenames
- **Size Limit:** 5MB per file
- **Naming Convention:** `timestamp-originalname.ext`
- **Upload Directory:** `./uploads/`

### Security Measures
- File type validation (extension + MIME type)
- Automatic cleanup on upload errors
- Unique filename generation to prevent conflicts

## 🔔 Real-time Features

### Socket.io Integration
- **User Rooms:** Individual user rooms for targeted notifications
- **Task Notifications:** Real-time alerts for task assignments
- **Connection Management:** Automatic connection/disconnection handling

### Event Types
- `join`: User joins their notification room
- `notify-task`: Send task-related notifications
- `task-assigned`: Notification when assigned to a task
- `task-notification`: General task notifications

## ⚠️ Error Handling

### HTTP Status Codes
- **200:** Success
- **201:** Created
- **400:** Bad Request (validation errors)
- **401:** Unauthorized (invalid/missing token)
- **403:** Forbidden (insufficient permissions)
- **404:** Not Found (resource doesn't exist)
- **409:** Conflict (duplicate data)
- **500:** Internal Server Error

### Error Response Format
```json
{
  "status": "error",
  "message": "Error description here"
}
```

## 🏃‍♂️ Getting Started - Quick Example

1. **Register a user:**
   ```bash
   curl -X POST http://localhost:3001/airtribe/taskmaster/app/api/v1/register/user \
   -H "Content-Type: application/json" \
   -d '{"name":"John Doe","email":"john@example.com","password":"password123"}'
   ```

2. **Login:**
   ```bash
   curl -X POST http://localhost:3001/airtribe/taskmaster/app/api/v1/login/user \
   -H "Content-Type: application/json" \
   -d '{"email":"john@example.com","password":"password123"}'
   ```

3. **Create a task:**
   ```bash
   curl -X POST http://localhost:3001/airtribe/taskmaster/app/api/v1/task \
   -H "Authorization: Bearer YOUR_JWT_TOKEN" \
   -H "Content-Type: application/json" \
   -d '{"title":"My First Task","description":"Task description","dueDate":"2025-12-31","assignedTo":["USER_ID"]}'
   ```

## 🤝 Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 👨‍💻 Author

**Gobinda Deb**
- GitHub: [@Gobinda17](https://github.com/Gobinda17)

---

⭐ **Star this repository if you found it helpful!**