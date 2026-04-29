import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Suspense, lazy } from 'react';

// Lazy load pages
const Home = lazy(() => import('./pages/public/Home'));
const Login = lazy(() => import('./pages/auth/Login'));
const Signup = lazy(() => import('./pages/auth/Signup'));
const AdminDashboard = lazy(() => import('./pages/admin/Dashboard'));
const StaffDashboard = lazy(() => import('./pages/staff/Dashboard'));
const CustomerPortal = lazy(() => import('./pages/customer/Portal'));

// Loading component
const Loading = () => (
  <div style={{ 
    height: '100vh', 
    display: 'flex', 
    alignItems: 'center', 
    justifyContent: 'center',
    background: 'var(--bg-primary)',
    color: 'var(--text-primary)'
  }}>
    <div className="animate-pulse">Loading PartSphere...</div>
  </div>
);

import MainLayout from './layouts/MainLayout';

function App() {
  return (
    <Router>
      <MainLayout>
        <Suspense fallback={<Loading />}>
          <Routes>
            <Route path="/login" element={<Login />} />
            <Route path="/signup" element={<Signup />} />
            <Route path="/admin/*" element={<AdminDashboard />} />
            <Route path="/staff/*" element={<StaffDashboard />} />
            <Route path="/customer/*" element={<CustomerPortal />} />
            <Route path="/" element={<Home />} />
          </Routes>
        </Suspense>
      </MainLayout>
    </Router>
  );
}

export default App;
