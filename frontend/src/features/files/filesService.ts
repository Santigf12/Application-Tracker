import { UploadFileStatus } from 'antd/lib/upload/interface';
import axios from 'axios';

let API_URL = "";
if (process.env.NODE_ENV !== "production") {
  API_URL = "http://localhost:5000/api/pdf/"; // lets us use the backend server in local development
}
else {
  API_URL = "/api/pdf/";
}

const fetchCoverLetterFile = async (id: string, email: string, company: string, content: string): Promise<Blob> => {
    const response = await axios.post(`${API_URL}/file-cover-letter`,
        {id, email, company, content }, 
        { responseType: 'blob' } // Important for downloading binary data like files
    );
    return response.data;
};

const uploadResumeFile = async (id: string, file: File, onProgress?: (percent: number) => void ): Promise<{ uid: string, name: string, filePath: string, status: UploadFileStatus, type: string }> => {
    // Build form data
    const formData = new FormData();
    // "resume-file" should match the Multer field name in router.post('/upload-resume', ...)
    formData.append('resume-file', file);

    const response = await axios.post(`${API_URL}upload-resume?id=${id}`, formData, {
        headers: {
        'Content-Type': 'multipart/form-data',
        },
        onUploadProgress: (progressEvent) => { 
            if (progressEvent.total) {
                const percentCompleted = Math.round((progressEvent.loaded * 100) / progressEvent.total);
                if (onProgress) {
                    onProgress(percentCompleted);
                }
            }
        },
    });

    return response.data; // e.g., { message: "...", filePath: "..." }
};

const uploadCoverLetterTemplate = async (file: File, onProgress?: (percent: number) => void): Promise<{ uid: string, name: string, filePath: string, status: UploadFileStatus, type: string }> => {
    // Build form data
    const formData = new FormData();
    // "resume-file" should match the Multer field name in router.post('/upload-resume', ...)
    formData.append('cover-letter-template', file);

    const response = await axios.post(`${API_URL}upload-cover-letter-template`, formData, {
        headers: {
        'Content-Type': 'multipart/form-data',
        },
        onUploadProgress: (progressEvent) => { 
            if (progressEvent.total) {
                const percentCompleted = Math.round((progressEvent.loaded * 100) / progressEvent.total);
                if (onProgress) {
                    onProgress(percentCompleted);
                }
            }
        },
    });

    return response.data; // e.g., { message: "...", filePath: "..." }
};

const getResumeFiles = async (): Promise<{ uid: string, name: string, filePath: string }[]> => {
    const response = await axios.get(`${API_URL}resume-files`);
    return response.data; // e.g., [{ fileName: "...", filePath: "..." }, ...]
};

const deleteFile = async (id: string): Promise<{ message: string, id: string }> => {
    const response = await axios.delete(`${API_URL}delete-file?id=${id}`);
    return response.data; // e.g., { message: "...", id: "..." }
};

const getCoverLetterTemplate = async (): Promise<{ uid: string, name: string, filePath: string }[]> => {
    const response = await axios.get(`${API_URL}cover-letter-template`);
    return response.data; // e.g., [{ fileName: "...", filePath: "..." }, ...]
};

const uploadOtherFiles = async (id: string, file: File, onProgress?: (percent: number) => void): Promise<{ uid: string, name: string, filePath: string, status: UploadFileStatus, type: string }> => {
    // Build form data
    const formData = new FormData();

    formData.append('other-files', file);

    const response = await axios.post(`${API_URL}upload-other-files?id=${id}`, formData, {
        headers: {
        'Content-Type': 'multipart/form-data',
        },
        onUploadProgress: (progressEvent) => { 
            if (progressEvent.total) {
                const percentCompleted = Math.round((progressEvent.loaded * 100) / progressEvent.total);
                if (onProgress) {
                    onProgress(percentCompleted);
                }
            }
        },
    });

    return response.data; // e.g., { message: "...", filePath: "..." }
};

const getOtherFiles = async (): Promise<{ uid: string, name: string, filePath: string }[]> => {
    const response = await axios.get(`${API_URL}other-files`);
    return response.data; // e.g., [{ fileName: "...", filePath: "..." }, ...]
}

const fetchMergeFile = async (coverletter: boolean, email?: string, company?: string, content?: string, ): Promise<Blob> => {
    const response = await axios.post(`${API_URL}merged`,
        {email, company, content, coverletter }, 
        { responseType: 'blob' } // Important for downloading binary data like files
    );
    return response.data;
}

const fileService = {
    fetchCoverLetterFile,
    uploadResumeFile,
    getResumeFiles,
    deleteFile,
    getCoverLetterTemplate,
    uploadCoverLetterTemplate,
    uploadOtherFiles,
    getOtherFiles,
    fetchMergeFile
};

export default fileService;
