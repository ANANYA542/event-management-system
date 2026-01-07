import { useState, useEffect } from "react";
import dayjs from "../lib/dayjs";
import { PlusIcon, ClockIcon } from "./Icons";
import { DEFAULT_TIMEZONE, TIMEZONE_OPTIONS } from "../constants/timezones";


const CreateEventForm = ({users,formTitle,setFormTitle,formProfiles,setFormProfiles,formTimezone,
  setFormTimezone,
  startAt,
  setStartAt,
  endAt,
  setEndAt,
  creatingEvent,
  onCreateEvent,
  onAddProfile,
  savingProfile,
}) => {
  const [showProfileDropdown, setShowProfileDropdown] = useState(false);
  const [showTimezoneDropdown, setShowTimezoneDropdown] = useState(false);
  const [showStartDatePicker, setShowStartDatePicker] = useState(false);
  const [showEndDatePicker, setShowEndDatePicker] = useState(false);
  const [newProfileName, setNewProfileName] = useState("");

  useEffect(() => {
    setStartAt((prev) => (prev ? prev.tz(formTimezone, true) : prev));
    setEndAt((prev) => (prev ? prev.tz(formTimezone, true) : prev));
  }, [formTimezone, setStartAt, setEndAt]);

  const formatDateTimeForInput = (date) => {
    if (!date) return "";
    return date.format("YYYY-MM-DDTHH:mm");
  };

  const handleStartDateTimeChange = (e) => {
    const value = e.target.value;
    if (value) {
      setStartAt(dayjs.tz(value, formTimezone));
    }
  };

  const handleEndDateTimeChange = (e) => {
    const value = e.target.value;
    if (value) {
      setEndAt(dayjs.tz(value, formTimezone));
    }
  };

  const handleAddProfile = (e) => {
    e.preventDefault();
    if (newProfileName.trim()) {
      onAddProfile(newProfileName.trim());
      setNewProfileName("");
    }
  };

  return (
    <div className="panel">
      <div className="panel__title">Create Event</div>

      <div className="form-field">
        <label>Event Title</label>
        <input
          type="text"
          placeholder="Enter event title"
          value={formTitle}
          onChange={(e) => setFormTitle(e.target.value)}
          className="form-input"
        />
      </div>

      <div className="form-field">
        <label>Profiles</label>
        <div className="custom-select">
          <button
            type="button"
            className="select-trigger"
            onClick={() => setShowProfileDropdown(!showProfileDropdown)}
          >
            {formProfiles.length > 0
              ? `${formProfiles.length} profile(s) selected`
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
                      checked={formProfiles.includes(user._id)}
                      onChange={(e) => {
                        if (e.target.checked) {
                          setFormProfiles([...formProfiles, user._id]);
                        } else {
                          setFormProfiles(formProfiles.filter((id) => id !== user._id));
                        }
                      }}
                    />
                    {user.name}
                  </label>
                ))}
                <div className="select-divider"></div>
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
                    <PlusIcon />
                    Add
                  </button>
                </div>
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
            {TIMEZONE_OPTIONS.find((tz) => tz.value === formTimezone)?.label ||
              formTimezone}
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
                      tz.value === formTimezone ? "selected" : ""
                    }`}
                    onClick={() => {
                      setFormTimezone(tz.value);
                      setShowTimezoneDropdown(false);
                    }}
                  >
                    {tz.value === formTimezone && <span className="checkmark">✓</span>}
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
            value={formatDateTimeForInput(startAt)}
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
            value={formatDateTimeForInput(endAt)}
            onChange={handleEndDateTimeChange}
            className="form-input"
          />
          <ClockIcon />
        </div>
      </div>

      <button
        className="btn btn-primary btn-large btn-block"
        onClick={onCreateEvent}
        disabled={creatingEvent}
      >
        {creatingEvent ? (
          <>
            <span className="spinner-small"></span>
            Creating...
          </>
        ) : (
          <>
            <PlusIcon />
            Create Event
          </>
        )}
      </button>
    </div>
  );
};

export default CreateEventForm;

