
import { ProDescriptions } from '@ant-design/pro-components';
import { Button, Card, Col, Form, message, Popconfirm, Row, Space, Typography } from 'antd';
import { DateTime } from 'luxon';
import { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Link, useNavigate, useParams, useSearchParams } from 'react-router';
import { AppDispatch, RootState } from "../app/store";
import { Application, deleteApplication, getApplicationById, updateApplication } from '../features/applications/applicationsSlice';

const AppDashboard = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();

    const dispatch = useDispatch<AppDispatch>();

    const [form] = Form.useForm();

    const { application, isLoading } = useSelector((state: RootState) => state.applications);
    const page = searchParams.get("page") || "1";

    useEffect(() => {
        dispatch(getApplicationById(id as string));
    }, [id, dispatch]);

    const handleSave = async (_: any, record: Application & { index?: number }) => {
        //set current date using luxon in format yyyy-mm-dd hh:mm:ss
        const now = DateTime.now().toFormat('yyyy-MM-dd HH:mm:ss');

        if (record.status === 'Applied') {
            record.applied = now;
        }

        try {
            await dispatch(updateApplication({ id: id as string, application: record })).unwrap();
            message.success('Changes saved', 1.5);
        } catch (error) {
            message.error('Failed to save changes', 1.5);
        }
    };

    // Called by ProDescriptions when user clicks "Cancel"
    const handleCancel = async () => {
        // Revert to original application data from the store
        form.setFieldsValue(application);
        message.info('Changes discarded', 1.5);
    };

    const onDelete = async () => {
        try {
            await dispatch(deleteApplication(id as string)).unwrap();
            message.success('Application deleted');
            navigate('/');
        } catch (error) {
            message.error('Failed to delete application', 1.5);
        }
    }

    return (
        <Row gutter={[8, 0]}>
            <Col span={3}>
                <Card bordered={true} style={{ height: '100%', display: "flex", flexDirection: "column" }}>
                    <Space direction="vertical" size="small" style={{ width: '100%', flex: 1 }}>
                        <Typography.Title level={4}>Useful Links</Typography.Title>
                        <Button block size='large' >Job Posting</Button>
                        <Button block size='large' >LinkedIn</Button>
                        <Button block size='large' >Github</Button>
                        <Button block size='large' >Portfolio</Button>
                        <Button block size='large' >School Email</Button>
                        <Button block size='large' >Personal Email</Button>
                    </Space>
                </Card>
            </Col>
            <Col span={21}>
                <Card bordered={true} style={{ padding: 5, height: 75, display: "flex", alignItems: "center", justifyContent: "space-evenly" }}>
                    <Typography.Title level={2} style={{ margin: 0 }}>Application Dashboard</Typography.Title>
                    <Typography.Title level={5} style={{ margin: 0, marginLeft: 85 }}><Link to={`/?page=${page}`}>Back to Applications</Link></Typography.Title>
                </Card>
                <Row justify="center" align="middle">
                    <Col span={24}>
                        <Card bordered={true} style={{ minHeight: 50, width: '100%', marginTop: 10, textAlign: "center" }}>
                            <ProDescriptions<Application>
                                column={4}
                                loading={isLoading}
                                dataSource={application}
                                extra={<div style={{ position: "absolute", top: 25, left: 25 }}> <Button style={{ marginRight: 8}} color={application.coverletter ? 'green' : 'orange'} variant='solid'>{application.coverletter ? "Edit" : "Add"} Cover Letter</Button>
                                    <Popconfirm title="Are you sure you want to delete this application?" onConfirm={onDelete} okText="Yes" cancelText="No" placement='bottomLeft'>
                                        <Button color='red' variant='solid'>Delete</Button>
                                    </Popconfirm>
                                </div>}
                                editable={{
                                    form: form,
                                    onSave: handleSave,
                                    onCancel: handleCancel,
                                }}
                            >
                                <ProDescriptions.Item label="Title" dataIndex="title" valueType='text' fieldProps={{ placeholder: "Job title" }} formItemProps={{ rules: [{ required: true, message: 'Title is required' }] }} />
                                <ProDescriptions.Item label="Company" dataIndex="company" />
                                <ProDescriptions.Item label="Location" dataIndex="location" />
                                <ProDescriptions.Item label="Status" dataIndex="status"
                                    valueEnum={{
                                        'Applied': { text: 'Applied', status: 'Processing' },
                                        'Interview': { text: 'Interview', status: 'Warning' },
                                        'Offer': { text: 'Offer', status: 'Success' },
                                        'Rejected': { text: 'Rejected', status: 'Error' },
                                        'Archived': { text: 'Archived', status: 'Default' },
                                    }}
                                    fieldProps={{ placeholder: "Application status" }}
                                    valueType='select'

                                />
                                <ProDescriptions.Item label="Added" dataIndex="added" valueType='dateTime' />
                                <ProDescriptions.Item label="Applied" dataIndex="applied" valueType='dateTime' fieldProps={{ placeholder: "Date applied" }} />
                                <ProDescriptions.Item label="Posting URL" dataIndex="url" span={2} valueType='text' fieldProps={{ placeholder: "Job posting URL" }} />
                                <ProDescriptions.Item
                                    label="Posting"
                                    dataIndex="posting"
                                    valueType='textarea'
                                    span={4}
                                    // Use a custom render to wrap the text in a scrollable container
                                    render={(_, row) => {
                                        return (
                                            <div
                                                style={{
                                                    maxHeight: 'calc(100vh - 400px)',   // or a fixed height, e.g. ''
                                                    overflowY: 'auto',
                                                    textAlign: 'left',
                                                    whiteSpace: 'pre-wrap',  // preserves line breaks
                                                }}
                                            >
                                                {row?.posting}
                                            </div>
                                        );
                                    }}
                                    fieldProps={{
                                        variant: 'borderless',
                                        autoSize: { minRows: 5, maxRows: 24 }, // Dynamic height adjustment
                                        placeholder: "Enter the job posting here...",
                                        style: { width: 'calc(100vw - 500px)' }, // Adjust the width
                                    }}
                                />
                            </ProDescriptions>

                        </Card>
                    </Col>
                </Row>
            </Col>
        </Row>
    );
}

export default AppDashboard;