'use client';

import {
  useCoverLetterTemplateFiles,
  useDeleteFile,
  useMergeFile,
  useOtherFiles,
  useResumeFiles,
  useUploadCoverLetterTemplate,
  useUploadOtherFile,
  useUploadResume,
} from '@/lib/features/files/hooks';
import type { UploadProps } from 'antd';
import { Button, Card, Flex, Space, Typography, Upload } from 'antd';
import { v4 as uuidv4 } from 'uuid';

export default function FilesPage() {
  const { data: resumeFiles = [], isLoading: isLoadingResumeFiles } = useResumeFiles();
  const { data: coverLetterTemplate = [], isLoading: isLoadingTemplateFiles } =
    useCoverLetterTemplateFiles();
  const { data: otherFiles = [], isLoading: isLoadingOtherFiles } = useOtherFiles();

  const uploadResumeMutation = useUploadResume();
  const uploadCoverLetterTemplateMutation = useUploadCoverLetterTemplate();
  const uploadOtherFileMutation = useUploadOtherFile();
  const deleteFileMutation = useDeleteFile();
  const mergeFileMutation = useMergeFile();

  const handleUploadResume: UploadProps['customRequest'] = async ({
    file,
    onSuccess,
    onError,
  }) => {
    try {
      const id = uuidv4();

      await uploadResumeMutation.mutateAsync({
        id,
        file: file as File,
      });

      onSuccess?.('Ok');
    } catch (error) {
      onError?.(error as Error);
    }
  };

  const handleUploadCoverLetterTemplate: UploadProps['customRequest'] = async ({
    file,
    onSuccess,
    onError,
  }) => {
    try {
      await uploadCoverLetterTemplateMutation.mutateAsync({
        file: file as File,
      });

      onSuccess?.('Ok');
    } catch (error) {
      onError?.(error as Error);
    }
  };

  const handleUploadOtherFiles: UploadProps['customRequest'] = async ({
    file,
    onSuccess,
    onError,
  }) => {
    try {
      const id = uuidv4();

      await uploadOtherFileMutation.mutateAsync({
        id,
        file: file as File,
      });

      onSuccess?.('Ok');
    } catch (error) {
      onError?.(error as Error);
    }
  };

  const handleMergeDownload = async () => {
    try {
      const response = await mergeFileMutation.mutateAsync({
        coverletter: false,
      });

      const url = window.URL.createObjectURL(new Blob([response]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', 'Merged.pdf');
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Failed to download merged document:', error);
    }
  };

  const handleDeleteFile = async (uid: string) => {
    try {
      await deleteFileMutation.mutateAsync(uid);
    } catch (error) {
      console.error('Failed to delete file:', error);
    }
  };

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        height: 'calc(100vh - 125px)',
        justifyContent: 'center',
        alignItems: 'center',
      }}
    >
      <Card style={{ width: '60%', margin: 'auto', height: '100%' }}>
        <Space orientation="vertical" size="large" style={{ width: '100%' }}>
          <Typography.Title level={3}>
            Application Files - Resume, Cover Letter, etc.
          </Typography.Title>

          <Flex gap="small" wrap>
            <Button
              type="primary"
              onClick={handleMergeDownload}
              loading={mergeFileMutation.isPending}
            >
              Download Merged Document
            </Button>
          </Flex>

          <Typography.Title level={5}>
            Resume - only odt file format supported
          </Typography.Title>
          <Upload
            name="resume-file"
            customRequest={handleUploadResume}
            listType="picture"
            accept=".odt"
            showUploadList={{ showDownloadIcon: true }}
            fileList={resumeFiles}
            onRemove={async (file) => {
              await handleDeleteFile(file.uid);
            }}
            onDownload={(file) => {
              console.log('download file:', file);
            }}
          >
            <Button loading={uploadResumeMutation.isPending || isLoadingResumeFiles}>
              Click to Upload
            </Button>
          </Upload>

          <Typography.Title level={5}>
            Cover Letter Template - only odt file format supported
          </Typography.Title>
          <Upload
            name="cover-letter-template"
            listType="picture"
            accept=".odt"
            customRequest={handleUploadCoverLetterTemplate}
            fileList={coverLetterTemplate}
            showUploadList={{ showDownloadIcon: true }}
            onRemove={async (file) => {
              await handleDeleteFile(file.uid);
            }}
          >
            <Button
              loading={
                uploadCoverLetterTemplateMutation.isPending || isLoadingTemplateFiles
              }
            >
              Click to Upload
            </Button>
          </Upload>

          <Typography.Title level={5}>
            Other Files - pdf, docx, odt file formats supported
          </Typography.Title>
          <Upload
            name="other-files"
            listType="picture"
            accept=".pdf,.docx,.odt"
            customRequest={handleUploadOtherFiles}
            fileList={otherFiles}
            showUploadList={{ showDownloadIcon: true }}
            onRemove={async (file) => {
              await handleDeleteFile(file.uid);
            }}
          >
            <Button loading={uploadOtherFileMutation.isPending || isLoadingOtherFiles}>
              Click to Upload
            </Button>
          </Upload>
        </Space>
      </Card>
    </div>
  );
}