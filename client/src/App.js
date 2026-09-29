import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Login from './pages/account/Login';
import ForgetPassword from './pages/account/ForgetPassword';
import ResetPassword from './pages/account/ResetPassword';
import Dashboard from './pages/Dashboard';
import Projects from './pages/Projects';
import Milestones from './pages/Milestones';
import MilestoneTasks from './pages/MilestoneTasks';
import Documents from './pages/Documents';
import Reports from './pages/Reports';
import Team from './pages/Team';
import Support from './pages/Support';
import PrivateRoute from './routes/PrivateRoute';
import './App.css';

function App() {
  return (
    <Router>
      <Routes>
        {/* Public Routes */}
        <Route path="/account/login" element={<Login />} />
        <Route path="/account/forget-password" element={<ForgetPassword />} />
        <Route path="/account/reset-password/:token" element={<ResetPassword />} />

        {/* Protected Routes */}
        <Route path="/dashboard" element={<PrivateRoute component={Dashboard} />} />
        <Route path="/dashboard/projects" element={<PrivateRoute component={Projects} />} />
        <Route path="/dashboard/milestones" element={<PrivateRoute component={Milestones} />} />
        <Route path="/dashboard/milestone-tasks/:milestoneId" element={<PrivateRoute component={MilestoneTasks} />} />
        <Route path="/dashboard/documents" element={<PrivateRoute component={Documents} />} />
        <Route path="/dashboard/reports" element={<PrivateRoute component={Reports} />} />
        <Route path="/dashboard/team" element={<PrivateRoute component={Team} />} />
        <Route path="/dashboard/support" element={<PrivateRoute component={Support} />} />

        {/* Default redirect */}
        <Route path="*" element={<Navigate to="/dashboard" replace />} />
      </Routes>
    </Router>
  );
}

export default App;
