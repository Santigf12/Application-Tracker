import { ProForm, ProFormSelect, ProFormText, ProFormTextArea } from '@ant-design/pro-components';
import { Card, Space, notification } from 'antd';
import { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router';
import { AppDispatch, RootState } from "../app/store";
import { Application, createApplication } from "../features/applications/applicationsSlice";
import { getJobPostingContent, reset } from "../features/tools/toolsSlice";

const Create = () => {
  const dispatch = useDispatch<AppDispatch>();
  const navigate = useNavigate();

  const [autoFillFrom] = ProForm.useForm();
  const [applicationForm] = ProForm.useForm();

  const { isLoading } = useSelector((state: RootState) => state.applications);
  const { jobPostingContent, isLoading: isLoadingJobPosting } = useSelector((state: RootState) => state.tools);

  useEffect(() => {
    if (jobPostingContent) {
      applicationForm.setFieldsValue({
        title: jobPostingContent.title || '',
        company: jobPostingContent.company || '',
        url: jobPostingContent.url || '',
        location: jobPostingContent.location || '',
        length: jobPostingContent.length || '',
        posting: jobPostingContent.posting || '',
      });
    }
  }, [jobPostingContent, applicationForm]);

  const onSubmit = async (values: Application) => {
    try {
      values.status = 'Bookmarked';
      await dispatch(createApplication(values)).unwrap();
      notification.success({
        message: 'Success',
        description: 'Application created successfully!',
        placement: 'topLeft'
      });
      navigate('/');
    } catch (error) {
      console.error(error);
      notification.error({
        message: 'Error',
        description: 'Failed to create application'
      });
    } finally {
      applicationForm.resetFields();
      autoFillFrom.resetFields();
      dispatch(reset());
    }
  };

  const autoFill = async (url: string) => {
    try {
      await dispatch(getJobPostingContent(url)).unwrap();
      notification.success({
        message: 'Success',
        description: 'Autofill completed!',
        placement: 'topLeft'
      });
    } catch (error) {
      console.error(error);
      notification.error({
        message: 'Error',
        description: 'Failed to fetch posting'
      });
    }
  };

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        minHeight: 'calc(100vh - 125px)',
        padding: 16
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
        <Space direction="vertical" size="large" style={{ width: '100%' }}>
          {/* AutoFill row (responsive, input flexes) */}
          <ProForm
            layout="inline"
            form={autoFillFrom}
            submitter={{ resetButtonProps: false }}
            size="large"
            loading={isLoadingJobPosting}
            onFinish={(values) => autoFill(values.autoFill)}
            style={{ width: '100%' }}
          >
            <ProFormText
              name="autoFill"
              label="AutoFill"
              placeholder="Please enter the job posting URL..."
              allowClear
              // Make the form item flex and the input take full width
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

          {/* Main form */}
          <ProForm
            layout="vertical"
            form={applicationForm}
            submitter={{ resetButtonProps: false }}
            grid
            rowProps={{ gutter: [16, 16] }}
            size="large"
            onFinish={(values) => onSubmit(values)}
            loading={isLoading}
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
};

export default Create;