import { LoadingSpinner } from "./Icons";
import { formatDateLabel, formatTzLabel } from "../utils/formatDate";
import { TIMEZONE_OPTIONS } from "../constants/timezones";
import "../styles/modal.css";
import "../styles/LogsModal.css";

const LogsModal = ({ logsState, users, viewTimezone, onClose }) => {
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
        from: formatTzLabel(log.oldValues?.eventTimezone, TIMEZONE_OPTIONS),
        to: formatTzLabel(log.newValues?.eventTimezone, TIMEZONE_OPTIONS),
      });
    }

    if (
      log.oldValues?.startUTC &&
      log.newValues?.startUTC &&
      log.oldValues?.startUTC !== log.newValues?.startUTC
    ) {
      changes.push({
        label: "Start",
        from: formatDateLabel(log.oldValues.startUTC, viewTimezone),
        to: formatDateLabel(log.newValues.startUTC, viewTimezone),
      });
    }

    if (
      log.oldValues?.endUTC &&
      log.newValues?.endUTC &&
      log.oldValues?.endUTC !== log.newValues?.endUTC
    ) {
      changes.push({
        label: "End",
        from: formatDateLabel(log.oldValues.endUTC, viewTimezone),
        to: formatDateLabel(log.newValues.endUTC, viewTimezone),
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
      return <p className="text-secondary">Start date/time updated.</p>;
    }

    return (
      <div className="log-diffs">
        {changes.map((change) => (
          <div key={change.label} className="log-diff-row">
            <strong>{change.label}:</strong>
            <div className="log-diff-values">
              <span className="tag">{change.from || "—"}</span>
              <span className="log-arrow">→</span>
              <span className="tag tag-green">{change.to || "—"}</span>
            </div>
          </div>
        ))}
      </div>
    );
  };

  if (!logsState.open) return null;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content modal-content-wide" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2>Event Update History</h2>
          <button className="modal-close" onClick={onClose}>
            ×
          </button>
        </div>
        <div className="modal-body">
          {logsState.loading ? (
            <div className="panel-loading">
              <LoadingSpinner />
            </div>
          ) : logsState.entries.length === 0 ? (
            <div className="empty-state">
              <p>No update history yet</p>
            </div>
          ) : (
            <div className="logs-list">
              {logsState.entries.map((item, index) => (
                <div key={index} className="log-card">
                  <div className="log-content">
                    <strong>{item.message || "Event updated"}</strong>
                    <p className="text-secondary">
                      {item.timestamp}{" "}
                      {item.changedBy?.name ? `· by ${item.changedBy.name}` : ""}
                    </p>
                    {renderLogDiff(item)}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default LogsModal;

