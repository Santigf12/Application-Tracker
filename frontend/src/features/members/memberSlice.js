import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import memberService from "./memberService";

const initialState = {
  allMembers: [],
  membersArr: [],
  applicant : {},
  consent: {},
  member: {},
  isError: false,
  isSuccess: false,
  isLoading: false,
  message: "",
};

// GET All Members
export const getAll = createAsyncThunk(
  "members/getAll",
  async (_, thunkAPI) => {
    try {
      return await memberService.getAll();
    } catch (error) {
      const message = error.response.data.message || error.message;
      return thunkAPI.rejectWithValue(message);
    }
  }
);

// GET All Members for a specific group
export const getMembers = createAsyncThunk(
  "members/getSpecificMembers",
  async (id, thunkAPI) => {
    try {
      return await memberService.getMembers(id);
    } catch (error) {
      const message = error.response.data.message || error.message;
      return thunkAPI.rejectWithValue(message);
    }
  }
);

// Get Application for a specific member
export const getApplication = createAsyncThunk(
  "members/getApplication",
  async (id, thunkAPI) => {
    try {
      return await memberService.getApplication(id);
    } catch (error) {
      const message = error.response.data.message || error.message;
      return thunkAPI.rejectWithValue(message);
    }
  }
);

//Get Consent for a specific member
export const getConsent = createAsyncThunk(
  "members/getConsent",
  async (id, thunkAPI) => {
    try {
      return await memberService.getConsent(id);
    } catch (error) {
      const message = error.response.data.message || error.message;
      return thunkAPI.rejectWithValue(message);
    }
  }
);

export const getMember = createAsyncThunk(
  "members/getMember",
  async (id, thunkAPI) => {
    try {
      return await memberService.getMember(id);
    } catch (error) {
      const message = error.response.data.message || error.message;
      return thunkAPI.rejectWithValue(message);
    }
  }
);

export const memberSlice = createSlice({
  name: "member",
  initialState,
  // this will delete everything in the traits array
  reducers: {
    reset: (state) => initialState,
  },
  extraReducers: (builder) => {
    builder

      //Get All members
      .addCase(getAll.pending, (state) => {
        state.isLoading = true;
        state.isError = false;
        state.isSuccess = false;
      })
      .addCase(getAll.fulfilled, (state, action) => {
        state.isLoading = false;
        state.isSuccess = true;
        state.isError = false;
        state.message = "";
        state.allMembers = action.payload;
      })
      .addCase(getAll.rejected, (state, action) => {
        state.isLoading = false;
        state.isSuccess = false;
        state.isError = true;
        // state.message = action.payload;
        state.message = "Rejected";
        console.log("action.payload", action.error);
        state.allMembers = [];
      })

      //Get All members for a specific group --- this is reserved for admin users
      .addCase(getMembers.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(getMembers.fulfilled, (state, action) => {
        state.isLoading = false;
        state.isSuccess = true;
        state.isError = false;
        state.message = "";
        state.membersArr = action.payload;
      })
      .addCase(getMembers.rejected, (state, action) => {
        state.isLoading = false;
        state.isSuccess = false;
        state.isError = true;
        state.message = action.payload;
        state.membersArr = [];
      })
      
      .addCase(getApplication.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(getApplication.fulfilled, (state, action) => {
        state.isLoading = false;
        state.isSuccess = true;
        state.applicant = action.payload;
      })
      .addCase(getApplication.rejected, (state, action) => {
        state.isLoading = false;
        state.isError = true;
        state.message = action.payload;
      })
      .addCase(getMember.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(getMember.fulfilled, (state, action) => {
        state.isLoading = false;
        state.isSuccess = true;
        state.member = action.payload;
      })
      .addCase(getMember.rejected, (state, action) => {
        state.isLoading = false;
        state.isError = true;
        state.message = action.payload;
      })
      .addCase(getConsent.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(getConsent.fulfilled, (state, action) => {
        state.isLoading = false;
        state.isSuccess = true;
        state.consent = action.payload;
      })
      .addCase(getConsent.rejected, (state, action) => {
        state.isLoading = false;
        state.isError = true;
        state.message = action.payload;
      });
  },
});

export const { reset } = memberSlice.actions;

export default memberSlice.reducer;
