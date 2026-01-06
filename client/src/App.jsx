import { useEffect, useMemo, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import dayjs from "./lib/dayjs";
import "./App.css";
import { TIMEZONE_OPTIONS, DEFAULT_TIMEZONE } from "./constants/timezones";
import {closeLogs,createNewEvent,createProfile,loadEvents,loadUsers,openLogs as openLogsAction,setActiveUserId,setViewTimezone,updateExistingEvent,} from "./store/eventSlice";
import { message } from "./utils/notifications";
import ProfileSelector from "./components/ProfileSelector";
import CreateEventForm from "./components/CreateEventForm";
import EventList from "./components/EventList";
import EditEventModal from "./components/EditEventModal";
import LogsModal from "./components/LogsModal";

const buildDefaultTimes = (tz = DEFAULT_TIMEZONE) => {
  const start = dayjs()
    .tz(tz)
    .add(1, "day")
    .hour(9)
    .minute(0)
    .second(0)
    .millisecond(0);
  return {
    start,
    end: start.add(1, "hour"),
  };
};

function App() {
  const dispatch = useDispatch();
  const {
    users,
    loadingUsers,
    activeUserId,
    events,
    eventsLoading,
    viewTimezone,
    defaults,
    logsState,
  } = useSelector((state) => state.events);

  const [formTitle, setFormTitle] = useState("");
  const [formProfiles, setFormProfiles] = useState([]);
  const [formTimezone, setFormTimezone] = useState(DEFAULT_TIMEZONE);
  const [startAt, setStartAt] = useState(defaults.start);
  const [endAt, setEndAt] = useState(defaults.end);
  const [creatingEvent, setCreatingEvent] = useState(false);

  const [newProfileName, setNewProfileName] = useState("");
  const [newProfileTimezone, setNewProfileTimezone] =useState(DEFAULT_TIMEZONE);
  const [savingProfile, setSavingProfile] = useState(false);

  const [editingEvent, setEditingEvent] = useState(null);
  const [editState, setEditState] = useState({
    profiles: [],
    timezone: DEFAULT_TIMEZONE,
    start: null,
    end: null,
  });
  const [updatingEvent, setUpdatingEvent] = useState(false);

  const activeUser = useMemo(
    () => users.find((u) => u._id === activeUserId),
    [users, activeUserId]
  );

  useEffect(() => {
    dispatch(loadUsers())
      .unwrap()
      .catch((error) => {
        message.error(error.response?.data?.message || "Failed to load users");
      });
  }, [dispatch]);

  useEffect(() => {
    if (!activeUserId) return;
    dispatch(setViewTimezone(activeUser?.timezone || DEFAULT_TIMEZONE));
    const run = async () => {
      try {
        await dispatch(loadEvents(activeUserId)).unwrap();
      } catch (error) {
        message.error(error.response?.data?.message || "Failed to load events");
      }
    };
    run();
  }, [activeUserId, activeUser, dispatch]);

  const handleCreateProfile = async (name) => {
    try {
      setSavingProfile(true);
      const data = await dispatch(
        createProfile({
          name,
          timezone: newProfileTimezone,
        })
      ).unwrap();

      setNewProfileName("");
      setFormProfiles((prev) => [...prev, data._id]);
      message.success("Profile created");
    } catch (error) {
      message.error(error.response?.data?.message || "Failed to add profile");
    } finally {
      setSavingProfile(false);
    }
  };

  const resetForm = () => {
    setFormTitle("");
    setFormProfiles([]);
    setFormTimezone(DEFAULT_TIMEZONE);
    const defaults = buildDefaultTimes(DEFAULT_TIMEZONE);
    setStartAt(defaults.start);
    setEndAt(defaults.end);
  };

  const handleCreateEvent = async () => {
    if (!formTitle.trim()) {
      return message.warning("Please add a title for the event");
    }
    if (formProfiles.length === 0) {
      return message.warning("Select at least one profile");
    }
    if (!startAt || !endAt) {
      return message.warning("Select start and end date/time");
    }
    if (!endAt.isAfter(startAt)) {
      return message.error("End date/time must be after start date/time");
    }

    try {
      setCreatingEvent(true);
      await dispatch(
        createNewEvent({
          title: formTitle.trim(),
          profiles: formProfiles,
          eventTimezone: formTimezone,
          startDateTime: startAt.format("YYYY-MM-DD HH:mm"),
          endDateTime: endAt.format("YYYY-MM-DD HH:mm"),
        })
      ).unwrap();
      message.success("Event created");
      resetForm();
    } catch (error) {
      message.error(error.response?.data?.message || "Failed to create event");
    } finally {
      setCreatingEvent(false);
    }
  };

  const openEditModal = (event) => {
    setEditingEvent(event);
    const eventTz = event.eventTimezone || DEFAULT_TIMEZONE;

    let start, end;

    if (event.startUTC) {
      start = dayjs.utc(event.startUTC).tz(eventTz);
    } else if (event.startDateTime) {
      start = dayjs(event.startDateTime).tz(eventTz, true);
    } else {
      start = null;
    }

    if (event.endUTC) {
      end = dayjs.utc(event.endUTC).tz(eventTz);
    } else if (event.endDateTime) {
      end = dayjs(event.endDateTime).tz(eventTz, true);
    } else {
      end = null;
    }

    setEditState({
      profiles: event.profiles.map((p) => p._id || p),
      timezone: eventTz,
      start,
      end,
    });
  };

  const handleUpdateEvent = async () => {
    if (!editingEvent) return;
    const { profiles, timezone, start, end } = editState;
    if (profiles.length === 0) {
      return message.warning("Select at least one profile");
    }
    if (!start || !end) {
      return message.warning("Select start and end date/time");
    }
    if (!end.isAfter(start)) {
      return message.error("End date/time must be after start date/time");
    }
    try {
      setUpdatingEvent(true);
      await dispatch(
        updateExistingEvent({
          eventId: editingEvent._id,
          profiles,
          eventTimezone: timezone,
          startDateTime: start.format("YYYY-MM-DD HH:mm"),
          endDateTime: end.format("YYYY-MM-DD HH:mm"),
          actingUserId: activeUserId,
        })
      ).unwrap();
      message.success("Event updated");
      setEditingEvent(null);
    } catch (error) {
      message.error(error.response?.data?.message || "Failed to update event");
    } finally {
      setUpdatingEvent(false);
    }
  };

  const openLogs = async (event) => {
    try {
      await dispatch(
        openLogsAction({ eventId: event._id, userTimezone: viewTimezone })
      ).unwrap();
    } catch (error) {
      message.error(error.response?.data?.message || "Failed to load logs");
    }
  };

  const [showTimezoneDropdown, setShowTimezoneDropdown] = useState(false);

  return (
    <div className="page">
      <div className="page__header">
        <div>
          <h2 className="page-title">Event Management</h2>
          <p className="page-subtitle">
            Create and manage events across multiple timezones
          </p>
        </div>
        <div className="header-actions">
          <ProfileSelector
            users={users}
            loadingUsers={loadingUsers}
            activeUserId={activeUserId}
            onSelectProfile={(id) => dispatch(setActiveUserId(id))}
            onAddProfile={handleCreateProfile}
            savingProfile={savingProfile}
          />
        </div>
      </div>

      <div className="page__grid">
        <CreateEventForm users={users} formTitle={formTitle} setFormTitle={setFormTitle} formProfiles={formProfiles}
          setFormProfiles={setFormProfiles} formTimezone={formTimezone} setFormTimezone={setFormTimezone} startAt={startAt} setStartAt={setStartAt} endAt={endAt}
          setEndAt={setEndAt}
          creatingEvent={creatingEvent}
          onCreateEvent={handleCreateEvent}
          onAddProfile={handleCreateProfile}
          savingProfile={savingProfile}
        />

        <div className="panel">
          <div className="panel__title">Events</div>

          <div className="form-field">
            <label>View in Timezone</label>
            <div className="custom-select">
              <button
                type="button"
                className="select-trigger"
                onClick={() => setShowTimezoneDropdown(!showTimezoneDropdown)}
              >
                {TIMEZONE_OPTIONS.find((tz) => tz.value === viewTimezone)
                  ?.label || viewTimezone}
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
                          tz.value === viewTimezone ? "selected" : ""
                        }`}
                        onClick={() => {
                          dispatch(setViewTimezone(tz.value));
                          setShowTimezoneDropdown(false);
                        }}
                      >
                        {tz.value === viewTimezone && (
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

          <div className="events-wrapper">
            <EventList
              events={events}
              loading={eventsLoading}
              viewTimezone={viewTimezone}
              users={users}
              onEdit={openEditModal}
              onViewLogs={openLogs}
            />
          </div>
        </div>
      </div>

      {editingEvent && (
        <EditEventModal
          event={editingEvent}
          users={users}
          editState={editState}
          setEditState={setEditState}
          updatingEvent={updatingEvent}
          onUpdate={handleUpdateEvent}
          onCancel={() => setEditingEvent(null)}
        />
      )}

      <LogsModal
        logsState={logsState}
        users={users}
        viewTimezone={viewTimezone}
        onClose={() => dispatch(closeLogs())}
      />
    </div>
  );
}

export default App;
