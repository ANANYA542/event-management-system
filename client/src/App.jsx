import { useEffect, useMemo, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  Button,
  Card,
  DatePicker,
  Divider,
  Empty,
  Input,
  List,
  Modal,
  Select,
  Space,
  Spin,
  Tag,
  Typography,
  message,
} from "antd";
import {
  CalendarOutlined,
  ClockCircleOutlined,
  EditOutlined,
  FileTextOutlined,
  HistoryOutlined,
  PlusOutlined,
  UserOutlined,
} from "@ant-design/icons";
import "dayjs/locale/en";
import "./App.css";
import dayjs from "./lib/dayjs";
import { TIMEZONE_OPTIONS, DEFAULT_TIMEZONE } from "./constants/timezones";
import {
  closeLogs,
  createNewEvent,
  createProfile,
  loadEvents,
  loadUsers,
  openLogs as openLogsAction,
  setActiveUserId,
  setViewTimezone,
  updateExistingEvent,
} from "./store/eventSlice";

const { Title, Text } = Typography;

const formatTzLabel = (tz) =>
  TIMEZONE_OPTIONS.find((item) => item.value === tz)?.label || tz;

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
  const [newProfileTimezone, setNewProfileTimezone] =
    useState(DEFAULT_TIMEZONE);
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
    setStartAt((prev) => (prev ? prev.tz(formTimezone, true) : prev));
    setEndAt((prev) => (prev ? prev.tz(formTimezone, true) : prev));
  }, [formTimezone]);

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

  const handleCreateProfile = async () => {
    if (!newProfileName.trim()) {
      return message.warning("Please enter a profile name");
    }

    try {
      setSavingProfile(true);
      const data = await dispatch(
        createProfile({
          name: newProfileName.trim(),
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

    // Handle both UTC and legacy dateTime formats
    let start, end;

    if (event.startUTC) {
      // New format: UTC stored, convert to event timezone
      start = dayjs.utc(event.startUTC).tz(eventTz);
    } else if (event.startDateTime) {
      // Legacy format: already in some timezone, parse it
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

  const formatDateLabel = (utcDate) =>
    utcDate
      ? dayjs.utc(utcDate).tz(viewTimezone).format("MMM DD, YYYY [at] hh:mm A")
      : "--";

  const formatDateOnly = (utcDate) =>
    utcDate ? dayjs.utc(utcDate).tz(viewTimezone).format("MMM DD, YYYY") : "--";

  const formatTimeOnly = (utcDate) =>
    utcDate ? dayjs.utc(utcDate).tz(viewTimezone).format("hh:mm A") : "--";

  const openLogs = async (event) => {
    try {
      await dispatch(
        openLogsAction({ eventId: event._id, userTimezone: viewTimezone })
      ).unwrap();
    } catch (error) {
      message.error(error.response?.data?.message || "Failed to load logs");
    }
  };

  const resolveProfileNames = (ids = []) => {
    const names = ids
      .map((entry) => {
        if (!entry) return null;
        if (typeof entry === "string") {
          return users.find((u) => String(u._id) === String(entry))?.name;
        }
        if (entry?.name) return entry.name;
        if (entry?._id) {
          return users.find((u) => String(u._id) === String(entry._id))?.name;
        }
        return null;
      })
      .filter(Boolean);
    return names.join(", ");
  };

  const renderLogDiff = (log) => {
    const changes = [];
    if (log.oldValues?.eventTimezone !== log.newValues?.eventTimezone) {
      changes.push({
        label: "Timezone",
        from: formatTzLabel(log.oldValues?.eventTimezone),
        to: formatTzLabel(log.newValues?.eventTimezone),
      });
    }

    if (
      log.oldValues?.startUTC &&
      log.newValues?.startUTC &&
      log.oldValues?.startUTC !== log.newValues?.startUTC
    ) {
      changes.push({
        label: "Start",
        from: formatDateLabel(log.oldValues.startUTC),
        to: formatDateLabel(log.newValues.startUTC),
      });
    }

    if (
      log.oldValues?.endUTC &&
      log.newValues?.endUTC &&
      log.oldValues?.endUTC !== log.newValues?.endUTC
    ) {
      changes.push({
        label: "End",
        from: formatDateLabel(log.oldValues.endUTC),
        to: formatDateLabel(log.newValues.endUTC),
      });
    }

    if (
      log.oldValues?.profiles &&
      log.newValues?.profiles &&
      log.oldValues?.profiles?.join(",") !== log.newValues?.profiles?.join(",")
    ) {
      changes.push({
        label: "Profiles",
        from: resolveProfileNames(log.oldValues.profiles),
        to: resolveProfileNames(log.newValues.profiles),
      });
    }

    if (changes.length === 0) {
      return <Text type="secondary">Start date/time updated.</Text>;
    }

    return (
      <div className="log-diffs">
        {changes.map((change) => (
          <div key={change.label} className="log-diff-row">
            <Text strong>{change.label}:</Text>
            <div className="log-diff-values">
              <Tag>{change.from || "—"}</Tag>
              <span className="log-arrow">→</span>
              <Tag color="purple">{change.to || "—"}</Tag>
            </div>
          </div>
        ))}
      </div>
    );
  };

  const renderEvents = () => {
    if (eventsLoading) {
      return (
        <div className="panel-loading">
          <Spin />
        </div>
      );
    }

    if (!events.length) {
      return (
        <Empty
          image={Empty.PRESENTED_IMAGE_SIMPLE}
          description="No events found"
        />
      );
    }

    return (
      <List
        dataSource={events}
        renderItem={(event) => {
          const hasStart = !!(event.startUTC || event.startDateTime);
          const hasEnd = !!(event.endUTC || event.endDateTime);

          const getDateLabel = (utcValue, dateTimeValue) => {
            // If we have UTC, convert using viewTimezone
            if (utcValue) {
              return formatDateOnly(utcValue);
            }
            // Legacy format: parse and convert to viewTimezone
            if (dateTimeValue) {
              // Parse assuming it's in the event's timezone, then convert to viewTimezone
              const eventTz = event.eventTimezone || DEFAULT_TIMEZONE;
              return dayjs
                .tz(dateTimeValue, eventTz)
                .tz(viewTimezone)
                .format("MMM DD, YYYY");
            }
            return "";
          };

          const getTimeLabel = (utcValue, dateTimeValue) => {
            // If we have UTC, convert using viewTimezone
            if (utcValue) {
              return formatTimeOnly(utcValue);
            }
            // Legacy format: parse and convert to viewTimezone
            if (dateTimeValue) {
              const eventTz = event.eventTimezone || DEFAULT_TIMEZONE;
              return dayjs
                .tz(dateTimeValue, eventTz)
                .tz(viewTimezone)
                .format("hh:mm A");
            }
            return "";
          };

          return (
            <List.Item className="event-card" key={event._id}>
              <div className="event-card__header">
                <div className="event-card__profiles">
                  <UserOutlined />
                  <span>{resolveProfileNames(event.profiles)}</span>
                </div>
              </div>

              <div className="event-card__body">
                {hasStart && (
                  <div className="event-row">
                    <div className="event-row-main">
                      <CalendarOutlined className="event-row__icon" />
                      <Text>
                        <span className="event-label">Start:</span>{" "}
                        {getDateLabel(event.startUTC, event.startDateTime)}
                      </Text>
                    </div>
                    <div className="event-row-sub">
                      <ClockCircleOutlined className="event-row__icon" />
                      <Text>
                        {getTimeLabel(event.startUTC, event.startDateTime)}
                      </Text>
                    </div>
                  </div>
                )}

                {hasEnd && (
                  <div className="event-row">
                    <div className="event-row-main">
                      <CalendarOutlined className="event-row__icon" />
                      <Text>
                        <span className="event-label">End:</span>{" "}
                        {getDateLabel(event.endUTC, event.endDateTime)}
                      </Text>
                    </div>
                    <div className="event-row-sub">
                      <ClockCircleOutlined className="event-row__icon" />
                      <Text>
                        {getTimeLabel(event.endUTC, event.endDateTime)}
                      </Text>
                    </div>
                  </div>
                )}
              </div>

              <div className="event-card__footer">
                <div className="event-meta">
                  <div>
                    <Text type="secondary">Created: </Text>
                    <Text>
                      {formatDateLabel(event.createdAtUTC || event.createdAt)}
                    </Text>
                  </div>
                  {(event.updatedAtUTC || event.updatedAt) && (
                    <div>
                      <Text type="secondary">Updated: </Text>
                      <Text>
                        {formatDateLabel(event.updatedAtUTC || event.updatedAt)}
                      </Text>
                    </div>
                  )}
                </div>
                <div className="event-actions">
                  <Button
                    icon={<EditOutlined />}
                    onClick={() => openEditModal(event)}
                    size="small"
                  >
                    Edit
                  </Button>
                  <Button
                    icon={<FileTextOutlined />}
                    onClick={() => openLogs(event)}
                    size="small"
                  >
                    View Logs
                  </Button>
                </div>
              </div>
            </List.Item>
          );
        }}
      />
    );
  };

  const [showInlineAddProfile, setShowInlineAddProfile] = useState(false);

  const dropdownAddProfile = showInlineAddProfile ? (
    <div className="add-profile-inline">
      <Input
        size="small"
        placeholder="Profile name"
        value={newProfileName}
        onChange={(e) => setNewProfileName(e.target.value)}
        onPressEnter={handleCreateProfile}
      />
      <Button
        type="primary"
        size="small"
        icon={<PlusOutlined />}
        loading={savingProfile}
        onClick={(e) => {
          e.preventDefault();
          handleCreateProfile();
        }}
      >
        Add
      </Button>
    </div>
  ) : (
    <Button
      type="text"
      block
      icon={<PlusOutlined />}
      onClick={(e) => {
        e.preventDefault();
        setShowInlineAddProfile(true);
      }}
      style={{ textAlign: "left" }}
    >
      Add Profile
    </Button>
  );

  return (
    <div className="page">
      <div className="page__header">
        <div>
          <Title level={2} style={{ margin: 0 }}>
            Event Management
          </Title>
          <Text type="secondary">
            Create and manage events across multiple timezones
          </Text>
        </div>
        <div className="header-actions">
          <Text type="secondary">Select current profile</Text>
          <Select
            className="profile-select"
            placeholder="Search current profile..."
            value={activeUserId || undefined}
            onChange={(value) => dispatch(setActiveUserId(value))}
            options={users.map((u) => ({
              label: u.name,
              value: u._id,
            }))}
            showSearch
            filterOption={(input, option) =>
              (option?.label ?? "")
                .toString()
                .toLowerCase()
                .includes(input.toLowerCase())
            }
            notFoundContent={loadingUsers ? <Spin size="small" /> : null}
            dropdownRender={(menu) => (
              <>
                {menu}
                <Divider style={{ margin: "8px 0" }} />
                {dropdownAddProfile}
              </>
            )}
          />
        </div>
      </div>

      <div className="page__grid">
        <Card className="panel">
          <div className="panel__title">Create Event</div>

          <div className="form-field">
            <label>Event Title</label>
            <Input
              placeholder="Enter event title"
              value={formTitle}
              onChange={(e) => setFormTitle(e.target.value)}
            />
          </div>

          <div className="form-field">
            <label>Profiles</label>
            <Select
              mode="multiple"
              placeholder="Select profiles..."
              value={formProfiles}
              options={users.map((u) => ({
                label: u.name,
                value: u._id,
              }))}
              onChange={(value) => setFormProfiles(value)}
              dropdownRender={(menu) => (
                <>
                  {menu}
                  <Divider style={{ margin: "8px 0" }} />
                  {dropdownAddProfile}
                </>
              )}
            />
          </div>

          <div className="form-field">
            <label>Timezone</label>
            <Select
              value={formTimezone}
              options={TIMEZONE_OPTIONS}
              onChange={setFormTimezone}
            />
          </div>

          <div className="form-field">
            <label>Start Date &amp; Time</label>
            <DatePicker
              className="full-width"
              value={startAt}
              onChange={setStartAt}
              showTime={{ format: "HH:mm" }}
              format="MMM DD, YYYY hh:mm A"
              suffixIcon={<ClockCircleOutlined />}
            />
          </div>

          <div className="form-field">
            <label>End Date &amp; Time</label>
            <DatePicker
              className="full-width"
              value={endAt}
              onChange={setEndAt}
              showTime={{ format: "HH:mm" }}
              format="MMM DD, YYYY hh:mm A"
              suffixIcon={<ClockCircleOutlined />}
            />
          </div>

          <Button
            type="primary"
            icon={<PlusOutlined />}
            block
            size="large"
            onClick={handleCreateEvent}
            loading={creatingEvent}
          >
            Create Event
          </Button>
        </Card>

        <Card className="panel">
          <div className="panel__title">Events</div>

          <div className="form-field">
            <label>View in Timezone</label>
            <Select
              value={viewTimezone}
              options={TIMEZONE_OPTIONS}
              onChange={(value) => dispatch(setViewTimezone(value))}
              suffixIcon={<ClockCircleOutlined />}
            />
          </div>

          <div className="events-wrapper">{renderEvents()}</div>
        </Card>
      </div>

      <Modal
        title="Edit Event"
        open={!!editingEvent}
        onCancel={() => setEditingEvent(null)}
        onOk={handleUpdateEvent}
        okText="Update Event"
        confirmLoading={updatingEvent}
        destroyOnClose
      >
        <Space direction="vertical" size="middle" style={{ width: "100%" }}>
          <div className="form-field">
            <label>Profiles</label>
            <Select
              mode="multiple"
              value={editState.profiles}
              options={users.map((u) => ({ label: u.name, value: u._id }))}
              onChange={(value) =>
                setEditState((prev) => ({ ...prev, profiles: value }))
              }
            />
          </div>
          <div className="form-field">
            <label>Timezone</label>
            <Select
              value={editState.timezone}
              options={TIMEZONE_OPTIONS}
              onChange={(value) =>
                setEditState((prev) => {
                  // Convert the moment in time to the new timezone
                  // First convert to UTC (to preserve the moment), then to new timezone
                  const newStart = prev.start
                    ? dayjs.utc(prev.start).tz(value)
                    : prev.start;
                  const newEnd = prev.end
                    ? dayjs.utc(prev.end).tz(value)
                    : prev.end;
                  return {
                    ...prev,
                    timezone: value,
                    start: newStart,
                    end: newEnd,
                  };
                })
              }
            />
          </div>
          <div className="form-field">
            <label>Start Date &amp; Time</label>
            <DatePicker
              className="full-width"
              value={editState.start}
              onChange={(value) =>
                setEditState((prev) => ({ ...prev, start: value }))
              }
              showTime={{ format: "HH:mm" }}
              format="MMM DD, YYYY hh:mm A"
              suffixIcon={<ClockCircleOutlined />}
            />
          </div>
          <div className="form-field">
            <label>End Date &amp; Time</label>
            <DatePicker
              className="full-width"
              value={editState.end}
              onChange={(value) =>
                setEditState((prev) => ({ ...prev, end: value }))
              }
              showTime={{ format: "HH:mm" }}
              format="MMM DD, YYYY hh:mm A"
              suffixIcon={<ClockCircleOutlined />}
            />
          </div>
        </Space>
      </Modal>

      <Modal
        title="Event Update History"
        open={logsState.open}
        onCancel={() => dispatch(closeLogs())}
        footer={null}
        width={560}
      >
        {logsState.loading ? (
          <div className="panel-loading">
            <Spin />
          </div>
        ) : logsState.entries.length === 0 ? (
          <Empty description="No update history yet" />
        ) : (
          <List
            dataSource={logsState.entries}
            renderItem={(item) => (
              <List.Item className="log-card">
                <Space direction="vertical" size={4} style={{ width: "100%" }}>
                  <Text strong>{item.message || "Event updated"}</Text>
                  <Text type="secondary">
                    {item.timestamp}{" "}
                    {item.changedBy?.name ? `· by ${item.changedBy.name}` : ""}
                  </Text>
                  {renderLogDiff(item)}
                </Space>
              </List.Item>
            )}
          />
        )}
      </Modal>
    </div>
  );
}

export default App;
