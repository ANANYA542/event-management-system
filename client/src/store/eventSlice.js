import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import dayjs from "../lib/dayjs";
import {
  fetchUsers,
  fetchEventsByUser,
  createUser,
  createEvent,
  updateEvent,
  fetchEventLogs,
} from "../services/api";
import { DEFAULT_TIMEZONE } from "../constants/timezones";

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

const initialState = {
  users: [],
  loadingUsers: false,
  activeUserId: "",

  events: [],
  eventsLoading: false,

  viewTimezone: DEFAULT_TIMEZONE,

  logsState: {
    open: false,
    loading: false,
    entries: [],
    event: null,
  },

  defaults: buildDefaultTimes(DEFAULT_TIMEZONE),
};

export const loadUsers = createAsyncThunk("events/loadUsers", async () => {
  const { data } = await fetchUsers();
  return data;
});

export const loadEvents = createAsyncThunk(
  "events/loadEvents",
  async (userId) => {
    const { data } = await fetchEventsByUser(userId);
    return data;
  }
);

export const createProfile = createAsyncThunk(
  "events/createProfile",
  async (payload) => {
    const { data } = await createUser(payload);
    return data;
  }
);

export const createNewEvent = createAsyncThunk(
  "events/createNewEvent",
  async (payload, { getState, dispatch }) => {
    await createEvent(payload);
    const {
      events: { activeUserId },
    } = getState();
    if (activeUserId) {
      await dispatch(loadEvents(activeUserId));
    }
  }
);

export const updateExistingEvent = createAsyncThunk(
  "events/updateExistingEvent",
  async (payload, { getState, dispatch }) => {
    const { eventId, ...updatePayload } = payload;
    await updateEvent(eventId, updatePayload);
    const {
      events: { activeUserId },
    } = getState();
    if (activeUserId) {
      await dispatch(loadEvents(activeUserId));
    }
  }
);

export const openLogs = createAsyncThunk(
  "events/openLogs",
  async ({ eventId, userTimezone }) => {
    const { data } = await fetchEventLogs(eventId, userTimezone);
    return { eventId, entries: data };
  }
);

const eventSlice = createSlice({
  name: "events",
  initialState,
  reducers: {
    setActiveUserId(state, action) {
      state.activeUserId = action.payload;
    },
    setViewTimezone(state, action) {
      state.viewTimezone = action.payload;
    },
    closeLogs(state) {
      state.logsState = {
        open: false,
        loading: false,
        entries: [],
        event: null,
      };
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(loadUsers.pending, (state) => {
        state.loadingUsers = true;
      })
      .addCase(loadUsers.fulfilled, (state, action) => {
        state.loadingUsers = false;
        state.users = action.payload;
        if (action.payload.length > 0) {
          state.activeUserId = action.payload[0]._id;
          state.viewTimezone =
            action.payload[0].timezone || DEFAULT_TIMEZONE;
        }
      })
      .addCase(loadUsers.rejected, (state) => {
        state.loadingUsers = false;
      })
      .addCase(loadEvents.pending, (state) => {
        state.eventsLoading = true;
      })
      .addCase(loadEvents.fulfilled, (state, action) => {
        state.eventsLoading = false;
        state.events = action.payload;
      })
      .addCase(loadEvents.rejected, (state) => {
        state.eventsLoading = false;
      })
      .addCase(createProfile.fulfilled, (state, action) => {
        state.users = [action.payload, ...state.users];
        state.activeUserId = action.payload._id;
      })
      .addCase(openLogs.pending, (state, action) => {
        const eventId = action.meta.arg.eventId;
        state.logsState.open = true;
        state.logsState.loading = true;
        state.logsState.event =
          state.events.find((e) => e._id === eventId) || null;
      })
      .addCase(openLogs.fulfilled, (state, action) => {
        state.logsState.loading = false;
        state.logsState.entries = action.payload.entries;
      })
      .addCase(openLogs.rejected, (state) => {
        state.logsState.loading = false;
      });
  },
});

export const { setActiveUserId, setViewTimezone, closeLogs } =
  eventSlice.actions;

export default eventSlice.reducer;


