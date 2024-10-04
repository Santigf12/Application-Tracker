import { configureStore } from "@reduxjs/toolkit";
import aplicationReducer from "../features/applications/applicationsSlice";
import memberReducer from "../features/members/memberSlice";
import surveyReducer from "../features/survey/surveySlice";

export const store = configureStore({
  reducer: {
    applications: aplicationReducer,
    members: memberReducer,
    surveys: surveyReducer,
  },
});
