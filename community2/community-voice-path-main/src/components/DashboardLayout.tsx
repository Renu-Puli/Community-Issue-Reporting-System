import { useAuth } from '@/context/AuthContext';
import { Navigate, Outlet, useLocation } from 'react-router-dom';
import Navbar from '@/components/Navbar';

const DashboardLayout = () => {
  const { user, loading, role } = useAuth();
  const location = useLocation();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full" />
      </div>
    );
  }

  if (!user) return <Navigate to="/login" replace />;

  let bgClass = 'dashboard-citizen';
  if (role === 'admin') bgClass = 'dashboard-admin';
  else if (role === 'worker') bgClass = 'dashboard-worker';
  else if (location.pathname.includes('new-complaint')) bgClass = 'dashboard-new-complaint';

  return (
    <div className={`min-h-screen ${bgClass}`}>
      <Navbar />
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <Outlet />
      </main>
    </div>
  );
};

export default DashboardLayout;
