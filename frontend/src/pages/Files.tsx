import { Button, Card, Flex, Space, Typography, Upload, UploadProps } from 'antd';
import { useEffect } from 'react';
import { useDispatch, useSelector } from "react-redux";
import { v4 as uuidv4 } from 'uuid';
import { AppDispatch, RootState } from "../app/store";
import {
    deleteFile, getCoverLetterTemplate,
    getMergeFile,
    getOtherFiles,
    getResumeFiles, uploadCoverLetterTemplate,
    uploadOtherFiles,
    uploadResume
} from '../features/files/filesSlice';

const Files = () => {
    const dispatch = useDispatch<AppDispatch>();

    const { resumeFiles, coverLetterTemplate, otherFiles, isLoadingMerge } = useSelector((state: RootState) => state.files);

    useEffect(() => {
        dispatch(getResumeFiles());
    }, [dispatch]);

    useEffect(() => {
        dispatch(getCoverLetterTemplate());
    }, [dispatch]);

    useEffect(() => {
        dispatch(getOtherFiles());
    }, [dispatch]);

    const handleUploadResume: UploadProps['customRequest'] = async ({ file, onSuccess, onError }) => {
        
        try {
            const id = uuidv4()

            await dispatch(uploadResume({ id: id as string, file: file as File })).unwrap()

            if (onSuccess) {
                onSuccess('Ok');
            }
        } catch (error) {
            if (onError) {
                onError(error as Error);
            }
        }
    }

    const handleUploadCoverLetterTemplate: UploadProps['customRequest'] = async ({ file, onSuccess, onError }) => {
        try {
            await dispatch(uploadCoverLetterTemplate({ file: file as File })).unwrap()

            if (onSuccess) {
                onSuccess('Ok');
            }
        } catch (error) {
            if (onError) {
                onError(error as Error);
            }
        }
    }

    const handleUploadOtherFiles: UploadProps['customRequest'] = async ({ file, onSuccess, onError }) => {
        try {
            const id = uuidv4()
            await dispatch(uploadOtherFiles({ id: id as string, file: file as File })).unwrap()

            if (onSuccess) {
                onSuccess('Ok');
            }
        } catch (error) {
            if (onError) {
                onError(error as Error);
            }
        }
    }

    const handleMergeDownload = async () => {
        const coverletter = false;
        try {
            const response = await dispatch(getMergeFile({ coverletter })).unwrap();
            const url = window.URL.createObjectURL(new Blob([response]));
            const link = document.createElement('a');
            link.href = url;
            link.setAttribute('download', `Merged.pdf`);
            document.body.appendChild(link);
            link.click();
            link.remove();
        } catch (error) {
            console.error("Failed to download merged document: ", error);
        }
    }

    return (
        <div style={{ display: 'flex', flexDirection: 'column', height: 'calc(100vh - 125px)', justifyContent: 'center', alignItems: 'center' }} >
            <Card style={{ width: '60%', margin: 'auto', height: '100%', }}>
                <Space direction='vertical' size='large' style={{ width: '100%', }}>
                    <Typography.Title level={3}>Application Files - Resume, Cover Letter, etc.</Typography.Title>
                    <Flex gap="small" wrap>
                        <Button type='primary' onClick={handleMergeDownload} loading={isLoadingMerge}>Download Merged Document</Button>
                    </Flex>
                    <Typography.Title level={5}>Resume - only odt file format supported</Typography.Title>
                    <Upload
                        name="resume-file"                         // must match multer.single('resume-file')
                        customRequest={handleUploadResume}
                        listType='picture'
                        accept=".odt"
                        showUploadList={{ showDownloadIcon: true }}
                        fileList={resumeFiles}
                        onRemove={async (file) => {
                            await dispatch(deleteFile(file.uid));
                        }}
                        onDownload={
                            (file) => {
                                console.log('download file:', file);
                            }
                        }
                    >
                        <Button>Click to Upload</Button>
                    </Upload>
                    <Typography.Title level={5}>Cover Letter Template - only odt file format supported</Typography.Title>
                    <Upload
                        name='cover-letter-template'
                        listType='picture'
                        accept=".odt"
                        customRequest={handleUploadCoverLetterTemplate}
                        fileList={coverLetterTemplate}
                        showUploadList={{ showDownloadIcon: true }}
                        onRemove={async (file) => {
                            await dispatch(deleteFile(file.uid));
                        }}
                    >
                        <Button>Click to Upload</Button>
                    </Upload>
                    <Typography.Title level={5}>Other Files - pdf, docx, odt file formats supported</Typography.Title>
                    <Upload
                        name='other-files'
                        listType='picture'
                        accept=".pdf,.docx,.odt"
                        customRequest={handleUploadOtherFiles}
                        fileList={otherFiles}
                        showUploadList={{ showDownloadIcon: true }}
                        onRemove={async (file) => {
                            await dispatch(deleteFile(file.uid));
                        }}
                    >
                        <Button>Click to Upload</Button>
                    </Upload>
                </Space>
            </Card>
        </div>
    )
}


export default Files;