'use client';

import {
  useApplication,
  useCoverLetter,
  useDeleteApplication,
  useUpdateApplication,
} from '@/lib/features/applications/hooks';
import type { Application } from '@/lib/features/applications/types';
import { useMergeFile } from '@/lib/features/files/hooks';
import { ProDescriptions } from '@ant-design/pro-components';
import { App, Button, Form, Popconfirm } from 'antd';
import { DateTime } from 'luxon';
import { useParams, useRouter } from 'next/navigation';

export default function ApplicationTabPage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const [form] = Form.useForm();

  const id = params?.id ?? '';

  const { data: application, isLoading: isLoadingApplication } = useApplication(id, !!id);
  const { data: coverletter = '' } = useCoverLetter(id, !!id);

  const { message, notification } = App.useApp();

  const updateMutation = useUpdateApplication();
  const deleteMutation = useDeleteApplication();
  const mergeFileMutation = useMergeFile();

  const handleSave = async (_: unknown, record: Application & { index?: number }) => {
    const now = DateTime.now().toFormat('yyyy-MM-dd HH:mm:ss');

    const updatedRecord: Application = {
      ...record,
      applied: record.status === 'Applied' ? now : record.applied,
    };

    try {
      await updateMutation.mutateAsync({
        id,
        application: updatedRecord,
      });
      message.success('Changes saved', 1.5);
    } catch (error) {
      message.error('Failed to save changes', 1.5);
    }
  };

  const handleCancel = async () => {
    if (application) {
      form.setFieldsValue(application);
    }
    message.info('Changes discarded', 1.5);
  };

  const onDelete = async () => {
    try {
      await deleteMutation.mutateAsync(id);
      message.success('Application deleted');
      router.push('/');
    } catch (error) {
      message.error('Failed to delete application', 1.5);
    }
  };

  const handleMergeDownload = async (
    hasCoverLetter: boolean,
    email?: string,
    company?: string,
    content?: string,
  ) => {
    try {
      const response = await mergeFileMutation.mutateAsync({
        coverletter: hasCoverLetter,
        email,
        company,
        content,
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
      notification.error({
        title: 'Error',
        description: 'Make sure you have a resume uploaded',
        placement: 'topLeft',
      });
    }
  };

  const currentApplication: Application = application ?? {
    id: '',
    title: '',
    company: '',
    location: '',
    posting: '',
    added: '',
    applied: '',
    coverletter: false,
    status: '',
    length: '',
    url: '',
  };

  return (
    <ProDescriptions<Application>
      column={4}
      loading={
        isLoadingApplication ||
        updateMutation.isPending ||
        deleteMutation.isPending
      }
      dataSource={currentApplication}
      extra={
        <>
          <Button
            
            color="blue"
            variant="solid"
            loading={mergeFileMutation.isPending}
            onClick={() =>
              handleMergeDownload(
                !!currentApplication.coverletter,
                'jobs@fuentes.it.com',
                currentApplication.company,
                coverletter,
              )
            }
          >
            Download Application
          </Button>

          <Popconfirm
            title="Are you sure you want to delete this application?"
            onConfirm={onDelete}
            okText="Yes"
            cancelText="No"
            placement="bottomLeft"
          >
            <Button color="red" variant="solid">
              Delete
            </Button>
          </Popconfirm>
        </>
      }
      editable={{
        form,
        onSave: handleSave,
        onCancel: handleCancel,
      }}
    >
      <ProDescriptions.Item
        label="Title"
        dataIndex="title"
        valueType="text"
        fieldProps={{ placeholder: 'Job title' }}
        formItemProps={{ rules: [{ required: true, message: 'Title is required' }] }}
      />
      <ProDescriptions.Item label="Company" dataIndex="company" />
      <ProDescriptions.Item label="Location" dataIndex="location" />
      <ProDescriptions.Item
        label="Status"
        dataIndex="status"
        valueEnum={{
          Bookmarked: { text: 'Bookmarked', status: 'Default' },
          Applied: { text: 'Applied', status: 'Processing' },
          Interview: { text: 'Interview', status: 'Warning' },
          Offer: { text: 'Offer', status: 'Success' },
          Rejected: { text: 'Rejected', status: 'Error' },
          Archived: { text: 'Archived', status: 'Default' },
        }}
        valueType="select"
      />
      <ProDescriptions.Item label="Added" dataIndex="added" valueType="dateTime" />
      <ProDescriptions.Item label="Applied" dataIndex="applied" valueType="dateTime" />
      <ProDescriptions.Item label="Posting URL" dataIndex="url" span={2} valueType="text" />
      <ProDescriptions.Item
        label="Posting"
        dataIndex="posting"
        valueType="textarea"
        span={4}
        render={(_, row) => (
          <div
            style={{
              maxHeight: 'calc(100vh - 400px)',
              overflowY: 'auto',
              textAlign: 'left',
              whiteSpace: 'pre-wrap',
            }}
          >
            {row?.posting}
          </div>
        )}
        fieldProps={{
          variant: 'borderless',
          autoSize: { minRows: 5, maxRows: 24 },
          placeholder: 'Enter the job posting here...',
          style: { width: 'calc(100vw - 500px)' },
        }}
      />
    </ProDescriptions>
  );
}