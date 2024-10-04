import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import applicationService from "./applicationService";

const initialState = {
  applications: [],
  application: {},
  isError: false,
  isSuccess: false,
  isLoading: false,
  message: "",
};


// GET All for the applications
export const getAllApplications = createAsyncThunk(
  "applications/getAll",
  async (_, thunkAPI) => {
    try {
      return await applicationService.getAllApplications();
    } catch (error) {
      const message = error.response.data.message || error.message;
      return thunkAPI.rejectWithValue(message);
    }
  }
);

// GET application by ID
export const getApplicationById = createAsyncThunk(
  "applications/getById",
  async (id, thunkAPI) => {
    try {
      return await applicationService.getApplicationById(id);
    } catch (error) {
      const message = error.response.data.message || error.message;
      return thunkAPI.rejectWithValue(message);
    }
  }
);

//Post a new application
export const createApplication = createAsyncThunk(
  "applications/create",
  async (application, thunkAPI) => {
    try {
      return await applicationService.createApplication(application);
    } catch (error) {
      const message = error.response.data.message || error.message;
      return thunkAPI.rejectWithValue(message);
    }
  }
);

//Put update an application
export const updateApplication = createAsyncThunk(
  "applications/update",
  async ({ id, application }, thunkAPI) => {
    try {
      return await applicationService.updateApplication(id, application);
    } catch (error) {
      const message = error.response.data.message || error.message;
      return thunkAPI.rejectWithValue(message);
    }
  }
);

//Delete, delete an application
export const deleteApplication = createAsyncThunk(
  "applications/delete",
  async (id, thunkAPI) => {
    try {
      return await applicationService.deleteApplication(id);
    } catch (error) {
      const message = error.response.data.message || error.message;
      return thunkAPI.rejectWithValue(message);
    }
  }
);


export const groupSlice = createSlice({
  name: "applications",
  initialState,
  // this will delete everything in the traits array
  reducers: {
    reset: (state) => initialState,
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
        state.message = action.payload;
        state.applications = [];
      })
      //Create a new application
      .addCase(createApplication.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(createApplication.fulfilled, (state, action) => {
        state.isLoading = false;
        state.isSuccess = true;
        state.isError = false;
        state.message = action.payload.message;
      })
      .addCase(createApplication.rejected, (state, action) => {
        state.isLoading = false;
        state.isSuccess = false;
        state.isError = true;
        state.message = action.payload;
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
        state.message = action.payload;
        state.application = {};
      })
      //Update an application
      .addCase(updateApplication.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(updateApplication.fulfilled, (state, action) => {
        state.isLoading = false;
        state.isSuccess = true;
        state.isError = false;
        state.message = action.payload.message;
      })
      .addCase(updateApplication.rejected, (state, action) => {
        state.isLoading = false;
        state.isSuccess = false;
        state.isError = true;
        state.message = action.payload
      })
      //Delete an application
      .addCase(deleteApplication.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(deleteApplication.fulfilled, (state, action) => {
        state.isLoading = false;
        state.isSuccess = true;
        state.isError = false;
        state.message = action.payload.message;
      })
      .addCase(deleteApplication.rejected, (state, action) => {
        state.isLoading = false;
        state.isSuccess = false;
        state.isError = true;
        state.message = action.payload;
      });
      
  },
});

export const { reset } = groupSlice.actions;

export default groupSlice.reducer;
