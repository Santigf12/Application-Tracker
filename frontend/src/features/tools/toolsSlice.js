import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import toolsService from "./toolsService";

const initialState = {
  coverLetterContent: "",
  jobPostingContent: [],
  isError: false,
  isSuccess: false,
  isLoading: false,
  message: "",
};

//Get Cover Letter Content
export const getCoverLetterContent = createAsyncThunk(
  "coverLetter/getCoverLetterContent",
  async ({company, jobPosting}, thunkAPI) => {
    try {
      return await toolsService.getCoverLetterContent(company, jobPosting);
    } catch (error) {
      const message = error.response.data.message || error.message;
      return thunkAPI.rejectWithValue(message);
    }
  }
);

//get job posting content from scraping
export const getJobPostingContent = createAsyncThunk(
  "coverLetter/getJobPostingContent",
  async (url, thunkAPI) => {
    try {
      return await toolsService.getJobPostingContent(url);
    } catch (error) {
      const message = error.response.data.message || error.message;
      return thunkAPI.rejectWithValue(message);
    }
  }
);


const coverLetterSlice = createSlice({
  name: "coverLetter",
  initialState,
  reducers: {
    resetCoverLetterContent: (state) => {
      state.coverLetterContent = "";
    },
  },
  extraReducers: (builder) => {
    builder
      //Get Cover Letter Content
      .addCase(getCoverLetterContent.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(getCoverLetterContent.fulfilled, (state, action) => {
        state.isLoading = false;
        state.isSuccess = true;
        state.isError = false;
        state.message = "";
        state.coverLetterContent = action.payload;
      })
      .addCase(getCoverLetterContent.rejected, (state, action) => {
        state.isLoading = false;
        state.isSuccess = false;
        state.isError = true;
        state.message = action.payload;
        state.coverLetterContent = "";
      })
      //Get Job Posting Content
      .addCase(getJobPostingContent.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(getJobPostingContent.fulfilled, (state, action) => {
        state.isLoading = false;
        state.isSuccess = true;
        state.isError = false;
        state.message = "";
        state.jobPostingContent = action.payload;
      })
      .addCase(getJobPostingContent.rejected, (state, action) => {
        state.isLoading = false;
        state.isSuccess = false;
        state.isError = true;
        state.message = action.payload;
        state.jobPostingContent = [];
      });
  }
});

export const { resetCoverLetterContent } = coverLetterSlice.actions;

export default coverLetterSlice.reducer;