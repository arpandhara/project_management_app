import React, { useEffect } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth, ClerkLoaded, ClerkLoading } from "@clerk/clerk-react";

// Components
import AuthLayout from './components/layout/AuthLayout'; // Import the new wrapper
import Dashboard from './pages/dashboard/Dashboard';
import ProjectList from './pages/projects/ProjectList';
import ProjectDetails from './pages/projects/ProjectDetails';
import TeamList from './pages/team/TeamList'; 
import Settings from './pages/settings/Settings';
import LoginPage from './pages/auth/LoginPage';
import SignUpPage from './pages/auth/SignUpPage';

// API Helper
import { setupInterceptors } from "./services/api";

const App = () => {
  const { getToken, isLoaded } = useAuth();

  useEffect(() => {
    setupInterceptors(getToken);
  }, [getToken]);

  return (
    <>
      <ClerkLoading>
        <div className="min-h-screen bg-neutral-950 flex items-center justify-center text-white">
          <div className="flex flex-col items-center gap-4">
            <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
            <p className="text-sm text-neutral-400">Loading workspace...</p>
          </div>
        </div>
      </ClerkLoading>

      <ClerkLoaded>
        <Routes>
          {/* Public Routes */}
          <Route path="/login" element={<LoginPage />} />
          <Route path="/sign-up" element={<SignUpPage />} />

          {/* Protected Routes Wrapper */}
          <Route path="/" element={<AuthLayout />}>
            <Route index element={<Dashboard />} />
            <Route path="projects" element={<ProjectList />} />
            <Route path="projects/:id" element={<ProjectDetails />} />
            <Route path="team" element={<TeamList />} />
            <Route path="settings" element={<Settings />} />
          </Route>

          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </ClerkLoaded>
    </>
  );
}

export default App;