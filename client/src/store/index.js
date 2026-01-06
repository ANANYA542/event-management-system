import { configureStore } from "@reduxjs/toolkit";
import eventReducer from "./eventSlice";

export const store = configureStore({
  reducer: {
    events: eventReducer,
  },
});


