import axios from "axios";

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || "http://localhost:5001/api",
});

export const fetchUsers = () => api.get("/users");
export const createUser = (payload) => api.post("/users", payload);

export const fetchEventsByUser = (userId) => api.get("/events", { params: { userId } });

export const createEvent = (payload) => api.post("/events", payload);

export const updateEvent = (eventId, payload) =>
  api.put(`/events/${eventId}`, payload);

export const fetchEventLogs = (eventId, userTimezone) =>
  api.get("/events/logs", { params: { eventId, userTimezone } });

export default api;

