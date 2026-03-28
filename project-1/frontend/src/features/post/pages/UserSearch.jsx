import React, { useState, useEffect } from "react";
import { Search, X, Loader2, ChevronRight } from "lucide-react";
import { Link } from "react-router-dom";
import "../style/search.scss";
import { searchUsersAPI } from "../../user/services/user.api";

const UserSearchCard = ({ user }) => (
  <Link to={`/profile/${user.username}`} className="user-search-card">
    <div className="avatar-wrapper">
      <img
        src={user.profileImage || "/default-avatar.png"}
        alt={user.username}
        className="search-avatar"
      />
    </div>
    <div className="user-info">
      <span className="username">{user.username}</span>
      <span className="full-name">{user.name}</span>
    </div>
    <div className="action-area">
      <button className="view-btn">View</button>
    </div>
  </Link>
);

const UserSearch = () => {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [isSearching, setIsSearching] = useState(false);

  useEffect(() => {
    const trimmed = query.trim(); // ✅ Define it here
    
    if (!trimmed) {
      setResults([]);
      setIsSearching(false);
      setLoading(false);
      return;
    }

    setIsSearching(true);
    const delayDebounce = setTimeout(async () => {
      setLoading(true);
      try {
        // ✅ Use 'trimmed' instead of undefined 'trimmedQuery'
        const res = await searchUsersAPI(trimmed);
        
        // Handle different API response structures
        if (res && res.success) {
          setResults(Array.isArray(res.data) ? res.data : []);
        } else {
          setResults([]);
        }
      } catch (err) {
        console.error("Search API Error:", err);
        setResults([]);
      } finally {
        setLoading(false); // ✅ Ensures loading stops even if API fails
      }
    }, 400);

    return () => clearTimeout(delayDebounce);
  }, [query]);

  return (
    <div className="search-page-container">
      <div className="search-header">
        <div className="search-input-wrapper">
          <Search className="search-icon" size={18} />
          <input
            type="text"
            placeholder="Search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            autoFocus
          />
          {query && (
            <button className="clear-btn" onClick={() => setQuery("")}>
              {loading ? <Loader2 className="animate-spin" size={14} /> : <X size={14} />}
            </button>
          )}
        </div>
      </div>

      <div className="search-content">
        {!isSearching ? (
          <div className="suggested-section">
            <div className="section-header">
              <h4>Recent</h4>
            </div>
            <div className="recent-list">
              <p className="empty-text">No recent searches.</p>
            </div>
          </div>
        ) : (
          <div className="results-section">
            {loading ? (
              <div className="search-loader">
                <Loader2 className="animate-spin" size={30} color="#8e8e8e" />
                <p>Searching for users...</p>
              </div>
            ) : results.length > 0 ? (
              results.map((user) => (
                <UserSearchCard key={user._id} user={user} />
              ))
            ) : (
              <div className="no-results-box">
                <p>No results found for "<b>{query}</b>"</p>
                <span>Check the spelling or try searching for someone else.</span>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default UserSearch;