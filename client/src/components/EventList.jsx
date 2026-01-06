import EventCard from "./EventCard";
import { LoadingSpinner } from "./Icons";
import "../styles/EventList.css";

const EventList = ({ events, loading, viewTimezone, users, onEdit, onViewLogs }) => {
  if (loading) {
    return (
      <div className="panel-loading">
        <LoadingSpinner />
      </div>
    );
  }

  if (!events.length) {
    return (
      <div className="empty-state">
        <p>No events found</p>
      </div>
    );
  }

  return (
    <div className="events-list">
      {events.map((event) => (
        <EventCard
          key={event._id}
          event={event}
          viewTimezone={viewTimezone}
          users={users}
          onEdit={onEdit}
          onViewLogs={onViewLogs}
        />
      ))}
    </div>
  );
};

export default EventList;

