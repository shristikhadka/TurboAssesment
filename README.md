# TurboVets Assessment - Task Management System

A secure, role-based task management system built with NestJS, Angular, and TypeORM. Features JWT authentication, organization-level data scoping, and service-layer RBAC enforcement.

## 🎯 Overview

This application allows users with different roles (ADMIN, USER, VIEWER) to manage tasks within their organization. Tasks are scoped to organizations, ensuring data isolation and security.

## 🛠️ Tech Stack

- **Backend:** NestJS (TypeScript/Node.js)
- **Frontend:** Angular (TypeScript)
- **Database:** SQLite (TypeORM)
- **Authentication:** JWT (JSON Web Tokens)
- **Styling:** TailwindCSS
- **Architecture:** NX Monorepo

## 📋 Features

### ✅ Authentication & Authorization
- JWT-based authentication
- User registration with organization assignment
- Protected routes with JWT guards
- Role-based access control (RBAC)

### ✅ User Roles
- **ADMIN:** Full access (create, read, update, delete tasks + add users)
- **USER:** Can create, read, update tasks (cannot delete)
- **VIEWER:** Read-only access (can only view tasks)

### ✅ Task Management
- Create, read, update, and delete tasks
- Tasks scoped to user's organization
- Status tracking (PENDING, IN_PROGRESS, COMPLETED)

### ✅ Organization Scoping
- Users belong to organizations
- Tasks are isolated by organization
- Users can only see tasks from their organization

### ✅ User Management
- Admins can add users to their organization
- Role assignment during user creation
- Automatic organization assignment

## 🚀 Setup Instructions

### Prerequisites
- Node.js 18+ and npm
- Git (optional, for cloning)

### Installation

1. **Clone or download the repository**
   ```bash
   cd turbovets-assessment
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Start the backend**
   ```bash
   npx nx serve api
   ```
   Backend runs on: `http://localhost:3000`

4. **Start the frontend** (in a new terminal)
   ```bash
   npx nx serve turbovets-assessment
   ```
   Frontend runs on: `http://localhost:4200`

5. **Access the application**
   - Open browser: `http://localhost:4200`
   - You'll be redirected to the login page

### Initial Setup

1. **Create an organization** (if needed)
   - The database will auto-create a default organization (ID: 1) on first run
   - Or manually insert via SQLite:
     ```sql
     INSERT INTO organizations (name) VALUES ('Default Organization');
     ```

2. **Register a user**
   - Go to `/register`
   - Enter email, password (min 6 chars), organizationId (use 1)
   - Click "Register"

3. **Login**
   - Go to `/login`
   - Enter credentials
   - You'll be redirected to `/tasks`

4. **Create an admin user** (optional)
   - Register a user first
   - Then update role in database:
     ```sql
     UPDATE users SET role = 'ADMIN' WHERE email = 'your-email@example.com';
     ```

## 🏗️ Architecture

### Project Structure
```
turbovets-assessment/
├── apps/
│   ├── api/                    # NestJS Backend
│   │   └── src/
│   │       ├── auth/           # Authentication module
│   │       ├── tasks/          # Task CRUD module
│   │       ├── users/          # User management module
│   │       ├── entities/      # Database entities
│   │       ├── guards/         # Auth & Role guards
│   │       └── decorators/    # Custom decorators
│   └── turbovets-assessment/   # Angular Frontend
│       └── src/
│           ├── components/     # UI components
│           ├── services/       # API services
│           └── guards/         # Route guards
├── package.json
└── README.md
```

### Backend Architecture

**Modules:**
- `AuthModule`: Handles authentication (login, register, JWT)
- `TasksModule`: Task CRUD operations with RBAC
- `UsersModule`: User management (admin only)

**Key Components:**
- **Guards:** `JwtAuthGuard` (authentication), `RolesGuard` (authorization)
- **Services:** Business logic with service-layer RBAC enforcement
- **Entities:** User, Organization, Task (TypeORM)

### Frontend Architecture

**Components:**
- `LoginComponent`: User login
- `RegisterComponent`: User registration
- `TaskListComponent`: Task management with role-based UI
- `TaskFormComponent`: Create/edit tasks
- `AddUserComponent`: Add users (admin only)

**Services:**
- `AuthService`: Authentication & token management
- `TaskService`: Task CRUD operations
- `UserService`: User management

**Guards:**
- `AuthGuard`: Protects routes (requires login)

## 🔐 Access Control & RBAC

### How It Works

1. **Authentication:**
   - User logs in → receives JWT token
   - Token stored in localStorage
   - Token sent in `Authorization: Bearer <token>` header

2. **Authorization (RBAC):**
   - **Route Level:** `@Roles()` decorator + `RolesGuard` check user role
   - **Service Level:** Services check roles before operations
   - **Frontend:** UI shows/hides buttons based on user role

3. **Organization Scoping:**
   - Users belong to organizations
   - Tasks are filtered by `organizationId`
   - Users can only access tasks from their organization

### Role Permissions

| Action | ADMIN | USER | VIEWER |
|--------|-------|------|--------|
| View Tasks | ✅ | ✅ | ✅ |
| Create Tasks | ✅ | ✅ | ❌ |
| Update Tasks | ✅ | ✅ | ❌ |
| Delete Tasks | ✅ | ❌ | ❌ |
| Add Users | ✅ | ❌ | ❌ |

### Service-Layer Enforcement

RBAC is enforced at **two levels**:

1. **Guard Level** (Route Protection):
   ```typescript
   @Roles(UserRole.ADMIN, UserRole.USER)
   @Post('/tasks')
   async create() { ... }
   ```

2. **Service Level** (Business Logic):
   ```typescript
   async create(dto: CreateTaskDto, user: User) {
     if (!this.hasRole(user, [UserRole.ADMIN, UserRole.USER])) {
       throw new ForbiddenException('Only ADMIN and USER can create tasks');
     }
     // ... create task
   }
   ```

This ensures security even if guards are bypassed.

## 📡 API Endpoints

### Authentication
- `POST /auth/register` - Register new user
  ```json
  {
    "email": "user@example.com",
    "password": "password123",
    "organizationId": 1
  }
  ```

- `POST /auth/login` - Login
  ```json
  {
    "email": "user@example.com",
    "password": "password123"
  }
  ```
  Returns: `{ "access_token": "..." }`

- `GET /auth/profile` - Get current user (requires JWT)
  Headers: `Authorization: Bearer <token>`

### Tasks
- `GET /tasks` - Get all tasks (organization-scoped, all roles)
- `GET /tasks/:id` - Get task by ID (organization-scoped, all roles)
- `POST /tasks` - Create task (ADMIN, USER only)
  ```json
  {
    "title": "Fix bug",
    "description": "Fix login bug",
    "status": "PENDING"
  }
  ```
- `PUT /tasks/:id` - Update task (ADMIN, USER only)
- `DELETE /tasks/:id` - Delete task (ADMIN only)

### Users (Admin Only)
- `POST /users` - Create user (ADMIN only)
  ```json
  {
    "email": "newuser@example.com",
    "password": "password123",
    "role": "USER"
  }
  ```
- `GET /users` - Get all users in organization (ADMIN only)

## 🧪 Example Workflows

### 1. Register and Login
```bash
# 1. Register
POST http://localhost:3000/auth/register
{
  "email": "admin@test.com",
  "password": "admin123",
  "organizationId": 1
}

# 2. Login
POST http://localhost:3000/auth/login
{
  "email": "admin@test.com",
  "password": "admin123"
}
# Returns: { "access_token": "eyJhbGc..." }

# 3. Use token
GET http://localhost:3000/auth/profile
Headers: Authorization: Bearer eyJhbGc...
```

### 2. Create Task (as USER)
```bash
POST http://localhost:3000/tasks
Headers: Authorization: Bearer <token>
{
  "title": "Complete assessment",
  "description": "Finish TurboVets assessment",
  "status": "PENDING"
}
```

### 3. Try to Delete Task (as USER - Should Fail)
```bash
DELETE http://localhost:3000/tasks/1
Headers: Authorization: Bearer <user-token>
# Returns: 403 Forbidden - "Only ADMIN role can delete tasks"
```

### 4. Add User (as ADMIN)
```bash
POST http://localhost:3000/users
Headers: Authorization: Bearer <admin-token>
{
  "email": "newuser@test.com",
  "password": "password123",
  "role": "USER"
}
```

## 🎨 Design Decisions

### Why NestJS?
- **Modular Architecture:** Easy to organize code into modules
- **Dependency Injection:** Clean, testable code
- **TypeScript:** Type safety and better DX
- **Built-in Guards:** Easy route protection

### Why Angular?
- **TypeScript:** Consistent with backend
- **Dependency Injection:** Familiar pattern from NestJS
- **RxJS:** Powerful reactive programming
- **Component Architecture:** Reusable, maintainable UI

### Why Service-Layer RBAC?
- **Defense in Depth:** Security at multiple layers
- **Business Logic:** RBAC is business logic, belongs in services
- **Testability:** Easier to test service methods
- **Flexibility:** Can be called from multiple places

### Why Organization Scoping?
- **Multi-tenancy:** Support multiple organizations
- **Data Isolation:** Security and privacy
- **Scalability:** Can scale per organization

## 🔮 Future Improvements

Given more time, I would add:

1. **Logging & Audit Trail**
   - Log all user actions
   - Track who created/updated/deleted what
   - Audit log for compliance

2. **Task Assignment**
   - Assign tasks to specific users
   - Task ownership and delegation
   - Notifications on assignment

3. **Advanced Features**
   - Task comments and attachments
   - Due dates and reminders
   - Task filtering and search
   - Pagination for large lists

4. **User Management**
   - Edit/delete users (admin)
   - User profile management
   - Password reset flow

5. **Testing**
   - Unit tests for services
   - Integration tests for API
   - E2E tests for critical flows

6. **Deployment**
   - Docker containerization
   - CI/CD pipeline
   - Environment configuration
   - Production database (PostgreSQL)

## 📝 Notes

- Database file (`database.sqlite`) is created automatically on first run
- Default organization (ID: 1) should be created manually or via migration
- JWT secret should be in environment variable in production
- Password hashing uses bcrypt (10 rounds)

## 🤝 Contributing

This is an assessment project. For questions or issues, please contact the assessment team.

## 📄 License

This project is for assessment purposes only.

---

**Built with ❤️ for TurboVets Assessment**
