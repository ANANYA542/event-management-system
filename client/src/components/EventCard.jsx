import { UserIcon, CalendarIcon, ClockIcon, EditIcon, FileIcon } from "./Icons";
import { getDateLabel, getTimeLabel, formatDateLabel } from "../utils/formatDate";
import { DEFAULT_TIMEZONE } from "../constants/timezones";
import "../styles/EventCard.css";

const EventCard = ({ event, viewTimezone, users, onEdit, onViewLogs }) => {
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

  const hasStart = !!(event.startUTC || event.startDateTime);
  const hasEnd = !!(event.endUTC || event.endDateTime);

  return (
    <div className="event-card">
      <div className="event-card__header">
        <div className="event-card__profiles">
          <UserIcon />
          <span>{resolveProfileNames(event.profiles)}</span>
        </div>
      </div>

      <div className="event-card__body">
        {hasStart && (
          <div className="event-row">
            <div className="event-row-main">
              <CalendarIcon />
              <span>
                <span className="event-label">Start:</span>{" "}
                {getDateLabel(
                  event.startUTC,
                  event.startDateTime,
                  event.eventTimezone,
                  viewTimezone,
                  DEFAULT_TIMEZONE
                )}
              </span>
            </div>
            <div className="event-row-sub">
              <ClockIcon />
              <span>
                {getTimeLabel(
                  event.startUTC,
                  event.startDateTime,
                  event.eventTimezone,
                  viewTimezone,
                  DEFAULT_TIMEZONE
                )}
              </span>
            </div>
          </div>
        )}

        {hasEnd && (
          <div className="event-row">
            <div className="event-row-main">
              <CalendarIcon />
              <span>
                <span className="event-label">End:</span>{" "}
                {getDateLabel(
                  event.endUTC,
                  event.endDateTime,
                  event.eventTimezone,
                  viewTimezone,
                  DEFAULT_TIMEZONE
                )}
              </span>
            </div>
            <div className="event-row-sub">
              <ClockIcon />
              <span>
                {getTimeLabel(
                  event.endUTC,
                  event.endDateTime,
                  event.eventTimezone,
                  viewTimezone,
                  DEFAULT_TIMEZONE
                )}
              </span>
            </div>
          </div>
        )}
      </div>

      <div className="event-card__footer">
        <div className="event-meta">
          <div>
            <span className="text-secondary">Created: </span>
            <span>
              {formatDateLabel(event.createdAtUTC || event.createdAt, viewTimezone)}
            </span>
          </div>
          {(event.updatedAtUTC || event.updatedAt) && (
            <div>
              <span className="text-secondary">Updated: </span>
              <span>
                {formatDateLabel(event.updatedAtUTC || event.updatedAt, viewTimezone)}
              </span>
            </div>
          )}
        </div>
        <div className="event-actions">
          <button className="btn btn-small" onClick={() => onEdit(event)}>
            <EditIcon />
            Edit
          </button>
          <button className="btn btn-small" onClick={() => onViewLogs(event)}>
            <FileIcon />
            View Logs
          </button>
        </div>
      </div>
    </div>
  );
};

export default EventCard;

