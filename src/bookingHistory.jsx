import React, { useContext } from 'react';
import { AuthContext } from './context/AuthContext';
import AdminDashboard from './pages/admin/AdminDashboard';


const bookingHistory = () => {
  const { user } = useContext(AuthContext);

  if (!user) return <div className="p-10 text-center">Loading dashboard...</div>;

  return user.role === 'admin' ? <AdminDashboard /> : <UserDashboard />;
};

export default bookingHistory;
