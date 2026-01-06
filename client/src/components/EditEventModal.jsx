import { useState, useEffect } from "react";
import dayjs from "../lib/dayjs";
import { ClockIcon } from "./Icons";
import { TIMEZONE_OPTIONS } from "../constants/timezones";
import "../styles/modal.css";
import "../styles/EditEventModal.css";

const EditEventModal = ({
  event,
  users,
  editState,
  setEditState,
  updatingEvent,
  onUpdate,
  onCancel,
}) => {
  const [showProfileDropdown, setShowProfileDropdown] = useState(false);
  const [showTimezoneDropdown, setShowTimezoneDropdown] = useState(false);
  const [showStartDatePicker, setShowStartDatePicker] = useState(false);
  const [showEndDatePicker, setShowEndDatePicker] = useState(false);

  if (!event) return null;

  const formatDateTimeForInput = (date) => {
    if (!date) return "";
    return date.format("YYYY-MM-DDTHH:mm");
  };

  const handleStartDateTimeChange = (e) => {
    const value = e.target.value;
    if (value) {
      setEditState((prev) => ({
        ...prev,
        start: dayjs.tz(value, prev.timezone),
      }));
    }
  };

  const handleEndDateTimeChange = (e) => {
    const value = e.target.value;
    if (value) {
      setEditState((prev) => ({
        ...prev,
        end: dayjs.tz(value, prev.timezone),
      }));
    }
  };

  return (
    <div className="modal-overlay" onClick={onCancel}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2>Edit Event</h2>
          <button className="modal-close" onClick={onCancel}>
            ×
          </button>
        </div>
        <div className="modal-body">
          <div className="form-field">
            <label>Profiles</label>
            <div className="custom-select">
              <button
                type="button"
                className="select-trigger"
                onClick={() => setShowProfileDropdown(!showProfileDropdown)}
              >
                {editState.profiles.length > 0
                  ? `${editState.profiles.length} profile(s) selected`
                  : "Select profiles..."}
                <span className="select-arrow">▼</span>
              </button>
              {showProfileDropdown && (
                <>
                  <div
                    className="select-overlay"
                    onClick={() => setShowProfileDropdown(false)}
                  />
                  <div className="select-dropdown select-dropdown-multiple">
                    {users.map((user) => (
                      <label key={user._id} className="select-option-checkbox">
                        <input
                          type="checkbox"
                          checked={editState.profiles.includes(user._id)}
                          onChange={(e) => {
                            if (e.target.checked) {
                              setEditState((prev) => ({
                                ...prev,
                                profiles: [...prev.profiles, user._id],
                              }));
                            } else {
                              setEditState((prev) => ({
                                ...prev,
                                profiles: prev.profiles.filter((id) => id !== user._id),
                              }));
                            }
                          }}
                        />
                        {user.name}
                      </label>
                    ))}
                  </div>
                </>
              )}
            </div>
          </div>

          <div className="form-field">
            <label>Timezone</label>
            <div className="custom-select">
              <button
                type="button"
                className="select-trigger"
                onClick={() => setShowTimezoneDropdown(!showTimezoneDropdown)}
              >
                {TIMEZONE_OPTIONS.find((tz) => tz.value === editState.timezone)?.label ||
                  editState.timezone}
                <span className="select-arrow">▼</span>
              </button>
              {showTimezoneDropdown && (
                <>
                  <div
                    className="select-overlay"
                    onClick={() => setShowTimezoneDropdown(false)}
                  />
                  <div className="select-dropdown">
                    {TIMEZONE_OPTIONS.map((tz) => (
                      <div
                        key={tz.value}
                        className={`select-option ${
                          tz.value === editState.timezone ? "selected" : ""
                        }`}
                        onClick={() => {
                          const newStart = editState.start
                            ? dayjs.utc(editState.start).tz(tz.value)
                            : editState.start;
                          const newEnd = editState.end
                            ? dayjs.utc(editState.end).tz(tz.value)
                            : editState.end;
                          setEditState((prev) => ({
                            ...prev,
                            timezone: tz.value,
                            start: newStart,
                            end: newEnd,
                          }));
                          setShowTimezoneDropdown(false);
                        }}
                      >
                        {tz.value === editState.timezone && (
                          <span className="checkmark">✓</span>
                        )}
                        {tz.label}
                      </div>
                    ))}
                  </div>
                </>
              )}
            </div>
          </div>

          <div className="form-field">
            <label>Start Date &amp; Time</label>
            <div className="date-time-input">
              <input
                type="datetime-local"
                value={formatDateTimeForInput(editState.start)}
                onChange={handleStartDateTimeChange}
                className="form-input"
              />
              <ClockIcon />
            </div>
          </div>

          <div className="form-field">
            <label>End Date &amp; Time</label>
            <div className="date-time-input">
              <input
                type="datetime-local"
                value={formatDateTimeForInput(editState.end)}
                onChange={handleEndDateTimeChange}
                className="form-input"
              />
              <ClockIcon />
            </div>
          </div>
        </div>
        <div className="modal-footer">
          <button className="btn" onClick={onCancel}>
            Cancel
          </button>
          <button
            className="btn btn-primary"
            onClick={onUpdate}
            disabled={updatingEvent}
          >
            {updatingEvent ? "Updating..." : "Update Event"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default EditEventModal;

