import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter, Route, Routes } from 'react-router';
import App from './App.tsx';
import './index.css';
import NotFound from './components/NotFound.tsx';
import Dashboard from './Dashboard.tsx';
import PostForm from './components/PostForm';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <BrowserRouter>
      <Routes>
        <Route index element={<App />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/post/new" element={<PostForm mode="create" />} />
        <Route path="/post/edit/:id" element={<PostForm mode="edit" />} />
        <Route path="*" element={<NotFound />} />
      </Routes>
    </BrowserRouter>
  </StrictMode>
);
