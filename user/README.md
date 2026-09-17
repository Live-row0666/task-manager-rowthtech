# Task Manager - User Interface

A modern, intuitive task management interface designed for team members to efficiently manage their daily tasks, track time, and collaborate on projects.

## 🎯 Overview

The User Interface provides a streamlined experience for team members to focus on their tasks, track time, collaborate with teammates, and stay updated on project progress without administrative complexity.

## ✨ Key Features

### Task Management
- **Personal Task Board** - Kanban-style interface with drag-and-drop
- **Task Details** - Comprehensive task information and editing
- **Task Status Tracking** - Visual progress indicators
- **Task Comments** - Team collaboration and communication
- **File Attachments** - Document and media sharing

### Time Tracking
- **Built-in Timer** - Start/stop/pause functionality
- **Automatic Tracking** - Time tracking based on task status
- **Time Logs** - Detailed time entry records
- **Productivity Analytics** - Personal time insights
- **Multiple Time Formats** - Standard and readable time display

### Project Collaboration
- **Project Overview** - Access to assigned projects
- **Team Communication** - Task-based discussions
- **Real-time Updates** - Live notifications and updates
- **Progress Visibility** - Track project and milestone progress

### Personal Productivity
- **Notification Center** - Stay updated on task changes
- **Dashboard Analytics** - Personal productivity metrics
- **Task Filtering** - Find tasks quickly with advanced filters
- **Support System** - Built-in help and ticket system

## 🛠️ Technology Stack

### Core Technologies
- **React 18** - Modern React with hooks and concurrent features
- **Redux & Redux-Saga** - Predictable state management
- **React Router v6** - Client-side routing
- **Bootstrap 5** - Responsive UI framework
- **SASS/SCSS** - Advanced styling capabilities

### UI Components & Libraries
- **React Beautiful DnD** - Smooth drag-and-drop experience
- **Framer Motion** - Smooth animations and transitions
- **React Hook Form** - Efficient form handling
- **React Datepicker** - Date selection components
- **React Select** - Enhanced select components
- **React Toastify** - User-friendly notifications

### Productivity Tools
- **Moment.js** - Date and time manipulation
- **React Icons** - Comprehensive icon library
- **React Screen Capture** - Built-in screenshot functionality
- **Axios** - HTTP client for API communication

## 🚀 Getting Started

### Prerequisites
- Node.js 20+
- npm or yarn package manager
- Backend API running on port 9012
- User account created by administrator

### Installation

1. **Navigate to user directory**
   ```bash
   cd user
   ```

2. **Install dependencies**
   ```bash
   npm install
   # or
   yarn install
   ```

3. **Environment Configuration**
   
   Create `.env` file in the user directory:
   ```env
   REACT_APP_API_URL=http://localhost:9012/api/v1
   REACT_APP_SOCKET_URL=http://localhost:9012
   REACT_APP_ENVIRONMENT=development
   REACT_APP_VERSION=3.0.0
   ```

4. **Start Development Server**
   ```bash
   npm start
   # or
   yarn start
   ```

   The application will be available at [http://localhost:9014](http://localhost:9014)

## 📁 Project Structure

```
user/
├── public/                 # Static assets
│   ├── fonts/             # Custom fonts
│   ├── favicon.ico        # App icon
│   └── index.html         # HTML template
├── src/
│   ├── apps/              # Feature-specific components
│   │   └── Tasks/         # Task-related components
│   ├── assets/            # Images, fonts, and SCSS
│   │   ├── fonts/         # Web fonts
│   │   ├── images/        # Static images
│   │   └── scss/          # Styling files
│   ├── components/        # Reusable UI components
│   ├── constants/         # App constants and configs
│   ├── helpers/           # Utility functions
│   ├── hooks/             # Custom React hooks
│   ├── layouts/           # Page layouts
│   ├── pages/             # Application pages
│   │   ├── User/          # User-specific pages
│   │   ├── support/       # Support system
│   │   └── Task-Manager/  # Task management features
│   ├── redux/             # State management
│   │   ├── auth/          # Authentication state
│   │   ├── projects/      # Project data
│   │   ├── tasks/         # Task management
│   │   └── notifications/ # Notification system
│   ├── routes/            # Routing configuration
│   └── utils/             # Utility functions
├── docs/                  # Documentation
│   └── time-tracking.md   # Time tracking guide
├── .env                   # Environment variables
├── Dockerfile             # Docker configuration
├── package.json           # Dependencies and scripts
└── README.md              # This file
```

## 🎯 Core Features Guide

### Task Board Usage

#### Task Workflow
1. **To Do** - New tasks assigned to you
2. **In Progress** - Tasks you're actively working on
3. **Testing** - Completed tasks awaiting review
4. **Done** - Completed and approved tasks

#### Drag & Drop Operations
- Move tasks between columns to update status
- Automatic time tracking when moving to "In Progress"
- Time recording when moving to "Testing"

### Time Tracking System

#### Automatic Tracking
- **Start Timer** - Automatically starts when task moves to "In Progress"
- **Pause/Resume** - Manual control over time tracking
- **Stop Timer** - Automatically stops when task moves to "Testing"

#### Time Display Formats
- **Standard Format** - HH:MM:SS (e.g., 02:30:45)
- **Readable Format** - Human-friendly (e.g., "2 hours 30 minutes")

#### Time Management
```javascript
// Example time tracking usage
const timeEntry = {
  taskId: "task_123",
  startTime: "2024-01-15T09:00:00Z",
  endTime: "2024-01-15T11:30:00Z",
  duration: 9000, // seconds
  description: "Working on user authentication"
};
```

### Task Details & Collaboration

#### Task Information
- **Title & Description** - Complete task details
- **Priority & Status** - Visual indicators
- **Assignee & Due Date** - Responsibility and timeline
- **Attachments** - File uploads and downloads
- **Comments** - Team communication

#### Collaboration Features
- **Real-time Comments** - Instant team communication
- **File Sharing** - Document and media attachments
- **Status Updates** - Automatic notifications
- **Mention System** - Tag team members in comments

## 🔧 Available Scripts

### Development
```bash
npm start          # Start development server
npm run build      # Build for production
npm test           # Run test suite
npm run format     # Format code with Prettier
```

### Production
```bash
npm run build      # Create optimized production build
```

## 📱 User Interface Components

### Core Components
- **TaskBoard** - Main kanban interface
- **TaskCard** - Individual task representation
- **TaskDetailModal** - Comprehensive task view
- **TimeTracker** - Time tracking interface
- **NotificationCenter** - Alert and update system

### Utility Components
- **ScreenCapture** - Built-in screenshot tool
- **FileUploader** - Drag-and-drop file uploads
- **DatePicker** - Date selection interface
- **SearchBar** - Quick task and project search

## 🎨 User Experience Features

### Responsive Design
- **Mobile-first** - Optimized for all devices
- **Touch-friendly** - Mobile gesture support
- **Adaptive Layout** - Flexible grid system
- **Progressive Web App** - Offline capabilities

### Accessibility
- **Keyboard Navigation** - Full keyboard support
- **Screen Reader** - ARIA labels and descriptions
- **High Contrast** - Accessibility-friendly colors
- **Focus Management** - Clear focus indicators

### Performance
- **Lazy Loading** - Efficient component loading
- **Code Splitting** - Optimized bundle sizes
- **Caching** - Smart data caching strategies
- **Offline Support** - Basic offline functionality

## 🔐 Security & Authentication

### User Authentication
- **JWT Tokens** - Secure authentication
- **Auto-refresh** - Seamless token renewal
- **Session Management** - Automatic logout on inactivity
- **Secure Storage** - Protected local storage

### Data Protection
- **HTTPS Communication** - Encrypted data transfer
- **Input Validation** - Client-side validation
- **XSS Protection** - Cross-site scripting prevention
- **CSRF Protection** - Cross-site request forgery prevention

## 📊 Personal Analytics

### Productivity Metrics
- **Time Spent** - Daily, weekly, monthly tracking
- **Task Completion** - Completion rates and trends
- **Project Progress** - Individual project contributions
- **Activity Patterns** - Work pattern analysis

### Reporting
- **Personal Reports** - Individual productivity reports
- **Time Logs** - Detailed time tracking history
- **Task History** - Complete task activity log
- **Export Options** - CSV and PDF export capabilities

## 🚀 Deployment

### Docker Deployment
```bash
docker build -t task-manager-user .
docker run -p 9014:9014 task-manager-user
```

### Production Build
```bash
npm run build
# Deploy the build folder to your web server
```

## 🔍 Troubleshooting

### Common Issues
1. **Login Problems** - Check credentials and network connection
2. **Time Tracking** - Ensure proper task status transitions
3. **File Uploads** - Check file size and type restrictions
4. **Notifications** - Verify browser notification permissions

### Performance Tips
- **Clear Browser Cache** - Refresh application data
- **Update Browser** - Use latest browser version
- **Check Network** - Ensure stable internet connection
- **Close Unused Tabs** - Free up browser resources

## 📚 Documentation

### Additional Resources
- [Time Tracking Guide](./docs/time-tracking.md)
- [API Documentation](../server/README.md)
- [Admin Panel Guide](../admin/README.md)

### Quick Start Guide
1. **Login** - Use credentials provided by administrator
2. **View Tasks** - Check your assigned tasks on the board
3. **Start Working** - Move task to "In Progress" to start timer
4. **Track Time** - Monitor time spent on tasks
5. **Collaborate** - Add comments and share files
6. **Complete Tasks** - Move to "Testing" when finished

## 🤝 Contributing

### Development Guidelines
1. Follow React best practices
2. Use consistent naming conventions
3. Write comprehensive tests
4. Update documentation for new features
5. Follow the established Git workflow

### Code Style
- Use functional components with hooks
- Implement proper error boundaries
- Follow accessibility guidelines
- Optimize for performance

## 📄 License

This project is licensed under the MIT License.

## 🆘 Support

### Getting Help
- **Built-in Support** - Use the support ticket system
- **Documentation** - Check the comprehensive guides
- **Team Communication** - Contact your project manager
- **Technical Issues** - Report bugs through the system

### Contact Information
- **Development Team** - Rowthtech2025
- **Contributors** - Nishchay Sharma, Shubham Chandel, Abhishek Rao

---

**Built with ❤️ for productive teams**