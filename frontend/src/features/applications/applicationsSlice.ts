import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import axios from "axios";
import applicationService from "./applicationService";

export interface Application {
  id?: string;
  title: string;
  company: string;
  location: string;
  posting: string;
  added: string;
  applied: string;
  coverletter?: boolean;
  status: string;
  length: string;
}

export interface ApplicationState {
  applications: Application[];
  application: Application;
  coverletter: string;
  isError: boolean;
  isSuccess: boolean;
  isLoading: boolean;
  message: string;
}

const initialState: ApplicationState = {
  applications: [],
  application: {
    id: "",
    title: "",
    company: "",
    location: "",
    posting: "",
    added: "",
    applied: "",
    coverletter: false,
    status: "",
    length: "",
  },
  coverletter: "",
  isError: false,
  isSuccess: false,
  isLoading: false,
  message: "",
};


// GET All for the applications
export const getAllApplications = createAsyncThunk<Application[], void, { rejectValue: string }>(
  "applications/getAll",
  async (_, thunkAPI) => {
    try {
      return await applicationService.getAllApplications();
    } catch (error: unknown) {
      if (error instanceof Error) {
        return thunkAPI.rejectWithValue(error.message);
      }

      if (axios.isAxiosError(error)) {
        return thunkAPI.rejectWithValue(error.response?.data?.message ?? error.message);
      }

      return thunkAPI.rejectWithValue("An error occurred");
    }
  }
);

// GET application by ID
export const getApplicationById = createAsyncThunk<Application, string, { rejectValue: string }>(
  "applications/getById",
  async (id, thunkAPI) => {
    try {
      return await applicationService.getApplicationById(id);
    } catch (error: any) {
      const message = error.response.data.message || error.message;
      return thunkAPI.rejectWithValue(message);
    }
  }
);

//Post a new application
export const createApplication = createAsyncThunk<Application, Application, { rejectValue: string }>(
  "applications/create",
  async (application, thunkAPI) => {
    try {
      return await applicationService.createApplication(application);
    } catch (error: any) {
      const message = error.response.data.message || error.message;
      return thunkAPI.rejectWithValue(message);
    }
  }
);

//Put update an application
export const updateApplication = createAsyncThunk<Application, { id: string, application: Application }, { rejectValue: string }>(
  "applications/update",
  async ({ id, application }, thunkAPI) => {
    try {
      return await applicationService.updateApplication(id, application);
    } catch (error: any) {
      const message = error.response.data.message || error.message;
      return thunkAPI.rejectWithValue(message);
    }
  }
);

//Delete, delete an application
export const deleteApplication = createAsyncThunk<string, string, { rejectValue: string }>(
  "applications/delete",
  async (id, thunkAPI) => {
    try {
      return await applicationService.deleteApplication(id);
    } catch (error: any) {
      const message = error.response.data.message || error.message;
      return thunkAPI.rejectWithValue(message);
    }
  }
);

export const saveCoverLetter = createAsyncThunk<string, { id: string, content: string }, { rejectValue: string }>(
  "applications/saveCoverLetter",
  async ({ id, content }, thunkAPI) => {
    try {
      return await applicationService.saveCoverLetter(id, content);
    } catch (error: any) {
      const message = error.response?.data?.message || error.message;
      return thunkAPI.rejectWithValue(message);
    }
  }
);

export const getCoverLetter = createAsyncThunk<string, string, { rejectValue: string }>(
  "applications/getCoverLetter",
  async (id, thunkAPI) => {
    try {
      return await applicationService.getCoverLetter(id);
    } catch (error: any) {
      const message = error.response?.data?.message || error.message;
      return thunkAPI.rejectWithValue(message);
    }
  }
);


export const groupSlice = createSlice({
  name: "applications",
  initialState,
  // this will delete everything in the traits array
  reducers: {
    reset: () => initialState,
  },
  extraReducers: (builder) => {
    builder
      //Get All applications
      .addCase(getAllApplications.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(getAllApplications.fulfilled, (state, action) => {
        state.isLoading = false;
        state.isSuccess = true;
        state.isError = false;
        state.message = "";
        state.applications = action.payload;
      })
      .addCase(getAllApplications.rejected, (state, action) => {
        state.isLoading = false;
        state.isSuccess = false;
        state.isError = true;
        state.message = action.payload ?? "";
        state.applications = [];
      })
      //Create a new application
      .addCase(createApplication.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(createApplication.fulfilled, (state) => {
        state.isLoading = false;
        state.isSuccess = true;
        state.isError = false;
      })
      .addCase(createApplication.rejected, (state, action) => {
        state.isLoading = false;
        state.isSuccess = false;
        state.isError = true;
        state.message = action.payload ?? "";
      })
      //Get application by ID
      .addCase(getApplicationById.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(getApplicationById.fulfilled, (state, action) => {
        state.isLoading = false;
        state.isSuccess = true;
        state.isError = false;
        state.message = "";
        state.application = action.payload;
      })
      .addCase(getApplicationById.rejected, (state, action) => {
        state.isLoading = false;
        state.isSuccess = false;
        state.isError = true;
        state.message = action.payload ?? "";
        state.application = {
          id: "",
          title: "",
          company: "",
          location: "",
          posting: "",
          added: "",
          applied: "",
          coverletter: false,
          status: "",
          length: "",
        };
      })
      //Update an application
      .addCase(updateApplication.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(updateApplication.fulfilled, (state, action) => {
        state.isLoading = false;
        state.isSuccess = true;
        state.isError = false;
        state.application = action.payload;
      })
      .addCase(updateApplication.rejected, (state, action) => {
        state.isLoading = false;
        state.isSuccess = false;
        state.isError = true;
        state.message = action.payload ?? "";
      })
      //Delete an application
      .addCase(deleteApplication.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(deleteApplication.fulfilled, (state) => {
        state.isLoading = false;
        state.isSuccess = true;
        state.isError = false;
      })
      .addCase(deleteApplication.rejected, (state, action) => {
        state.isLoading = false;
        state.isSuccess = false;
        state.isError = true;
        state.message = action.payload ?? "";
      })
      //Save a cover letter
      .addCase(saveCoverLetter.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(saveCoverLetter.fulfilled, (state) => {
        state.isLoading = false;
        state.isSuccess = true;
        state.isError = false;
      })
      .addCase(saveCoverLetter.rejected, (state, action) => {
        state.isLoading = false;
        state.isSuccess = false;
        state.isError = true;
        state.message = action.payload ?? "";
      })
      //Get a cover letter
      .addCase(getCoverLetter.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(getCoverLetter.fulfilled, (state, action) => {
        state.isLoading = false;
        state.isSuccess = true;
        state.isError = false;
        state.message = "";
        state.coverletter = action.payload;
      })
      .addCase(getCoverLetter.rejected, (state, action) => {
        state.isLoading = false;
        state.isSuccess = false;
        state.isError = true;
        state.message = action.payload ?? "";
        state.coverletter = "";
      });
  },
});

export const { reset } = groupSlice.actions;

export default groupSlice.reducer;
