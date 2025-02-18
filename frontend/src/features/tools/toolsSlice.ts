import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import toolsService from "./toolsService";

export interface JobPostingContent {
  title: string;
  company: string;
  location: string;
  length: string;
  posting: string;
  url: string;
}

export interface CoverLetterState {
  coverLetterContent: string;
  jobPostingContent: JobPostingContent;
  isError: boolean;
  isSuccess: boolean;
  isLoading: boolean;
  message: string;
}

const initialState = {
  coverLetterContent: "",
  jobPostingContent: {
    title: "",
    company: "",
    location: "",
    length: "",
    posting: "",
    url: "",
  },
  isError: false,
  isSuccess: false,
  isLoading: false,
  message: "",
};

//Get Cover Letter Content
export const getCoverLetterContent = createAsyncThunk(
  "coverLetter/getCoverLetterContent",
  async ({ company, jobPosting }: { company: string; jobPosting: string }, thunkAPI) => {
    try {
      return await toolsService.getCoverLetterContent(company, jobPosting);
    } catch (error: any) {
      const message = error.response.data.message || error.message;
      return thunkAPI.rejectWithValue(message);
    }
  }
);

//get job posting content from scraping
export const getJobPostingContent = createAsyncThunk(
  "coverLetter/getJobPostingContent",
  async ( url: string, thunkAPI) => {
    try {
      return await toolsService.getJobPostingContent(url);
    } catch (error: any) {
      const message = error.response.data.message || error.message;
      return thunkAPI.rejectWithValue(message);
    }
  }
);


const coverLetterSlice = createSlice({
  name: "coverLetter",
  initialState,
  reducers: {
    reset: () => initialState,
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
        state.message = action.payload as string;
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
        state.message = action.payload as string;
        state.jobPostingContent = {
          title: "",
          company: "",
          location: "",
          length: "",
          posting: "",
          url: "",
        }
      });
  }
});

export const { reset } = coverLetterSlice.actions;

export default coverLetterSlice.reducer;