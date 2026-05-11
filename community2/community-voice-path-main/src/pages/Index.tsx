import { Navigate } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';

const Index = () => {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full" />
      </div>
    );
  }

  // Always show language page if not selected in this SESSION
  const langSelectedThisSession = sessionStorage.getItem('langSelected');
  if (!langSelectedThisSession) return <Navigate to="/language" replace />;

  if (user) return <Navigate to="/dashboard" replace />;
  return <Navigate to="/login" replace />;
};

export default Index;

