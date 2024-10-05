import { configureStore } from "@reduxjs/toolkit";
import aplicationReducer from "../features/applications/applicationsSlice";
import filesReducer from "../features/files/filesSlice";
import toolsReducer from "../features/tools/toolsSlice";

export const store = configureStore({
  reducer: {
    applications: aplicationReducer,
    tools: toolsReducer,
    files: filesReducer,
  },
});
