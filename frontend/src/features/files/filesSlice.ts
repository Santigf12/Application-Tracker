import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import { UploadFile } from 'antd/lib';
import { UploadFileStatus } from 'antd/lib/upload/interface';
import fileService from './filesService';

export interface FilesState {
    coverletterfile: Blob | null;
    isLoading: boolean;
    isError: any;
    resumeFiles?: UploadFile[];
    coverLetterTemplate?: UploadFile[];
    otherFiles?: UploadFile[];
}

const initialState: FilesState = {
    coverletterfile: null, // Store the file blob
    isLoading: false,
    isError: null,
    resumeFiles: [],
    coverLetterTemplate: [],
    otherFiles: [],
};

// Thunk for fetching the cover letter file
export const getCoverLetterFile = createAsyncThunk<Blob, { id: string, email: string, company: string, content: string }, { rejectValue: string }>(
    'files/getCoverLetterFile',
    async ({id, email, company, content }, thunkAPI) => {
        try {
            const fileBlob = await fileService.fetchCoverLetterFile(id, email, company, content);
            return fileBlob; // Return the blob for further processing
        } catch (error : any) {
            return thunkAPI.rejectWithValue(error.response.data.message || error.message);
        }
    }
);


export const uploadResume = createAsyncThunk<{ uid: string, name: string, filePath: string, status: UploadFileStatus, type: string }, { id: string; file: File }, { rejectValue: string }>(
    'files/uploadResume',
    async ({ id, file }, thunkAPI) => {
        try {
            const response = await fileService.uploadResumeFile(id, file)
            return response;
        }
        catch (error : any) {
            return thunkAPI.rejectWithValue(error.response.data.message || error.message);
        }
    }
);

export const uploadCoverLetterTemplate = createAsyncThunk<{ uid: string, name: string, filePath: string, status: UploadFileStatus, type: string }, { file: File }, { rejectValue: string }>(
    'files/uploadCoverLetterTemplate',
    async ({ file }, thunkAPI) => {
        try {
            const response = await fileService.uploadCoverLetterTemplate(file)
            return response;
        }
        catch (error : any) {
            return thunkAPI.rejectWithValue(error.response.data.message || error.message);
        }
    }
);

export const getResumeFiles = createAsyncThunk<{ uid: string, name: string, filePath: string }[], void, { rejectValue: string }>(
    'files/getResumeFiles',
    async (_, thunkAPI) => {
        try {
            const response = await fileService.getResumeFiles();
            return response;
        }
        catch (error : any) {
            return thunkAPI.rejectWithValue(error.response.data.message || error.message);
        }
    }
);

export const deleteFile = createAsyncThunk<{ message: string, id: string }, string, { rejectValue: string }>(
    'files/deleteFile',
    async (id, thunkAPI) => {
        try {
            const response = await fileService.deleteFile(id);
            return response;
        } catch (error : any) {
            return thunkAPI.rejectWithValue(error.response.data.message || error.message);
        }
    }
);

export const getCoverLetterTemplate = createAsyncThunk<{ uid: string, name: string, filePath: string }[], void, { rejectValue: string }>(
    'files/getCoverLetterTemplate',
    async (_, thunkAPI) => {
        try {
            const response = await fileService.getCoverLetterTemplate();
            return response;
        } catch (error : any) {
            return thunkAPI.rejectWithValue(error.response.data.message || error.message);
        }
    }
);

export const uploadOtherFiles = createAsyncThunk<{ uid: string, name: string, filePath: string, status: UploadFileStatus, type: string }, { id: string; file: File }, { rejectValue: string }>(
    'files/uploadOtherFiles',
    async ({ id, file }, thunkAPI) => {
        try {
            const response = await fileService.uploadOtherFiles(id, file)
            return response;
        }
        catch (error : any) {
            return thunkAPI.rejectWithValue(error.response.data.message || error.message);
        }
    }
);

export const getOtherFiles = createAsyncThunk<{ uid: string, name: string, filePath: string }[], void, { rejectValue: string }>(
    'files/getOtherFiles',
    async (_, thunkAPI) => {
        try {
            const response = await fileService.getOtherFiles();
            return response;
        } catch (error : any) {
            return thunkAPI.rejectWithValue(error.response.data.message || error.message);
        }
    }
);

export const getMergeFile = createAsyncThunk<Blob, { coverletter: boolean, email?: string, company?: string, content?: string}, { rejectValue: string }>(
    'files/getMergeFile',
    async ({coverletter, email, company, content,  }, thunkAPI) => {
        try {
            const fileBlob = await fileService.fetchMergeFile(coverletter, email, company, content, );
            return fileBlob; // Return the blob for further processing
        } catch (error : any) {
            return thunkAPI.rejectWithValue(error.response.data.message || error.message);
        }
    }
);

const filesSlice = createSlice({
    name: 'files',
    initialState,
    reducers: {
        resetFile: (state) => {
            state.coverletterfile = null;
            state.isError = false;
        },
    },
    extraReducers: (builder) => {
        builder
            // Get cover letter file
            .addCase(getCoverLetterFile.pending, (state) => {
                state.isLoading = true;
                state.isError = null;
            })
            .addCase(getCoverLetterFile.fulfilled, (state, action) => {
                state.isLoading = false;
                state.coverletterfile = action.payload ?? null;
            })
            .addCase(getCoverLetterFile.rejected, (state, action) => {
                state.isLoading = false;
                state.isError = action.payload ?? 'Error fetching file';
            })
            
            // Upload resume
            .addCase(uploadResume.pending, (state) => {
                state.isLoading = true;
                state.isError = null;
            })
            .addCase(uploadResume.fulfilled, (state, action) => {
                state.isLoading = false;
                state.resumeFiles?.push(action.payload);
            })
            .addCase(uploadResume.rejected, (state, action) => {
                state.isLoading = false;
                state.isError = action.payload ?? 'Error uploading file';
            })
            // Upload cover letter template
            .addCase(uploadCoverLetterTemplate.pending, (state) => {
                state.isLoading = true;
                state.isError = null;
            })
            .addCase(uploadCoverLetterTemplate.fulfilled, (state, action) => {
                state.isLoading = false;
                state.coverLetterTemplate = [action.payload];
            })
            .addCase(uploadCoverLetterTemplate.rejected, (state, action) => {
                state.isLoading = false;
                state.isError = action.payload ?? 'Error uploading file';
            })
            // Get resume files
            .addCase(getResumeFiles.pending, (state) => {
                state.isLoading = true;
                state.isError = null;
            })
            .addCase(getResumeFiles.fulfilled, (state, action) => {
                state.isLoading = false;
                state.resumeFiles = action.payload;
            })

            .addCase(getResumeFiles.rejected, (state, action) => {
                state.isLoading = false;
                state.isError = action.payload ?? 'Error fetching files';
            })
            // Delete file
            .addCase(deleteFile.pending, (state) => {
                state.isLoading = true;
                state.isError = null;
            })
            .addCase(deleteFile.fulfilled, (state, action) => {
                state.isLoading = false;
                state.resumeFiles = state.resumeFiles?.filter(file => file.uid !== action.payload.id);
                state.coverLetterTemplate = state.coverLetterTemplate?.filter(file => file.uid !== action.payload.id);
                state.otherFiles = state.otherFiles?.filter(file => file.uid !== action.payload.id);
            })
            .addCase(deleteFile.rejected, (state, action) => {
                state.isLoading = false;
                state.isError = action.payload ?? 'Error deleting file';
            })

            // Get cover letter template
            .addCase(getCoverLetterTemplate.pending, (state) => {
                state.isLoading = true;
                state.isError = null;
            })
            .addCase(getCoverLetterTemplate.fulfilled, (state, action) => {
                state.isLoading = false;
                state.coverLetterTemplate = action.payload;
            })
            .addCase(getCoverLetterTemplate.rejected, (state, action) => {
                state.isLoading = false;
                state.isError = action.payload ?? 'Error fetching cover letter templates';
            })

            // Upload other files
            .addCase(uploadOtherFiles.pending, (state) => {
                state.isLoading = true;
                state.isError = null;
            })
            .addCase(uploadOtherFiles.fulfilled, (state, action) => {
                state.isLoading = false;
                state.otherFiles?.push(action.payload);
            })

            .addCase(uploadOtherFiles.rejected, (state, action) => {
                state.isLoading = false;
                state.isError = action.payload ?? 'Error uploading file';
            })
            // Get other files
            .addCase(getOtherFiles.pending, (state) => {
                state.isLoading = true;
                state.isError = null;
            })

            .addCase(getOtherFiles.fulfilled, (state, action) => {
                state.isLoading = false;
                state.otherFiles = action.payload;
            })

            .addCase(getOtherFiles.rejected, (state, action) => {
                state.isLoading = false;
                state.isError = action.payload ?? 'Error fetching files';
            })

            // Get merge file
            .addCase(getMergeFile.pending, (state) => {
                state.isLoading = true;
                state.isError = null;
            })
            .addCase(getMergeFile.fulfilled, (state) => {
                state.isLoading = false;
            })
            .addCase(getMergeFile.rejected, (state, action) => {
                state.isLoading = false;
                state.isError = action.payload ?? 'Error fetching file';
            });

    },
});

export const { resetFile } = filesSlice.actions;

export default filesSlice.reducer;
