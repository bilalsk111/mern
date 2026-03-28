import { NavLink } from "react-router-dom";
import {
  Home, Compass, PlusSquare, User,
  Bookmark, Search, LogOut, Instagram
} from "lucide-react";
import { useContext, useState } from "react";
import { AuthContext } from "../../auth/auth.context";
import { useAuth } from "../../auth/hooks/useAuth";
import ConfirmModal from "../../components/ConfirmModal";
import "../style/sidebar.scss";

const Sidebar = () => {
  const [logoutOpen, setLogoutOpen] = useState(false);
  const { user } = useContext(AuthContext);
  const { handleLogout } = useAuth();

  return (
    <>
      <div className="mobile-header">
        <div className="logo">Instagram</div>
      </div>

      <div className="sidebar">
        <div className="top-section">
          <div className="logo-section">
            <div className="logo-full">Instagram</div>
            <Instagram className="logo-icon" size={24} />
          </div>

          <nav className="nav-links">
            <NavLink to="/feed">
              <Home size={26} /> <span>Home</span>
            </NavLink>

            <NavLink to="/search" className="hide-on-mobile">
              <Search size={26} /> <span>Search</span>
            </NavLink>

            <NavLink to="/reels">
              <Compass size={26} /> <span>Reels</span>
            </NavLink>

            <NavLink to="/create">
              <PlusSquare size={26} /> <span>Create</span>
            </NavLink>

            <NavLink to="/save" className="hide-on-mobile">
              <Bookmark size={26} /> <span>Save</span>
            </NavLink>

            {user && (
              <NavLink to={`/profile/${user.username}`}>
                <User size={26} /> <span>Profile</span>
              </NavLink>
            )}
          </nav>
        </div>

        <div className="bottom-section hide-on-mobile">
          <button onClick={() => setLogoutOpen(true)} className="more-btn">
            <LogOut size={26} /> <span>Logout</span>
          </button>
        </div>

        <ConfirmModal
          isOpen={logoutOpen}
          title="Logout?"
          message="You'll need to login again to access your account."
          confirmText="Logout"
          danger={true}
          onCancel={() => setLogoutOpen(false)}
          onConfirm={handleLogout}
        />
      </div>
    </>
  );
};

export default Sidebar;