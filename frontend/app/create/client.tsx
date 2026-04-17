'use client';

import { useCreateApplication } from '@/lib/features/applications/hooks';
import type { Application } from '@/lib/features/applications/types';
import { useScrapePosting } from '@/lib/features/tools/hooks';
import { ProForm, ProFormSelect, ProFormText, ProFormTextArea } from '@ant-design/pro-components';
import { App, Card, Space } from 'antd';
import { useRouter } from 'next/navigation';

export default function CreatePageClient() {
  const router = useRouter();
  const { notification } = App.useApp();

  const [autoFillForm] = ProForm.useForm();
  const [applicationForm] = ProForm.useForm();

  const createApplicationMutation = useCreateApplication();
  const scrapePostingMutation = useScrapePosting();

  const onSubmit = async (values: Application) => {
    try {
      const payload: Application = {
        ...values,
        status: 'Bookmarked',
      };

      await createApplicationMutation.mutateAsync(payload);

      notification.success({
        message: 'Success',
        description: 'Application created successfully!',
        placement: 'topLeft',
      });

      router.push('/');
    } catch (error) {
      console.error(error);
      notification.error({
        message: 'Error',
        description: 'Failed to create application',
        placement: 'topLeft',
      });
    } finally {
      applicationForm.resetFields();
      autoFillForm.resetFields();
    }
  };

  const autoFill = async (url: string) => {
    try {
      const result = await scrapePostingMutation.mutateAsync({ url });

      applicationForm.setFieldsValue({
        title: result.title || '',
        company: result.company || '',
        url: result.url || '',
        location: result.location || '',
        length: result.length || '',
        posting: result.posting || '',
      });

      notification.success({
        message: 'Success',
        description: 'Autofill completed!',
        placement: 'topLeft',
      });
    } catch (error) {
      console.error(error);
      notification.error({
        message: 'Error',
        description: 'Failed to fetch posting',
        placement: 'topLeft',
      });
    }
  };

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        minHeight: 'calc(100vh - 125px)',
        padding: 16,
      }}
    >
      <Card
        style={{
          width: '100%',
          maxWidth: 1040,
          margin: '0 auto',
        }}
        styles={{ body: { padding: 24 } }}
      >
        <Space orientation="vertical" size="large" style={{ width: '100%' }}>
          <ProForm
            layout="inline"
            form={autoFillForm}
            submitter={{ resetButtonProps: false }}
            size="large"
            loading={scrapePostingMutation.isPending}
            onFinish={(values) => autoFill(values.autoFill)}
            style={{ width: '100%' }}
          >
            <ProFormText
              name="autoFill"
              label="AutoFill"
              placeholder="Please enter the job posting URL..."
              allowClear
              formItemProps={{ style: { flex: 1, minWidth: 220 } }}
              fieldProps={{ style: { width: '100%' } }}
              rules={[
                { required: true, message: 'URL is required' },
                { type: 'url', message: 'Invalid URL format' },
                { min: 10, message: 'URL must be at least 10 characters' },
                { whitespace: true, message: 'URL cannot be empty spaces' },
              ]}
            />
          </ProForm>

          <div style={{ width: '100%', height: 1, backgroundColor: '#d9d9d9' }} />

          <ProForm
            layout="vertical"
            form={applicationForm}
            submitter={{ resetButtonProps: false }}
            grid
            rowProps={{ gutter: [16, 16] }}
            size="large"
            onFinish={(values) => onSubmit(values as Application)}
            loading={createApplicationMutation.isPending}
            initialValues={{}}
          >
            <ProFormText
              name="title"
              label="Title"
              placeholder="Job title"
              allowClear
              rules={[{ required: true, message: 'Title is required' }]}
              colProps={{ xs: 24, sm: 24, md: 12, lg: 12, xl: 12 }}
            />
            <ProFormText
              name="company"
              label="Company"
              placeholder="Company name"
              allowClear
              rules={[{ required: true, message: 'Company is required' }]}
              colProps={{ xs: 24, sm: 24, md: 12, lg: 12, xl: 12 }}
            />

            <ProFormText
              name="url"
              label="Posting URL"
              placeholder="Job posting URL"
              allowClear
              colProps={{ xs: 24 }}
            />

            <ProFormText
              name="location"
              label="Location"
              placeholder="Location"
              allowClear
              rules={[{ required: true, message: 'Location is required' }]}
              colProps={{ xs: 24, sm: 24, md: 12, lg: 12, xl: 12 }}
            />
            <ProFormSelect
              name="length"
              label="Length"
              placeholder="Length"
              allowClear
              options={[
                { key: '4 Months', text: '4 Months', value: '4 Months' },
                { key: '8 Months', text: '8 Months', value: '8 Months' },
                { key: '12 Months', text: '12 Months', value: '12 Months' },
                { key: '16 Months', text: '16 Months', value: '16 Months' },
              ]}
              colProps={{ xs: 24, sm: 24, md: 12, lg: 12, xl: 12 }}
            />

            <ProFormTextArea
              name="posting"
              label="Posting"
              placeholder="Description"
              allowClear
              fieldProps={{ autoSize: { minRows: 9, maxRows: 10 } }}
              colProps={{ xs: 24 }}
            />
          </ProForm>
        </Space>
      </Card>
    </div>
  );
}