import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter, Route, Routes } from 'react-router';
import App from './App.tsx';
import './index.css';
import NotFound from './components/NotFound.tsx';
import Dashboard from './Dashboard.tsx';
import PostForm from './PostForm.tsx';
import AdminLogin from './admin/AdminLogin.tsx';
import AdminDashboard from './admin/AdminDashboard.tsx';
import Contact from './Contact.tsx';
import Telemetry from './admin/Telemetry.tsx';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <BrowserRouter>
      <Routes>
        <Route index element={<App />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/post/new" element={<PostForm mode="create" />} />
        <Route path="/post/edit/:id" element={<PostForm mode="edit" />} />
        <Route path="/admin" element={<AdminLogin />} />
        <Route path="/telemetry" element={<Telemetry />} />
        <Route path="/admin/dashboard" element={<AdminDashboard />} />
        <Route path="/contact" element={<Contact />} />
        <Route path="*" element={<NotFound />} />
      </Routes>
    </BrowserRouter>
  </StrictMode>
);
