import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import fileService from './filesService';

const initialState = {
    file: null, // Store the file blob
    isLoading: false,
    isError: false,
};


// Thunk for fetching the cover letter file
export const getCoverLetterFile = createAsyncThunk(
    'files/getCoverLetterFile',
    async ({id, email, company, content }, thunkAPI) => {
        try {
            const fileBlob = await fileService.fetchCoverLetterFile(id, email, company, content);
            return fileBlob; // Return the blob for further processing
        } catch (error) {
            return thunkAPI.rejectWithValue('Error fetching file');
        }
    }
);

const filesSlice = createSlice({
    name: 'files',
    initialState,
    reducers: {
        resetFile: (state) => {
            state.file = null;
            state.error = null;
        },
    },
    extraReducers: (builder) => {
        builder
            .addCase(getCoverLetterFile.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(getCoverLetterFile.fulfilled, (state, action) => {
                state.loading = false;
                state.file = action.payload; // This will store the file blob
            })
            .addCase(getCoverLetterFile.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload;
            });
    },
});

export default filesSlice.reducer;
