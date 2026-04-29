import { Routes, Route } from 'react-router-dom';
import Sidebar from '../../components/common/Sidebar';
import Overview from './Overview';
import Parts from './Parts';
import Vendors from './Vendors';
import StaffManagement from './StaffManagement';
import Reports from './Reports';

const AdminDashboard = () => {
  return (
    <div style={{ display: 'flex' }}>
      <Sidebar role="admin" />
      <main style={{ 
        marginLeft: '260px', 
        flex: 1, 
        padding: '2.5rem',
        minHeight: '100vh',
        background: 'var(--bg-primary)'
      }}>
        <Routes>
          <Route index element={<Overview />} />
          <Route path="parts" element={<Parts />} />
          <Route path="vendors" element={<Vendors />} />
          <Route path="staff" element={<StaffManagement />} />
          <Route path="reports" element={<Reports />} />
        </Routes>
      </main>
    </div>
  );
};

export default AdminDashboard;
