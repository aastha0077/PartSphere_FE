import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Suspense, lazy } from 'react';
import { AuthProvider } from './context/AuthContext';
import { AdminRoute, StaffRoute, CustomerRoute } from './components/auth/ProtectedRoute';
import { Toaster } from 'sonner';

import MainLayout from './layouts/MainLayout';
import AdminLayout from './layouts/AdminLayout';
import StaffLayout from './layouts/StaffLayout';
import CustomerLayout from './layouts/CustomerLayout';

const Home = lazy(() => import('./pages/public/Home'));
const Login = lazy(() => import('./pages/auth/Login'));
const Signup = lazy(() => import('./pages/auth/Signup'));
const Unauthorized = lazy(() => import('./pages/Unauthorized'));

const AdminOverview = lazy(() => import('./pages/admin/Overview'));
const AdminParts = lazy(() => import('./pages/admin/Parts'));
const AdminVendors = lazy(() => import('./pages/admin/Vendors'));
const AdminPurchases = lazy(() => import('./pages/admin/Purchases'));
const AdminStaff = lazy(() => import('./pages/admin/StaffManagement'));
const AdminCustomers = lazy(() => import('./pages/admin/Customers'));
const AdminReports = lazy(() => import('./pages/admin/Reports'));

const StaffOverview = lazy(() => import('./pages/staff/Overview'));
const StaffPOS = lazy(() => import('./pages/staff/POS'));
const StaffCustomers = lazy(() => import('./pages/staff/Customers'));
const StaffVehicles = lazy(() => import('./pages/staff/Vehicles'));
const StaffAppointments = lazy(() => import('./pages/staff/Appointments'));
const StaffPartRequests = lazy(() => import('./pages/staff/PartRequests'));
const StaffCredits = lazy(() => import('./pages/staff/Credits'));
const StaffReports = lazy(() => import('./pages/staff/Reports'));
const StaffOrders = lazy(() => import('./pages/staff/Orders'));

const CustomerPortal = lazy(() => import('./pages/customer/Portal'));
const CustomerVehicles = lazy(() => import('./pages/customer/CustomerVehicles'));
const CustomerBooking = lazy(() => import('./pages/customer/CustomerBooking'));
const CustomerHistory = lazy(() => import('./pages/customer/CustomerHistory'));
const CustomerReviews = lazy(() => import('./pages/customer/CustomerReviews'));

const Loading = () => (
  <div className="h-screen flex items-center justify-center bg-[#0a0a0c] text-white">
    <div className="flex flex-col items-center gap-4">
      <div className="w-12 h-12 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin"></div>
      <p className="text-indigo-400 font-medium animate-pulse">Initializing PartSphere...</p>
    </div>
  </div>
);

function App() {
  return (
    <Router>
      <AuthProvider>
        <Toaster richColors position="top-right" />
        <Suspense fallback={<Loading />}>
          <Routes>
            <Route path="/" element={<MainLayout><Home /></MainLayout>} />
            <Route path="/login" element={<MainLayout><Login /></MainLayout>} />
            <Route path="/signup" element={<MainLayout><Signup /></MainLayout>} />
            <Route path="/unauthorized" element={<Unauthorized />} />

            <Route path="/admin" element={<AdminRoute><AdminLayout /></AdminRoute>}>
              <Route index element={<Navigate to="dashboard" replace />} />
              <Route path="dashboard" element={<AdminOverview />} />
              <Route path="parts" element={<AdminParts />} />
              <Route path="vendors" element={<AdminVendors />} />
              <Route path="purchases" element={<AdminPurchases />} />
              <Route path="staff" element={<AdminStaff />} />
              <Route path="customers" element={<AdminCustomers />} />
              <Route path="orders" element={<StaffOrders />} />
              <Route path="reports" element={<AdminReports />} />
            </Route>

            <Route path="/staff" element={<StaffRoute><StaffLayout /></StaffRoute>}>
              <Route index element={<Navigate to="dashboard" replace />} />
              <Route path="dashboard" element={<StaffOverview />} />
              <Route path="pos" element={<StaffPOS />} />
              <Route path="parts" element={<AdminParts />} />
              <Route path="vendors" element={<AdminVendors />} />
              <Route path="purchases" element={<AdminPurchases />} />
              <Route path="customers" element={<StaffCustomers />} />
              <Route path="vehicles" element={<StaffVehicles />} />
              <Route path="appointments" element={<StaffAppointments />} />
              <Route path="part-requests" element={<StaffPartRequests />} />
              <Route path="credits" element={<StaffCredits />} />
              <Route path="reports" element={<StaffReports />} />
              <Route path="orders" element={<StaffOrders />} />
            </Route>

            <Route path="/customer" element={<CustomerRoute><CustomerLayout /></CustomerRoute>}>
              <Route index element={<Navigate to="dashboard" replace />} />
              <Route path="dashboard" element={<CustomerPortal />} />
              <Route path="vehicles" element={<CustomerVehicles />} />
              <Route path="booking" element={<CustomerBooking />} />
              <Route path="history" element={<CustomerHistory />} />
              <Route path="reviews" element={<CustomerReviews />} />
            </Route>

            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </Suspense>
      </AuthProvider>
    </Router>
  );
}

export default App;
