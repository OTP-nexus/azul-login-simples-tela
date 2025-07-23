import { useAuth } from '@/hooks/useAuth';
import { Navigate } from 'react-router-dom';
import { Loader2 } from 'lucide-react';

const Plans = () => {
  const { user, profile, loading } = useAuth();

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <Loader2 className="h-16 w-16 animate-spin text-primary" />
      </div>
    );
  }

  if (!user || !profile) {
    return <Navigate to="/login" replace />;
  }

  // Redirecionar baseado no tipo de usuário
  if (profile.role === 'driver') {
    return <Navigate to="/driver/plans" replace />;
  } else if (profile.role === 'company') {
    return <Navigate to="/company/plans" replace />;
  }

  return <Navigate to="/" replace />;
};

export default Plans;