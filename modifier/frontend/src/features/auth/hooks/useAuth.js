import { useContext } from "react";
import { AuthContext } from "../auth.context";
import {
  registerUser,
  loginUser,
  logoutUser
} from "../services/auth.api";
import { useNavigate } from "react-router-dom";

export const useAuth = () => {
  const { user, setUser, loading, setLoading } = useContext(AuthContext);
   const navigate = useNavigate()
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
  setLoading(true);
  try {
    await logoutUser();
    setUser(null);     
    navigate("/login"); 
  } catch (err) {
    console.error("Logout failed", err);
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