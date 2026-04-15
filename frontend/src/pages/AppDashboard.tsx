
import { ProDescriptions } from '@ant-design/pro-components';
import { Button, Card, Col, Form, message, notification, Popconfirm, Row, Space, Typography } from 'antd';
import { DateTime } from 'luxon';
import { useState } from 'react';
import { Link, useNavigate, useParams, useSearchParams } from 'react-router';
import CoverModal from '../component/CoverModal';
import { useApplication, useCoverLetter, useDeleteApplication, useUpdateApplication, } from '../features/applications/hooks';
import { Application } from '../features/applications/types';
import { useMergeFile } from '../features/files/hooks';

const AppDashboard = () => {
  const { id = '' } = useParams();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [form] = Form.useForm();

  const page = searchParams.get('page') || '1';
  const [modalOpen, setModalOpen] = useState<boolean>(false);

  const { data: application, isLoading: isLoadingApplication } = useApplication(id, !!id);
  const { data: coverletter = '' } = useCoverLetter(id, !!id);

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
      console.error('Failed to save changes:', error);
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
      navigate('/');
    } catch (error) {
      message.error('Failed to delete application', 1.5);
      console.error('Failed to delete application:', error);
    }
  };

  const handleMergeDownload = async (
    hasCoverLetter: boolean,
    email?: string,
    company?: string,
    content?: string
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
      console.error('Failed to download merged document:', error);
      notification.error({
        message: 'Error',
        description: 'Make sure you have a resume uploaded',
        placement: 'topLeft',
      });
    }
  };

  const handleButtonCopy = (link: string) => {
    navigator.clipboard.writeText(link);
    notification.success({
      message: 'Link copied to clipboard',
      placement: 'topLeft',
      duration: 1.0,
    });
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
    <Row gutter={[8, 0]}>
      <Col span={3}>
        <Card bordered style={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
          <Space direction="vertical" size="small" style={{ width: '100%', flex: 1 }}>
            <Typography.Title level={4}>Useful Links</Typography.Title>
            <Button
              block
              size="large"
              onClick={() => handleButtonCopy(currentApplication.url)}
            >
              Job Posting
            </Button>
            <Button
              block
              size="large"
              onClick={() =>
                handleButtonCopy('https://www.linkedin.com/in/santiago-f-b50079219/')
              }
            >
              LinkedIn
            </Button>
            <Button
              block
              size="large"
              onClick={() => handleButtonCopy('https://github.com/Santigf12')}
            >
              GitHub
            </Button>
            <Button
              block
              size="large"
              onClick={() => handleButtonCopy('https://www.fuentes.it.com/')}
            >
              Personal Website
            </Button>
            <Button
              block
              size="large"
              onClick={() => handleButtonCopy('mailto:santiago.fuentes@ucalgary.ca')}
            >
              School Email
            </Button>
            <Button
              block
              size="large"
              onClick={() => handleButtonCopy('mailto:santiago@fuentes.it.com')}
            >
              Personal Email
            </Button>
          </Space>
        </Card>
      </Col>

      <Col span={21}>
        <Card
          bordered
          style={{
            padding: 5,
            height: 75,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-evenly',
          }}
        >
          <Typography.Title level={2} style={{ margin: 0 }}>
            Application Dashboard
          </Typography.Title>
          <Typography.Title level={5} style={{ margin: 0, marginLeft: 85 }}>
            <Link to={`/?page=${page}`}>Back to Applications</Link>
          </Typography.Title>
        </Card>

        <Row justify="center" align="middle">
          <Col span={24}>
            <Card
              bordered
              style={{ minHeight: 50, width: '100%', marginTop: 10, textAlign: 'center' }}
            >
              <ProDescriptions<Application>
                column={4}
                loading={
                  isLoadingApplication ||
                  updateMutation.isPending ||
                  deleteMutation.isPending
                }
                dataSource={currentApplication}
                extra={
                  <div style={{ position: 'absolute', top: 25, left: 25 }}>
                    <Button
                      style={{ marginRight: 8 }}
                      color={currentApplication.coverletter ? 'green' : 'orange'}
                      variant="solid"
                      onClick={() => setModalOpen(true)}
                    >
                      {currentApplication.coverletter ? 'Edit' : 'Add'} Cover Letter
                    </Button>

                    <Button
                      style={{ marginRight: 8 }}
                      color="blue"
                      variant="solid"
                      loading={mergeFileMutation.isPending}
                      onClick={() =>
                        handleMergeDownload(
                          !!currentApplication.coverletter,
                          'jobs@fuentes.it.com',
                          currentApplication.company,
                          coverletter
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
                  </div>
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
                  fieldProps={{ placeholder: 'Application status' }}
                  valueType="select"
                />
                <ProDescriptions.Item label="Added" dataIndex="added" valueType="dateTime" />
                <ProDescriptions.Item
                  label="Applied"
                  dataIndex="applied"
                  valueType="dateTime"
                  fieldProps={{ placeholder: 'Date applied' }}
                />
                <ProDescriptions.Item
                  label="Posting URL"
                  dataIndex="url"
                  span={2}
                  valueType="text"
                  fieldProps={{ placeholder: 'Job posting URL' }}
                />
                <ProDescriptions.Item
                  label="Posting"
                  dataIndex="posting"
                  valueType="textarea"
                  span={4}
                  render={(_, row) => {
                    return (
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
                    );
                  }}
                  fieldProps={{
                    variant: 'borderless',
                    autoSize: { minRows: 5, maxRows: 24 },
                    placeholder: 'Enter the job posting here...',
                    style: { width: 'calc(100vw - 500px)' },
                  }}
                />
              </ProDescriptions>
            </Card>
          </Col>
        </Row>
      </Col>

      <CoverModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        posting={currentApplication.posting}
        company={currentApplication.company}
      />
    </Row>
  );
};

export default AppDashboard;