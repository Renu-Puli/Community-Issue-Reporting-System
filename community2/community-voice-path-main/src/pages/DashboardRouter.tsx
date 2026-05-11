import { useAuth } from '@/context/AuthContext';
import UserDashboard from '@/pages/UserDashboard';
import AdminDashboard from '@/pages/AdminDashboard';
import WorkerDashboard from '@/pages/WorkerDashboard';

const DashboardRouter = () => {
  const { role, loading, user } = useAuth();

  if (loading || (user && !role)) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full" />
      </div>
    );
  }

  if (role === 'admin') return <AdminDashboard />;
  if (role === 'worker') return <WorkerDashboard />;
  return <UserDashboard />;
};

export default DashboardRouter;
