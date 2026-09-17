# Task Manager - Backend API

A robust, scalable Express.js backend API providing comprehensive task management, project tracking, and team collaboration features with enterprise-grade security and performance.

## 🎯 Overview

The backend API serves as the core engine for the Task Manager system, providing secure authentication, data management, file handling, real-time notifications, and comprehensive analytics for both admin and user interfaces.

## ✨ Key Features

### Core Functionality

- 🔐 **JWT Authentication** - Secure token-based authentication system
- 📊 **Project Management** - Complete project lifecycle management
- ✅ **Task Management** - Full CRUD operations with advanced filtering
- ⏱️ **Time Tracking** - Comprehensive time monitoring and analytics
- 👥 **User Management** - Role-based access control and team management
- 🏃‍♂️ **Sprint Management** - Agile development support
- 🎯 **Milestone Tracking** - Project milestone management

### Advanced Features

- 📁 **File Management** - AWS S3 integration with secure uploads
- 📧 **Email Integration** - Automated notifications and communications
- 🔍 **Global Search** - Advanced search across all entities
- 📈 **Analytics & Reporting** - Comprehensive dashboards and insights
- 🔔 **Real-time Notifications** - Instant updates and alerts
- 🎫 **Support System** - Built-in ticketing and help desk
- 💬 **Comment System** - Task and project collaboration
- 📋 **Activity Logging** - Comprehensive audit trails

### Security & Performance

- 🛡️ **Security Hardening** - Helmet, CORS, rate limiting
- 🔒 **Data Encryption** - Secure data storage and transmission
- 📊 **Performance Monitoring** - Winston logging and metrics
- 🚀 **Rate Limiting** - API protection and abuse prevention
- 💾 **Database Optimization** - Efficient MongoDB operations
- 🔄 **Backup System** - Automated data backup and recovery

## 🛠️ Technology Stack

### Core Technologies

- **Node.js 20+** - Modern JavaScript runtime
- **Express.js** - Fast, unopinionated web framework
- **MongoDB** - NoSQL database with Mongoose ODM
- **JWT** - JSON Web Token authentication
- **bcryptjs** - Password hashing and security

### Cloud & Storage

- **AWS S3** - Scalable file storage and management
- **AWS SDK v3** - Modern AWS integration
- **Multer** - File upload middleware
- **Sharp** - Image processing and optimization

### Communication & Notifications

- **Nodemailer** - Email service integration
- **Winston** - Comprehensive logging system
- **Morgan** - HTTP request logging
- **Socket.io** - Real-time communication (planned)

### Security & Middleware

- **Helmet** - Security headers and protection
- **CORS** - Cross-origin resource sharing
- **express-rate-limit** - API rate limiting
- **express-validator** - Input validation and sanitization
- **compression** - Response compression

## 🚀 Getting Started

### Prerequisites

- **Node.js 20+** - Latest LTS version recommended
- **MongoDB** - Local instance or MongoDB Atlas
- **AWS Account** - For S3 file storage
- **Email Service** - SMTP credentials (Gmail, SendGrid, etc.)

### Installation

1. **Clone and Navigate**

   ```bash
   git clone <repository-url>
   cd server
   ```

2. **Install Dependencies**

   ```bash
   npm install
   ```

3. **Environment Configuration**

   Copy `.env.example` to `.env` and configure:

   ```env
   # Server Configuration
   PORT=9012
   NODE_ENV=development

   # Database Configuration
   MONGODB_URI=mongodb://localhost:27017/taskmanager
   # For MongoDB Atlas:
   # MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/taskmanager

   # JWT Configuration
   JWT_SECRET=your_super_secure_jwt_secret_key_here_min_32_chars
   JWT_EXPIRE=7d
   JWT_REFRESH_SECRET=your_refresh_token_secret_here
   JWT_REFRESH_EXPIRE=30d

   # Email Configuration (Gmail Example)
   EMAIL_HOST=smtp.gmail.com
   EMAIL_PORT=587
   EMAIL_SECURE=false
   EMAIL_USER=your_email@gmail.com
   EMAIL_PASS=your_app_specific_password
   EMAIL_FROM=noreply@taskmanager.com

   # AWS S3 Configuration
   AWS_ACCESS_KEY_ID=your_aws_access_key_id
   AWS_SECRET_ACCESS_KEY=your_aws_secret_access_key
   AWS_REGION=us-east-1
   AWS_S3_BUCKET=your-task-manager-bucket

   # Rate Limiting Configuration
   MAX_LOGIN_ATTEMPTS=10
   LOGIN_WINDOW_MINUTES=10
   API_RATE_LIMIT=500
   API_WINDOW_MINUTES=10

   # Security Configuration
   BCRYPT_ROUNDS=12
   SESSION_SECRET=your_session_secret_here

   # File Upload Configuration
   MAX_FILE_SIZE=10485760  # 10MB in bytes
   ALLOWED_FILE_TYPES=jpg,jpeg,png,gif,pdf,doc,docx,xls,xlsx,ppt,pptx,txt,zip
   ```

4. **Database Setup**

   ```bash
   # Run setup script to create initial data
   npm run setup
   ```

5. **Start the Server**

   ```bash
   # Development mode with auto-reload
   npm run dev

   # Production mode
   npm start
   ```

   Server will be available at [http://localhost:9012](http://localhost:9012)

## 📁 Project Structure

```
server/
├── config/                 # Configuration files
│   ├── aws.js             # AWS S3 configuration
│   ├── database.js        # MongoDB connection
│   ├── jwt.js             # JWT utilities
│   └── nodemailer.js      # Email configuration
├── controllers/           # Request handlers
│   ├── admin/             # Admin-specific controllers
│   │   ├── auth.js        # Admin authentication
│   │   ├── dashboard.js   # Analytics and metrics
│   │   ├── project.js     # Project management
│   │   ├── task.js        # Task management
│   │   ├── user.js        # User administration
│   │   └── ...            # Other admin controllers
│   └── user/              # User-specific controllers
│       ├── auth.js        # User authentication
│       ├── task.js        # User task operations
│       ├── timeTracking.js # Time tracking
│       └── ...            # Other user controllers
├── middleware/            # Custom middleware
│   ├── auth.js           # Authentication middleware
│   ├── errorHandler.js   # Global error handling
│   ├── upload.js         # File upload handling
│   └── validation.js     # Input validation
├── models/               # Database schemas
│   ├── user.js          # User model
│   ├── project.js       # Project model
│   ├── task.js          # Task model
│   ├── timeTracking.js  # Time tracking model
│   └── ...              # Other models
├── routes/              # API route definitions
│   ├── admin/           # Admin routes
│   └── user/            # User routes
├── templates/           # Email templates
│   └── emailTemplates.js # HTML email templates
├── utils/               # Utility functions
│   ├── backup.js        # Database backup utilities
│   ├── encryption.js    # Data encryption helpers
│   ├── logger.js        # Winston logger setup
│   └── ...              # Other utilities
├── uploads/             # Local file storage (temporary)
├── logs/                # Application logs
├── .env                 # Environment variables
├── .env.example         # Environment template
├── Dockerfile           # Docker configuration
├── package.json         # Dependencies and scripts
├── server.js            # Main application entry
├── setup.js             # Database setup script
└── README.md            # This file
```

## 🔌 API Endpoints

### Authentication Endpoints

#### Admin Authentication

```http
POST /api/v1/admin/auth/login
POST /api/v1/admin/auth/logout
POST /api/v1/admin/auth/refresh
GET  /api/v1/admin/auth/profile
PUT  /api/v1/admin/auth/profile
```

#### User Authentication

```http
POST /api/v1/user/auth/login
POST /api/v1/user/auth/logout
POST /api/v1/user/auth/refresh
GET  /api/v1/user/auth/profile
PUT  /api/v1/user/auth/profile
POST /api/v1/user/auth/forgot-password
POST /api/v1/user/auth/reset-password
```

### Admin Management Endpoints

#### Dashboard & Analytics

```http
GET  /api/v1/admin/dashboard/overview
GET  /api/v1/admin/dashboard/productivity
GET  /api/v1/admin/dashboard/team-performance
GET  /api/v1/admin/dashboard/project-metrics
```

#### User Management

```http
GET    /api/v1/admin/user
POST   /api/v1/admin/user
GET    /api/v1/admin/user/:id
PUT    /api/v1/admin/user/:id
DELETE /api/v1/admin/user/:id
POST   /api/v1/admin/user/invite
PUT    /api/v1/admin/user/:id/status
```

#### Project Management

```http
GET    /api/v1/admin/project
POST   /api/v1/admin/project
GET    /api/v1/admin/project/:id
PUT    /api/v1/admin/project/:id
DELETE /api/v1/admin/project/:id
GET    /api/v1/admin/project/:id/tasks
GET    /api/v1/admin/project/:id/team
```

#### Task Management

```http
GET    /api/v1/admin/task
POST   /api/v1/admin/task
GET    /api/v1/admin/task/:id
PUT    /api/v1/admin/task/:id
DELETE /api/v1/admin/task/:id
PUT    /api/v1/admin/task/:id/assign
PUT    /api/v1/admin/task/:id/status
```

### User Endpoints

#### Task Operations

```http
GET  /api/v1/user/task
GET  /api/v1/user/task/:id
PUT  /api/v1/user/task/:id
PUT  /api/v1/user/task/:id/status
POST /api/v1/user/task/:id/comment
GET  /api/v1/user/task/:id/comments
```

#### Time Tracking

```http
POST /api/v1/user/time-tracking/start
POST /api/v1/user/time-tracking/stop
POST /api/v1/user/time-tracking/pause
POST /api/v1/user/time-tracking/resume
GET  /api/v1/user/time-tracking
GET  /api/v1/user/time-tracking/summary
```

#### Notifications

```http
GET  /api/v1/user/notifications
PUT  /api/v1/user/notifications/:id/read
PUT  /api/v1/user/notifications/mark-all-read
DELETE /api/v1/user/notifications/:id
```

### File Management

```http
POST /api/v1/upload/file
POST /api/v1/upload/avatar
GET  /api/v1/upload/:filename
DELETE /api/v1/upload/:filename
```

### Support System

```http
GET    /api/v1/support/tickets
POST   /api/v1/support/tickets
GET    /api/v1/support/tickets/:id
PUT    /api/v1/support/tickets/:id
DELETE /api/v1/support/tickets/:id
```

### Health Check

```http
GET /health
GET /api/v1/health
```

## 🔐 Security Implementation

### Authentication & Authorization

```javascript
// JWT Token Structure
{
  "user": {
    "id": "user_id",
    "email": "user@example.com",
    "role": "admin|user",
    "permissions": ["read", "write", "delete"]
  },
  "iat": 1640995200,
  "exp": 1641600000
}
```

### Rate Limiting Configuration

```javascript
// Login Rate Limiting
const loginLimiter = rateLimit({
  windowMs: 10 * 60 * 1000, // 10 minutes
  max: 10, // 10 attempts per window
  message: "Too many login attempts, please try again later",
});

// API Rate Limiting
const apiLimiter = rateLimit({
  windowMs: 10 * 60 * 1000, // 10 minutes
  max: 500, // 500 requests per window
  message: "Too many requests, please try again later",
});
```

### Input Validation

```javascript
// Example validation middleware
const validateTask = [
  body("title").isLength({ min: 1, max: 200 }).trim().escape(),
  body("description").optional().isLength({ max: 2000 }).trim(),
  body("priority").isIn(["low", "medium", "high", "urgent"]),
  body("dueDate").optional().isISO8601().toDate(),
  // ... more validations
];
```

## 📊 Database Schema

### User Model

```javascript
{
  _id: ObjectId,
  firstName: String,
  lastName: String,
  email: String (unique),
  password: String (hashed),
  role: String (enum: ['admin', 'user']),
  avatar: String,
  isActive: Boolean,
  lastLogin: Date,
  createdAt: Date,
  updatedAt: Date
}
```

### Project Model

```javascript
{
  _id: ObjectId,
  name: String,
  description: String,
  client: ObjectId (ref: 'Client'),
  manager: ObjectId (ref: 'User'),
  team: [ObjectId] (ref: 'User'),
  status: String (enum: ['active', 'completed', 'on-hold']),
  startDate: Date,
  endDate: Date,
  technologies: [ObjectId] (ref: 'Technology'),
  createdAt: Date,
  updatedAt: Date
}
```

### Task Model

```javascript
{
  _id: ObjectId,
  title: String,
  description: String,
  project: ObjectId (ref: 'Project'),
  assignee: ObjectId (ref: 'User'),
  reporter: ObjectId (ref: 'User'),
  status: String (enum: ['todo', 'in-progress', 'testing', 'done']),
  priority: String (enum: ['low', 'medium', 'high', 'urgent']),
  dueDate: Date,
  estimatedHours: Number,
  actualHours: Number,
  attachments: [String],
  comments: [ObjectId] (ref: 'TaskComment'),
  createdAt: Date,
  updatedAt: Date
}
```

### Time Tracking Model

```javascript
{
  _id: ObjectId,
  user: ObjectId (ref: 'User'),
  task: ObjectId (ref: 'Task'),
  project: ObjectId (ref: 'Project'),
  startTime: Date,
  endTime: Date,
  duration: Number, // in seconds
  description: String,
  isActive: Boolean,
  createdAt: Date,
  updatedAt: Date
}
```

## 📈 Performance & Monitoring

### Logging Configuration

```javascript
// Winston Logger Setup
const logger = winston.createLogger({
  level: "info",
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.errors({ stack: true }),
    winston.format.json()
  ),
  transports: [
    new winston.transports.File({ filename: "logs/error.log", level: "error" }),
    new winston.transports.File({ filename: "logs/combined.log" }),
    new winston.transports.Console({
      format: winston.format.simple(),
    }),
  ],
});
```

### Database Optimization

- **Indexing Strategy** - Optimized indexes for frequent queries
- **Aggregation Pipelines** - Efficient data processing
- **Connection Pooling** - Optimized MongoDB connections
- **Query Optimization** - Lean queries and projection

### Caching Strategy

- **Memory Caching** - Frequently accessed data
- **Query Result Caching** - Database query optimization
- **File Caching** - Static asset optimization
- **API Response Caching** - Reduced server load

## 🚀 Deployment

### Docker Deployment

```dockerfile
FROM node:20
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production
COPY . .
EXPOSE 9012
CMD ["npm", "start"]
```

```bash
# Build and run
docker build -t task-manager-server .
docker run -p 9012:9012 --env-file .env task-manager-server
```

### Production Deployment

```bash
# Install production dependencies
npm ci --only=production

# Start with PM2 (recommended)
npm install -g pm2
pm2 start server.js --name "task-manager-api"

# Or start directly
npm start
```

### Environment-specific Configuration

```javascript
// Production optimizations
if (process.env.NODE_ENV === "production") {
  app.use(compression());
  app.use(helmet());
  app.set("trust proxy", 1);
}
```

## 🔧 Development

### Available Scripts

```bash
npm start          # Start production server
npm run dev        # Start development server with nodemon
npm run setup      # Initialize database with sample data
npm test           # Run test suite (when implemented)
npm run lint       # Run ESLint
npm run format     # Format code with Prettier
```

### Development Workflow

1. **Setup Environment** - Configure .env file
2. **Install Dependencies** - Run npm install
3. **Database Setup** - Run npm run setup
4. **Start Development** - Run npm run dev
5. **Test API** - Use Postman or similar tool

### API Testing

```bash
# Health check
curl http://localhost:9012/health

# Login (get token)
curl -X POST http://localhost:9012/api/v1/admin/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@example.com","password":"password"}'

# Use token in subsequent requests
curl -X GET http://localhost:9012/api/v1/admin/dashboard/overview \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

## 🔍 Troubleshooting

### Common Issues

#### Database Connection

```bash
# Check MongoDB status
mongosh --eval "db.adminCommand('ismaster')"

# Test connection string
node -e "require('./config/database.js')"
```

#### Environment Variables

```bash
# Verify environment loading
node -e "require('dotenv').config(); console.log(process.env.MONGODB_URI)"
```

#### File Upload Issues

```bash
# Check AWS credentials
aws s3 ls s3://your-bucket-name

# Test S3 connection
node -e "require('./config/aws.js').testConnection()"
```

### Performance Issues

- **Database Queries** - Use MongoDB Compass to analyze slow queries
- **Memory Usage** - Monitor with `process.memoryUsage()`
- **CPU Usage** - Use Node.js profiler or clinic.js
- **Network Latency** - Check API response times

### Security Checklist

- [ ] Environment variables properly configured
- [ ] JWT secrets are strong and unique
- [ ] Rate limiting is enabled
- [ ] Input validation is implemented
- [ ] HTTPS is enabled in production
- [ ] Database access is restricted
- [ ] File upload restrictions are in place
- [ ] Error messages don't leak sensitive information

## 📚 Additional Resources

### Documentation

- [MongoDB Documentation](https://docs.mongodb.com/)
- [Express.js Guide](https://expressjs.com/en/guide/)
- [JWT.io](https://jwt.io/)
- [AWS S3 Documentation](https://docs.aws.amazon.com/s3/)

### Tools & Extensions

- **Postman** - API testing and documentation
- **MongoDB Compass** - Database GUI
- **Winston Dashboard** - Log visualization
- **PM2 Monitor** - Process monitoring

## 🤝 Contributing

### Development Guidelines

1. **Code Style** - Follow ESLint configuration
2. **Commit Messages** - Use conventional commit format
3. **Testing** - Write tests for new features
4. **Documentation** - Update API documentation
5. **Security** - Follow security best practices

### Pull Request Process

1. Fork the repository
2. Create feature branch (`git checkout -b feature/amazing-feature`)
3. Commit changes (`git commit -m 'Add amazing feature'`)
4. Push to branch (`git push origin feature/amazing-feature`)
5. Open Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🆘 Support

### Getting Help

- **Documentation** - Check this comprehensive guide
- **Issues** - Create GitHub issues for bugs
- **Discussions** - Use GitHub discussions for questions
- **Email** - Contact the development team

### Contact Information

- **Author** - Rowthtech2025
- **Lead Developer** - Nishchay Sharma (nishchay340@gmail.com)
- **Repository** - [GitHub Repository URL]

---

**Built with ❤️ by Rowthtech2025 Team**

_Powering productive teams with robust backend infrastructure_
