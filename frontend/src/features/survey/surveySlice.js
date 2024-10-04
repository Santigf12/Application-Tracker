import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import surveyService from "./surveyService";

const initialState = {
    applications: [],
    consent: [],
    preworkshop : [],
    postworkshop : [],
    followup : [],
    isError: false,
    isSuccess: false,
    isLoading: false,
    message: "",
};

// GET All Applications
export const postApplication = createAsyncThunk(
    "surveys/postApplication",
    async (data, thunkAPI) => {
        try {
            const response = await surveyService.postApplication(data);
            return response;
        } catch (error) {
            const message = error.response?.data || error.message || 'Error posting application.'
            return thunkAPI.rejectWithValue(message);
        }
    }
);

export const postConsent = createAsyncThunk(
    "surveys/postConsent",
    async (data, thunkAPI) => {
        try {
            const response = await surveyService.postConsent(data);
            return response;
        } catch (error) {
            const message = error.response?.data || error.message || 'Error posting consent.'
            return thunkAPI.rejectWithValue(message);
        }
    }
);

export const postPreworkshop = createAsyncThunk(
    "surveys/postPreworkshop",
    async (data, thunkAPI) => {
        try {
            const response = await surveyService.postPreworkshop(data);
            return response;
        } catch (error) {
            const message = error.response?.data || error.message || 'Error posting preworkshop.'
            return thunkAPI.rejectWithValue(message);
        }
    }
);

export const postPostworkshop = createAsyncThunk(
    "surveys/postPostworkshop",
    async (data, thunkAPI) => {
        try {
            const response = await surveyService.postPostworkshop(data);
            return response;
        } catch (error) {
            const message = error.response?.data || error.message || 'Error posting postworkshop.'
            return thunkAPI.rejectWithValue(message);
        }
    }
);

export const postFollowup = createAsyncThunk(
    "surveys/postFollowup",
    async (data, thunkAPI) => {
        try {
            const response = await surveyService.postFollowup(data);
            return response;
        } catch (error) {
            const message = error.response?.data || error.message || 'Error posting followup.'
            return thunkAPI.rejectWithValue(message);
        }
    }
);

export const surveySlice = createSlice({
    name: "surveys",
    initialState,
    reducers: {
        reset : (state) => initialState,
    },
    extraReducers: (builder) => {
        
        builder
            .addCase(postApplication.pending, (state) => {
                state.isLoading = true;
            })
            .addCase(postApplication.fulfilled, (state, { payload }) => {
                state.isLoading = false;
                state.isSuccess = true;
                state.applications.push(payload);
            })
            .addCase(postApplication.rejected, (state, { payload }) => {
                state.isLoading = false;
                state.isError = true;
                state.message = payload;
            })
            .addCase(postConsent.pending, (state, { payload }) => {
                state.isLoading = true;
            })
            .addCase(postConsent.fulfilled, (state, { payload }) => {
                state.isLoading = false;
                state.isSuccess = true;
                state.consent = payload;
            })
            .addCase(postConsent.rejected, (state, { payload }) => {
                state.isLoading = false;
                state.isError = true;
                state.message = payload;
            })
            .addCase(postPreworkshop.pending, (state) => {
                state.isLoading = true;
            })
            .addCase(postPreworkshop.fulfilled, (state, { payload }) => {
                state.isLoading = false;
                state.isSuccess = true;
                state.preworkshop = payload;
            })
            .addCase(postPreworkshop.rejected, (state, { payload }) => {
                state.isLoading = false;
                state.isError = true;
                state.message = payload;
            })
            .addCase(postPostworkshop.pending, (state) => {
                state.isLoading = true;
            })
            .addCase(postPostworkshop.fulfilled, (state, { payload }) => {
                state.isLoading = false;
                state.isSuccess = true;
                state.postworkshop = payload;
            })
            .addCase(postPostworkshop.rejected, (state, { payload }) => {
                state.isLoading = false;
                state.isError = true;
                state.message = payload;
            })
            .addCase(postFollowup.pending, (state) => {
                state.isLoading = true;
            })
            .addCase(postFollowup.fulfilled, (state, { payload }) => {
                state.isLoading = false;
                state.isSuccess = true;
                state.followup = payload;
            })
            .addCase(postFollowup.rejected, (state, { payload }) => {
                state.isLoading = false;
                state.isError = true;
                state.message = payload;
            });

    }
});

export const { reset } = surveySlice.actions;

export default surveySlice.reducer;