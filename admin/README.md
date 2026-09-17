# Task Manager - Admin Dashboard

A comprehensive administrative interface for managing projects, teams, and system operations built with React 18 and modern web technologies.

## 🎯 Overview

The Admin Dashboard provides complete control over the task management system, offering advanced features for project oversight, team management, analytics, and system administration.

## ✨ Key Features

### Project Management

-   **Project Creation & Management** - Full project lifecycle control
-   **Milestone Tracking** - Define and monitor project milestones
-   **Sprint Management** - Agile sprint planning and execution
-   **Task Oversight** - Complete task management across all projects

### Team & User Management

-   **User Administration** - Create, update, and manage user accounts
-   **Role-Based Access Control** - Define user permissions and roles
-   **Team Assignment** - Assign users to projects and teams
-   **Activity Monitoring** - Track user activities and productivity

### Analytics & Reporting

-   **Dashboard Analytics** - Real-time project and team metrics
-   **Performance Reports** - Detailed productivity analysis
-   **Time Tracking Reports** - Comprehensive time management insights
-   **Custom Report Generation** - Export data in various formats

### Client & Technology Management

-   **Client Management** - Maintain client information and relationships
-   **Technology Stack Management** - Define and manage project technologies
-   **Client Repositories** - Manage client-specific resources

### System Administration

-   **Support Ticket Management** - Handle user support requests
-   **System Monitoring** - Monitor application health and performance
-   **Global Search** - Search across all system entities
-   **File Management** - AWS S3 integrated file handling

## 🛠️ Technology Stack

### Core Technologies

-   **React 18** - Modern React with hooks and concurrent features
-   **Redux & Redux-Saga** - Predictable state management
-   **React Router v6** - Client-side routing
-   **Bootstrap 5** - Responsive UI framework
-   **SASS/SCSS** - Advanced styling capabilities

### UI Components & Libraries

-   **React Beautiful DnD** - Drag-and-drop functionality
-   **Chart.js & ApexCharts** - Data visualization
-   **React Hook Form** - Efficient form handling
-   **React Datepicker** - Date selection components
-   **React Select** - Advanced select components
-   **React Toastify** - Notification system

### Development Tools

-   **Axios** - HTTP client for API communication
-   **Moment.js** - Date manipulation
-   **JWT Decode** - Token handling
-   **React CSV** - Data export functionality
-   **React Quill** - Rich text editor

## 🚀 Getting Started

### Prerequisites

-   Node.js 20+
-   npm or yarn package manager
-   Backend API running on port 9012

### Installation

1. **Navigate to admin directory**

    ```bash
    cd admin
    ```

2. **Install dependencies**

    ```bash
    npm install
    # or
    yarn install
    ```

3. **Environment Configuration**

    Create `.env` file in the admin directory:

    ```env
    REACT_APP_API_URL=http://localhost:9012/api/v1
    REACT_APP_SOCKET_URL=http://localhost:9012
    REACT_APP_AWS_S3_BUCKET=your-bucket-name
    REACT_APP_ENVIRONMENT=development
    ```

4. **Start Development Server**

    ```bash
    npm start
    # or
    yarn start
    ```

    The application will be available at [http://localhost:9013](http://localhost:9013)

## 📁 Project Structure

```
admin/
├── public/                 # Static assets
│   ├── fonts/             # Custom fonts
│   ├── favicon.ico        # App icon
│   └── index.html         # HTML template
├── src/
│   ├── assets/            # Images, fonts, and SCSS
│   │   ├── fonts/         # Web fonts
│   │   ├── images/        # Static images
│   │   └── scss/          # Styling files
│   ├── components/        # Reusable UI components
│   ├── constants/         # App constants and configs
│   ├── contexts/          # React contexts
│   ├── helpers/           # Utility functions
│   ├── hooks/             # Custom React hooks
│   ├── layouts/           # Page layouts
│   ├── pages/             # Application pages
│   │   └── Task-Manager/  # Main application features
│   ├── redux/             # State management
│   │   ├── auth/          # Authentication state
│   │   ├── projects/      # Project management
│   │   ├── tasks/         # Task management
│   │   └── users/         # User management
│   ├── routes/            # Routing configuration
│   └── utils/             # Utility functions
├── .env                   # Environment variables
├── Dockerfile             # Docker configuration
├── package.json           # Dependencies and scripts
└── README.md              # This file
```

## 🎨 Key Components

### Dashboard Components

-   **Analytics Dashboard** - Real-time metrics and KPIs
-   **Project Overview** - Project status and progress
-   **Team Performance** - Team productivity metrics
-   **Task Distribution** - Task allocation across teams

### Management Interfaces

-   **Project Management** - CRUD operations for projects
-   **User Management** - User administration interface
-   **Task Board** - Kanban-style task management
-   **Time Tracking** - Time management and reporting

### Utility Components

-   **File Uploader** - AWS S3 integrated file uploads
-   **Screen Capture** - Built-in screenshot functionality
-   **Notification System** - Real-time notifications
-   **Search Interface** - Global search functionality

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

## 🎯 Core Features Guide

### Project Management

1. **Creating Projects** - Define project scope, timeline, and team
2. **Milestone Planning** - Set project milestones and deadlines
3. **Sprint Management** - Plan and execute development sprints
4. **Progress Tracking** - Monitor project advancement

### User Administration

1. **User Creation** - Add new team members
2. **Role Assignment** - Define user permissions
3. **Team Management** - Organize users into teams
4. **Activity Monitoring** - Track user engagement

### Analytics & Reporting

1. **Dashboard Metrics** - View real-time project data
2. **Performance Analysis** - Analyze team productivity
3. **Time Reports** - Generate time tracking reports
4. **Data Export** - Export reports in CSV/PDF formats

## 🔐 Authentication & Security

-   **JWT-based Authentication** - Secure token-based login
-   **Role-based Access Control** - Granular permission system
-   **Session Management** - Automatic session handling
-   **Secure API Communication** - Encrypted data transmission

## 📱 Responsive Design

-   **Mobile-first Approach** - Optimized for all devices
-   **Bootstrap Grid System** - Flexible layout system
-   **Touch-friendly Interface** - Mobile gesture support
-   **Progressive Web App** - PWA capabilities

## 🎨 Theming & Customization

-   **SCSS Variables** - Easy theme customization
-   **Component Theming** - Modular styling approach
-   **Dark/Light Mode** - Theme switching capability
-   **Custom Fonts** - Integrated typography system

## 🚀 Deployment

### Docker Deployment

```bash
docker build -t task-manager-admin .
docker run -p 9013:9013 task-manager-admin
```

### Production Build

```bash
npm run build
# Deploy the build folder to your web server
```

## 🔍 Troubleshooting

### Common Issues

1. **API Connection** - Ensure backend is running on port 9012
2. **Environment Variables** - Check .env file configuration
3. **Dependencies** - Run `npm install` to update packages
4. **Port Conflicts** - Ensure port 9013 is available

### Performance Optimization

-   Use React.memo for component optimization
-   Implement lazy loading for routes
-   Optimize bundle size with code splitting
-   Use Redux selectors for efficient state access

## 🤝 Contributing

1. Follow the existing code structure
2. Use consistent naming conventions
3. Write comprehensive tests
4. Update documentation for new features
5. Follow the established Git workflow

## 📄 License

This project is licensed under the MIT License.

## 🆘 Support

For technical support:

-   Check the troubleshooting section
-   Review the API documentation
-   Contact the development team

---

**Built with ❤️ by Rowthtech2025 Team**
