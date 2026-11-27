'use client';

import {
  useDeleteFile,
  useOtherFiles,
  useUploadOtherFile,
} from '@/lib/features/files/hooks';
import type { UploadProps } from 'antd';
import { Button, Card, Space, Typography, Upload } from 'antd';
import { v4 as uuidv4 } from 'uuid';

export default function FilesPage() {
  const { data: otherFiles = [], isLoading: isLoadingOtherFiles } = useOtherFiles();

  const uploadOtherFileMutation = useUploadOtherFile();
  const deleteFileMutation = useDeleteFile();

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
          <Typography.Title level={3}>Attachments</Typography.Title>

          <Typography.Text type="secondary">
            Files here are included in your application package. Upload your
            transcript as a PDF with &quot;transcript&quot; in the file name.
          </Typography.Text>

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