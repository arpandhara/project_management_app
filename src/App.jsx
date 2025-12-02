import React from 'react';
import { Routes, Route } from 'react-router-dom';
import AppLayout from './components/layout/AppLayout';
import Dashboard from './pages/dashboard/Dashboard';

const App = () => {
  return (
    <Routes>
      <Route path="/" element={<AppLayout />}>
        <Route index element={<Dashboard />} />
        
        {/* We will build these next */}
        <Route path="projects" element={<div className='p-4 text-neutral-400'>Projects Page (Coming Soon)</div>} />
        <Route path="team" element={<div className='p-4 text-neutral-400'>Team Page (Coming Soon)</div>} />
        <Route path="settings" element={<div className='p-4 text-neutral-400'>Settings Page (Coming Soon)</div>} />
      </Route>
      
      {/* Auth Routes will go here later */}
      {/* <Route path="/login" element={<Login />} /> */}
    </Routes>
  );
}

export default App;