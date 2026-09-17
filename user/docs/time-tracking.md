# Time Tracking Implementation

This document explains the time tracking implementation for tasks moving from "In Progress" to "Testing" status.

## Overview

When a task is moved from "In Progress" to "Testing", the system automatically calculates and records the time spent on the task. This time is stored in the `timeSpent` field and can be displayed in various formats.

## Key Components

1. **Time Calculation**:
   - Time is tracked when a task is in "In Progress" status
   - When moved to "Testing", the elapsed time is calculated and stored

2. **Display Formats**:
   - Standard format (HH:MM:SS): `00:05:30`
   - Readable format: `5m 30s`

3. **Components**:
   - `TimeDisplay`: Reusable component for displaying time in different formats
   - Time utility functions in `timeUtils.js`

## Usage

### Displaying Time Spent

```jsx
// Import the TimeDisplay component
import TimeDisplay from '../components/TimeDisplay';

// Use in your component
<TimeDisplay timeInMs={task.timeSpent} format="standard" />
<TimeDisplay timeInMs={task.timeSpent} format="readable" />
```

### Time Utility Functions

```js
// Import utility functions
import { formatTimeStandard, formatTimeReadable, timeStringToMs } from '../utils/timeUtils';

// Format time in HH:MM:SS
const formattedTime = formatTimeStandard(timeInMs);

// Format time in readable format (2h 15m 30s)
const readableTime = formatTimeReadable(timeInMs);

// Convert time string to milliseconds
const milliseconds = timeStringToMs('01:30:45');
```

## Implementation Details

1. When a task is moved to "Testing" status:
   - If the timer is active, it's stopped and the elapsed time is recorded
   - The time is sent to the API in the `timeSpent` field

2. The time is displayed on tasks in "Testing" status to show how long the task took to complete