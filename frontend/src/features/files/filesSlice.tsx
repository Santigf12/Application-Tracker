import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import fileService from './filesService';

export interface FilesState {
    file: Blob | null;
    isLoading: boolean;
    isError: any;
}

const initialState: FilesState = {
    file: null, // Store the file blob
    isLoading: false,
    isError: null,
};

// Thunk for fetching the cover letter file
export const getCoverLetterFile = createAsyncThunk<Blob, { id: string, email: string, company: string, content: string }, { rejectValue: string }>(
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
            state.isError = false;
        },
    },
    extraReducers: (builder) => {
        builder
            .addCase(getCoverLetterFile.pending, (state) => {
                state.isLoading = true;
                state.isError = null;
            })
            .addCase(getCoverLetterFile.fulfilled, (state, action) => {
                state.isLoading = false;
                state.file = action.payload ?? null;
            })
            .addCase(getCoverLetterFile.rejected, (state, action) => {
                state.isLoading = false;
                state.isError = action.payload ?? 'Error fetching file';
            });
    },
});

export const { resetFile } = filesSlice.actions;

export default filesSlice.reducer;
