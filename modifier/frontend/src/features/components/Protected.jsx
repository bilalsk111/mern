import { useAuth } from "../auth/hooks/useAuth";
import { Navigate, Outlet } from "react-router-dom";
import '../components/Protected.scss'
const Protected = () => {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="auth-loading">
        <div className="loader"></div>
      </div>
    );
  }

  if (!user) return <Navigate to="/login" replace />;

  return <Outlet />;
};

export default Protected;