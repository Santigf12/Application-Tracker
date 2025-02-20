
import { ProDescriptions } from '@ant-design/pro-components';
import { Button, Card, Col, Form, message, notification, Popconfirm, Row, Space, Typography } from 'antd';
import { DateTime } from 'luxon';
import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Link, useNavigate, useParams, useSearchParams } from 'react-router';
import { AppDispatch, RootState } from "../app/store";
import CoverModal from '../component/CoverModal';
import { Application, deleteApplication, getApplicationById, getCoverLetter, updateApplication } from '../features/applications/applicationsSlice';
import { getMergeFile } from '../features/files/filesSlice';

const AppDashboard = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();

    const dispatch = useDispatch<AppDispatch>();

    const [form] = Form.useForm();

    const { application, coverletter, isLoading } = useSelector((state: RootState) => state.applications);

    const { isLoadingMerge } = useSelector((state: RootState) => state.files);

    const page = searchParams.get("page") || "1";

    const [modalOpen, setModalOpen] = useState<boolean>(false);

    useEffect(() => {
        dispatch(getApplicationById(id as string));
        dispatch(getCoverLetter(id as string));
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
        } catch (error: any) {
            message.error('Failed to save changes', 1.5);
            console.error("Failed to save changes: ", error);
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
        } catch (error: any) {
            message.error('Failed to delete application', 1.5);
            console.error("Failed to delete application: ", error);
        }
    }

    const handleMergeDownload = async (coverletter: boolean, email?: string, company?: string, content?: string) => {
        try {
            const response = await dispatch(getMergeFile({ coverletter, email, company, content })).unwrap();
            const url = window.URL.createObjectURL(new Blob([response]));
            const link = document.createElement('a');
            link.href = url;
            link.setAttribute('download', `Merged.pdf`);
            document.body.appendChild(link);
            link.click();
            link.remove();
        } catch (error: any) {
            console.error("Failed to download merged document: ", error);
            notification.error({
                message: 'Error',
                description: 'Make sure you have a resume and transcript uploaded',
                placement: 'topLeft'
            });
        }
    }

    const handleButtonCopy = (link: string) => {
        //add link to clipboard
        navigator.clipboard.writeText(link); //note only works in secure contexts (https)
        notification.success({
            message: 'Link copied to clipboard',
            placement: 'topLeft',
            duration: 1.0
        });
    }

    return (
        <Row gutter={[8, 0]}>
            <Col span={3}>
                <Card bordered={true} style={{ height: '100%', display: "flex", flexDirection: "column" }}>
                    <Space direction="vertical" size="small" style={{ width: '100%', flex: 1 }}>
                        <Typography.Title level={4}>Useful Links</Typography.Title>
                        <Button block size='large' onClick={() => handleButtonCopy(application.url)}>Job Posting</Button>
                        <Button block size='large' onClick={() => handleButtonCopy('https://www.linkedin.com/in/santiago-f-b50079219/')}>LinkedIn</Button>
                        <Button block size='large' onClick={() => handleButtonCopy('https://github.com/Santigf12')}>GitHub</Button>
                        <Button block size='large' onClick={() => handleButtonCopy('https://www.fuentes.it.com/')} >Personal Website</Button>
                        <Button block size='large' onClick={() => handleButtonCopy('mailto:santiago.fuentes@ucalgary.ca')} >School Email</Button>
                        <Button block size='large' onClick={() => handleButtonCopy('mailto:santiago@fuentes.it.com')} >Personal Email</Button>
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
                                extra={
                                    <div style={{ position: "absolute", top: 25, left: 25 }}>
                                        <Button
                                            style={{ marginRight: 8 }} color={application.coverletter ? 'green' : 'orange'}
                                            variant='solid'
                                            onClick={() => setModalOpen(true)}
                                        >
                                            {application.coverletter ? "Edit" : "Add"} Cover Letter
                                        </Button>
                                        <Button
                                            style={{ marginRight: 8 }} color='blue' variant='solid'
                                            loading={isLoadingMerge}
                                            onClick={() => handleMergeDownload(application.coverletter ? true : false, 'santiago.fuentes@ucalgary.ca', application.company, coverletter)}
                                        >
                                            Download Application
                                        </Button>
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
                                        'Bookmarked': { text: 'Bookmarked', status: 'Default' },
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
            <CoverModal open={modalOpen} onClose={() => setModalOpen(false)} posting={application.posting} company={application.company} />
        </Row>
    );
}

export default AppDashboard;