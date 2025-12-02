import React from 'react';
import { Routes, Route } from 'react-router-dom';
import AppLayout from './components/layout/AppLayout';
import Dashboard from './pages/dashboard/Dashboard';
import ProjectList from './pages/projects/ProjectList';
import ProjectDetails from './pages/projects/ProjectDetails';

const App = () => {
  return (
    <Routes>
      <Route path="/" element={<AppLayout />}>
        <Route index element={<Dashboard />} />
        <Route path="projects" element={<ProjectList />} />
        <Route path="projects/:id" element={<ProjectDetails />} />
        <Route path="team" element={<div className='p-4 text-neutral-400'>Team Page (Coming Soon)</div>} />
        <Route path="settings" element={<div className='p-4 text-neutral-400'>Settings Page (Coming Soon)</div>} />
      </Route>
    </Routes>
  );
}

export default App;