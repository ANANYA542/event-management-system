import { useState } from "react";
import { PlusIcon, LoadingSpinner } from "./Icons";
import "../styles/ProfileSelector.css";

const ProfileSelector = ({
  users,
  loadingUsers,
  activeUserId,
  onSelectProfile,
  onAddProfile,
  savingProfile,
}) => {
  const [showInlineAdd, setShowInlineAdd] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [isOpen, setIsOpen] = useState(false);
  const [newProfileName, setNewProfileName] = useState("");

  const activeUser = users.find((u) => u._id === activeUserId);
  const filteredUsers = users.filter((u) =>
    u.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleAddProfile = (e) => {
    e.preventDefault();
    if (newProfileName.trim()) {
      onAddProfile(newProfileName.trim());
      setNewProfileName("");
      setShowInlineAdd(false);
    }
  };

  return (
    <div className="profile-selector">
      <label className="form-label">Select current profile</label>
      <div className="custom-select">
        <button
          className="select-trigger"
          onClick={() => setIsOpen(!isOpen)}
          type="button"
        >
          {activeUser ? activeUser.name : "Select profile..."}
          <span className="select-arrow">▼</span>
        </button>
        {isOpen && (
          <>
            <div className="select-overlay" onClick={() => setIsOpen(false)} />
            <div className="select-dropdown">
              <div className="select-search">
                <input
                  type="text"
                  placeholder="Search current profile..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  autoFocus
                />
              </div>
              <div className="select-options">
                {loadingUsers ? (
                  <div className="select-loading">
                    <LoadingSpinner />
                  </div>
                ) : filteredUsers.length === 0 ? (
                  <div className="select-empty">No profiles found</div>
                ) : (
                  filteredUsers.map((user) => (
                    <div
                      key={user._id}
                      className={`select-option ${
                        user._id === activeUserId ? "selected" : ""
                      }`}
                      onClick={() => {
                        onSelectProfile(user._id);
                        setIsOpen(false);
                        setSearchQuery("");
                      }}
                    >
                      {user._id === activeUserId && <span className="checkmark">✓</span>}
                      {user.name}
                    </div>
                  ))
                )}
              </div>
              <div className="select-divider"></div>
              {showInlineAdd ? (
                <div className="add-profile-inline">
                  <input
                    type="text"
                    placeholder="Profile name"
                    value={newProfileName}
                    onChange={(e) => setNewProfileName(e.target.value)}
                    onKeyPress={(e) => e.key === "Enter" && handleAddProfile(e)}
                  />
                  <button
                    className="btn btn-primary btn-small"
                    onClick={handleAddProfile}
                    disabled={savingProfile}
                  >
                    {savingProfile ? <LoadingSpinner /> : <PlusIcon />}
                    Add
                  </button>
                </div>
              ) : (
                <button
                  className="select-add-btn"
                  onClick={(e) => {
                    e.preventDefault();
                    setShowInlineAdd(true);
                  }}
                >
                  <PlusIcon />
                  Add Profile
                </button>
              )}
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default ProfileSelector;

