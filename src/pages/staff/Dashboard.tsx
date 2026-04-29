import { Routes, Route } from 'react-router-dom';
import Sidebar from '../../components/common/Sidebar';
import POS from './POS';
import Customers from './Customers';
import Appointments from './Appointments';
import Credits from './Credits';

const StaffDashboard = () => {
  return (
    <div style={{ display: 'flex' }}>
      <Sidebar role="staff" />
      <main style={{ 
        marginLeft: '260px', 
        flex: 1, 
        padding: '2.5rem',
        minHeight: '100vh',
        background: 'var(--bg-primary)'
      }}>
        <Routes>
          <Route index element={<POS />} />
          <Route path="pos" element={<POS />} />
          <Route path="customers" element={<Customers />} />
          <Route path="appointments" element={<Appointments />} />
          <Route path="credits" element={<Credits />} />
        </Routes>
      </main>
    </div>
  );
};

export default StaffDashboard;
