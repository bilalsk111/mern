import React, { useEffect, useState, useRef } from "react";
import axios from "axios";
import { ChevronRight, Check, X, Loader2 } from "lucide-react";
import '../style/edit.scss';

const EditProfile = ({ currentUser, onClose, onUpdate }) => {
  const [form, setForm] = useState({
    name:     currentUser?.name     || "",
    bio:      currentUser?.bio      || "",
    username: currentUser?.username || "",
  });

  const [preview, setPreview]             = useState(currentUser?.profileImage || "/default-avatar.png");
  const [selectedFile, setSelectedFile]   = useState(null);
  const [usernameStatus, setUsernameStatus] = useState("");  // "" | "checking" | "available" | "taken"
  const [loading, setLoading]             = useState(false);
  const [error, setError]                 = useState("");
  const [activeField, setActiveField]     = useState(null);

  const fileInputRef = useRef(null);

  /* ── Username availability check ── */
  useEffect(() => {
    if (!form.username || form.username === currentUser.username) {
      setUsernameStatus(""); return;
    }
    setUsernameStatus("checking");
    const t = setTimeout(async () => {
      try {
        const res = await axios.get("/api/users/checkUser", { params: { username: form.username } });
        setUsernameStatus(res.data.available ? "available" : "taken");
      } catch { setUsernameStatus(""); }
    }, 500);
    return () => clearTimeout(t);
  }, [form.username, currentUser.username]);

  /* ── Image picker ── */
  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setSelectedFile(file);
    if (preview.startsWith("blob:")) URL.revokeObjectURL(preview);
    setPreview(URL.createObjectURL(file));
  };

  /* ── Submit ── */
  const handleSubmit = async () => {
    if (loading || usernameStatus === "taken") return;
    setLoading(true); setError("");
    const fd = new FormData();
    fd.append("name",     form.name);
    fd.append("username", form.username);
    fd.append("bio",      form.bio);
    if (selectedFile) fd.append("profileImage", selectedFile);
    try {
      const ok = await onUpdate(fd);
      if (ok) onClose();
    } catch (err) {
      setError(err.message || "Update failed");
    } finally {
      setLoading(false);
    }
  };

  const usernameIcon = () => {
    if (usernameStatus === "checking")  return <Loader2 size={14} className="spin" />;
    if (usernameStatus === "available") return <Check   size={14} color="#22c55e" />;
    if (usernameStatus === "taken")     return <X       size={14} color="#ef4444" />;
    return null;
  };

  return (
    <div className="ep-overlay" onClick={onClose}>
      <div className="ep-modal" onClick={(e) => e.stopPropagation()}>

        {/* ── Header ── */}
        <div className="ep-header">
          <button className="ep-header__cancel" onClick={onClose}>Cancel</button>
          <h2 className="ep-header__title">Edit profile</h2>
          <button
            className="ep-header__done"
            onClick={handleSubmit}
            disabled={loading || usernameStatus === "taken"}
          >
            {loading ? <Loader2 size={14} className="spin" /> : "Done"}
          </button>
        </div>

        {/* ── Scrollable body ── */}
        <div className="ep-body">

          {/* Avatar row */}
          <div className="ep-avatar-row">
            <div className="ep-avatar-wrap" onClick={() => fileInputRef.current.click()}>
              <img src={preview} alt="" className="ep-avatar-img" />
              <div className="ep-avatar-overlay">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2">
                  <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z"/>
                  <circle cx="12" cy="13" r="4"/>
                </svg>
              </div>
            </div>
            <div className="ep-avatar-meta">
              <span className="ep-avatar-meta__name">{currentUser?.username}</span>
              <button className="ep-avatar-meta__change" onClick={() => fileInputRef.current.click()}>
                Change photo
              </button>
            </div>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              hidden
              onChange={handleImageChange}
            />
          </div>

          {/* ── Fields ── */}
          <div className="ep-fields">

            {/* Name */}
            <div className={`ep-field ${activeField === "name" ? "ep-field--active" : ""}`}>
              <label className="ep-field__label">Name</label>
              <div className="ep-field__control">
                <input
                  type="text"
                  className="ep-field__input"
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  onFocus={() => setActiveField("name")}
                  onBlur={() => setActiveField(null)}
                  placeholder="Name"
                />
                <p className="ep-field__hint">
                  Help people discover your account by using the name you're known by.
                </p>
              </div>
            </div>

            {/* Username */}
            <div className={`ep-field ${activeField === "username" ? "ep-field--active" : ""} ${usernameStatus === "taken" ? "ep-field--error" : ""}`}>
              <label className="ep-field__label">Username</label>
              <div className="ep-field__control">
                <div className="ep-field__input-row">
                  <input
                    type="text"
                    className="ep-field__input"
                    value={form.username}
                    onChange={(e) => setForm({ ...form, username: e.target.value })}
                    onFocus={() => setActiveField("username")}
                    onBlur={() => setActiveField(null)}
                    placeholder="Username"
                  />
                  <span className="ep-field__status">{usernameIcon()}</span>
                </div>
                {usernameStatus === "taken" && (
                  <p className="ep-field__hint ep-field__hint--error">
                    This username is already taken.
                  </p>
                )}
                {usernameStatus !== "taken" && (
                  <p className="ep-field__hint">
                    You can change your username back to {currentUser?.username} within 14 days.
                  </p>
                )}
              </div>
            </div>

            {/* Bio */}
            <div className={`ep-field ep-field--bio ${activeField === "bio" ? "ep-field--active" : ""}`}>
              <label className="ep-field__label">Bio</label>
              <div className="ep-field__control">
                <textarea
                  className="ep-field__input ep-field__input--textarea"
                  value={form.bio}
                  onChange={(e) => setForm({ ...form, bio: e.target.value })}
                  onFocus={() => setActiveField("bio")}
                  onBlur={() => setActiveField(null)}
                  maxLength={150}
                  placeholder="Write a bio..."
                  rows={3}
                />
                <p className="ep-field__char">{form.bio.length} / 150</p>
              </div>
            </div>

          </div>

          {/* Error */}
          {error && <p className="ep-error">{error}</p>}

          {/* Personal info link */}
          <button className="ep-personal-link">
            <span>Personal information settings</span>
            <ChevronRight size={16} />
          </button>
        </div>
      </div>
    </div>
  );
};

export default EditProfile;