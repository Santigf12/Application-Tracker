'use client';

import { App, Button, Form, Input, Space } from 'antd';
import { useParams } from 'next/navigation';
import { useEffect } from 'react';

import {
  useApplication,
  useCoverLetter,
  useSaveCoverLetter,
} from '@/lib/features/applications/hooks';
import { useCoverLetterFile } from '@/lib/features/files/hooks';
import { useGenerateCoverLetter } from '@/lib/features/tools/hooks';

export default function CoverLetterTabPage() {
  const params = useParams<{ id: string }>();
  const id = params?.id ?? '';
  const [form] = Form.useForm();
  const { notification } = App.useApp();

  const { data: application } = useApplication(id, !!id);
  const { data: coverletter = '' } = useCoverLetter(id, !!id);
  const saveCoverLetterMutation = useSaveCoverLetter();
  const coverLetterFileMutation = useCoverLetterFile();
  const generateCoverLetterMutation = useGenerateCoverLetter();

  useEffect(() => {
    form.setFieldsValue({
      coverletter,
      email: 'jobs@fuentes.it.com',
    });
  }, [form, coverletter]);

  const company = application?.company ?? '';
  const position = application?.title ?? '';
  const posting = application?.posting ?? '';

  const generateCoverLetter = async () => {
    try {
      const result = await generateCoverLetterMutation.mutateAsync({
        company,
        position,
        jobPosting: posting,
      });

      form.setFieldsValue({ coverletter: result });

      notification.success({
        title: 'Success',
        description: 'Cover letter generated successfully!',
        placement: 'topLeft',
      });
    } catch (error) {
      notification.error({
        title: 'Error',
        description: 'Failed to generate cover letter',
        placement: 'topLeft',
      });
    }
  };

  const handleFileDownload = async () => {
    try {
      const { email, coverletter: content } = form.getFieldsValue();

      const response = await coverLetterFileMutation.mutateAsync({
        id,
        email,
        company,
        content,
      });

      const url = window.URL.createObjectURL(new Blob([response]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `Cover_Letter_${company}.odt`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
    } catch (error) {
      notification.error({
        title: 'Error',
        description: 'Failed to download cover letter',
        placement: 'topLeft',
      });
    }
  };

  const handleSaveCoverLetter = async () => {
    try {
      const { coverletter: content } = form.getFieldsValue();

      await saveCoverLetterMutation.mutateAsync({
        id,
        content,
      });

      notification.success({
        title: 'Success',
        description: 'Cover letter saved successfully!',
        placement: 'topLeft',
      });
    } catch (error) {
      notification.error({
        title: 'Error',
        description: 'Failed to save cover letter',
        placement: 'topLeft',
      });
    }
  };

  const currentCoverLetterValue = Form.useWatch('coverletter', form);

  return (
    <>
      <Space size="middle" style={{ width: '100%', padding: '5px', marginBottom: 12 }}>
        <Button
          type="primary"
          onClick={generateCoverLetter}
          disabled={!!coverletter || !!currentCoverLetterValue}
          loading={generateCoverLetterMutation.isPending}
        >
          Generate Cover Letter
        </Button>

        <Button
          onClick={handleSaveCoverLetter}
          loading={saveCoverLetterMutation.isPending}
        >
          Save Cover Letter
        </Button>

        <Button
          onClick={handleFileDownload}
          loading={coverLetterFileMutation.isPending}
        >
          Download Cover Letter
        </Button>
      </Space>

      <Form layout="vertical" style={{ width: '100%' }} variant="filled" size="middle" form={form}>
        <Form.Item name="email" rules={[{ message: 'Please enter your email' }]}>
          <Input size="large" placeholder="Please enter your email" />
        </Form.Item>

        <Form.Item name="coverletter" rules={[{ message: 'Please enter a cover letter' }]}>
          <Input.TextArea rows={18} size="large" placeholder="Please enter your cover letter" />
        </Form.Item>
      </Form>
    </>
  );
}