# Time Tracking Reports

This module implements comprehensive time tracking reports for the Task Manager application.

## Features

### 1. Employee Daily Log View
- **Endpoint**: `/api/v1/admin/reports/time-tracking/employee-daily`
- **Component**: `EmployeesTable.js`
- **Description**: Shows detailed daily time logs for employees with task, project, and time information
- **Filters**: Date range, Employee ID, Project ID, Task ID

### 2. Monthly Summary by Employee
- **Endpoint**: `/api/v1/admin/reports/time-tracking/monthly-summary`
- **Component**: `MonthlyTable.js`
- **Description**: Displays monthly summary of hours worked by each employee, broken down by day
- **Filters**: Month, Employee ID

### 3. Project Daily Summary
- **Endpoint**: `/api/v1/admin/reports/time-tracking/project-daily`
- **Component**: `AllProjectsTable.js`
- **Description**: Shows daily summary of hours logged across all projects
- **Filters**: Month or Date range

### 4. Single Project Team View
- **Endpoint**: `/api/v1/admin/reports/time-tracking/project-team`
- **Component**: `ProjectTable.js`
- **Description**: Displays team member contributions to a specific project over time
- **Filters**: Project ID, Date range

## Components Structure

```
reports/
├── Reports.js              # Main container component with tab navigation
├── EmployeesTable.js       # Employee daily logs table
├── MonthlyTable.js         # Monthly summary table
├── AllProjectsTable.js     # All projects daily summary table
├── ProjectTable.js         # Single project team view table
├── utils.js               # Utility functions for reports
└── README.md              # This documentation
```

## Redux Integration

### Actions (`action.js`)
- `getEmployeeDailyLogs(data)` - Fetch employee daily logs
- `getMonthlySummary(data)` - Fetch monthly summary
- `getProjectDailySummary(data)` - Fetch project daily summary
- `getProjectTeamView(data)` - Fetch project team view

### API Functions (`api.js`)
- `getEmployeeDailyLogsApi(data)` - API call for employee daily logs
- `getMonthlySummaryApi(data)` - API call for monthly summary
- `getProjectDailySummaryApi(data)` - API call for project daily summary
- `getProjectTeamViewApi(data)` - API call for project team view

### Reducers (`reducer.js`)
- `employeeDailyLogs` - Manages employee daily logs state
- `monthlySummary` - Manages monthly summary state
- `projectDailySummary` - Manages project daily summary state
- `projectTeamView` - Manages project team view state

## Usage

### Basic Usage
```jsx
import Reports from './Reports';

function App() {
  return <Reports />;
}
```

### API Parameters

#### Employee Daily Logs
```javascript
{
  dateFrom: '2023-06-01',    // Required
  dateTo: '2023-06-30',      // Required
  employeeId: 'user_id',     // Optional
  projectId: 'project_id',   // Optional
  taskId: 'task_id'          // Optional
}
```

#### Monthly Summary
```javascript
{
  month: '2023-06',          // Required (YYYY-MM format)
  employeeId: 'user_id'      // Optional
}
```

#### Project Daily Summary
```javascript
{
  month: '2023-06',          // Either month or date range required
  // OR
  dateFrom: '2023-06-01',
  dateTo: '2023-06-30'
}
```

#### Project Team View
```javascript
{
  projectId: 'project_id',   // Required
  dateFrom: '2023-06-01',    // Optional (defaults to 30 days ago)
  dateTo: '2023-06-30'       // Optional (defaults to today)
}
```

## Features

### Error Handling
- All components include proper error handling with try-catch blocks
- Loading states are displayed during API calls
- Fallback values are used for missing data using optional chaining (`?.`)

### Date Handling
- Uses `moment.js` for consistent date formatting
- Supports different date formats for different report types
- Automatic date range generation for table headers

### Responsive Design
- Tables are responsive with horizontal scrolling
- Sticky headers for better navigation
- Optimized for different screen sizes

### Data Safety
- Uses optional chaining (`?.`) throughout to prevent errors
- Fallback values for missing or undefined data
- Proper null/undefined checks before rendering

## Styling

The components use Bootstrap classes for styling:
- `table-responsive` for responsive tables
- `table-hover` for hover effects
- `table-sm` for compact tables
- `sticky-top` for sticky headers
- Badge components for status indicators

## Performance Considerations

- API calls are debounced through useEffect dependencies
- Loading states prevent multiple simultaneous requests
- Data is cached in Redux store to avoid unnecessary API calls
- Tables use virtualization for large datasets (via maxHeight and overflow)