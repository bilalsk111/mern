import React, { useState, useEffect } from "react";
import { NavLink } from "react-router-dom";
import {
  LayoutDashboard,
  Music2,
  Heart,
  History,
  UserCircle,
  LogOut,
  Music,
} from "lucide-react";
import { useAuth } from "../../auth/hooks/useAuth";

const Sidebar = () => {
  const { user, handleLogout } = useAuth();

  const [showConfirm, setShowConfirm] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    document.body.style.overflow = showConfirm ? "hidden" : "unset";
    return () => (document.body.style.overflow = "unset");
  }, [showConfirm]);

  const confirmLogout = async () => {
    if (loading) return;

    try {
      setLoading(true);
      await handleLogout();
    } finally {
      setLoading(false);
      setShowConfirm(false);
    }
  };

  const navClass = ({ isActive }) =>
    isActive ? "nav-item active" : "nav-item";

  return (
    <>
      <aside className="sidebar">
        <div className="logo-section">
          <div className="logo-icon">
            <Music size={26} strokeWidth={2.5} />
          </div>
          <span className="logo-text">EmotionTune</span>
        </div>

        <nav className="nav-links">
          <NavLink to="/home" className={navClass}>
            <LayoutDashboard size={20} />
            <span>Dashboard</span>
          </NavLink>

          <NavLink to="/recommendation" className={navClass}>
            <Music2 size={20} />
            <span>Recommended</span>
          </NavLink>

          <NavLink to="/fav" className={navClass}>
            <Heart size={20} />
            <span>Favorites</span>
          </NavLink>

          <NavLink to="/mood" className={navClass}>
            <History size={20} />
            <span>Mood History</span>
          </NavLink>

          <NavLink to="/profile" className={navClass}>
            <UserCircle size={20} />
            <span>Profile</span>
          </NavLink>
        </nav>

        <div className="sidebar-footer">
          <div className="avatar">
            {user?.username?.[0]?.toUpperCase() || "U"}
          </div>

          <div className="user-info">
            <p>{user?.username || "Guest"}</p>
            <span>Premium Member</span>
          </div>

          <button
            className="logout-btn"
            onClick={() => setShowConfirm(true)}
          >
            <LogOut size={18} />
          </button>
        </div>
      </aside>

      {showConfirm && (
        <div className="logout-modal" onClick={() => setShowConfirm(false)}>
          <div className="logout-card" onClick={(e) => e.stopPropagation()}>
            <h3>Logout</h3>
            <p>Are you sure you want to logout?</p>

            <div className="logout-actions">
              <button
                className="cancel-btn"
                onClick={() => setShowConfirm(false)}
              >
                Cancel
              </button>

              <button
                className="confirm-btn"
                onClick={confirmLogout}
                disabled={loading}
              >
                {loading ? "Logging out..." : "Logout"}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default Sidebar;