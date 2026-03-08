import { useContext } from "react";
import { AuthContext } from "../auth.context";
import {
  registerUser,
  loginUser,
  logoutUser
} from "../services/auth.api";

export const useAuth = () => {
  const { user, setUser, loading, setLoading } = useContext(AuthContext);

  const handleRegister = async (data) => {
    try {
      setLoading(true);
      const res = await registerUser(data);
      setUser(res.data.user);
      return res.data;
    } catch (err) {
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const handleLogin = async (data) => {
    try {
      setLoading(true);
      const res = await loginUser(data);
      setUser(res.data.user);
      return res.data;
    } catch (err) {
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    try {
      setLoading(true);
      await logoutUser();
      setUser(null);
    } finally {
      setLoading(false);
    }
  };

  return {
    user,
    loading,
    handleRegister,
    handleLogin,
    handleLogout
  };
};