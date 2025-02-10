
import { ProDescriptions } from '@ant-design/pro-components';
import { Button, Card, Col, Row, Space, Typography, message } from 'antd';
import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useParams } from 'react-router';
import { AppDispatch, RootState } from "../app/store";
import { Application, getApplicationById } from '../features/applications/applicationsSlice';

const AppDashboard = () => {
    const { id } = useParams();

    const dispatch = useDispatch<AppDispatch>();

    const { application, isLoading } = useSelector((state: RootState) => state.applications);

    const [formData, setFormData] = useState<Application>({} as Application);

    useEffect(() => {
        dispatch(getApplicationById(id as string));
    }, [id, dispatch]);

    useEffect(() => {
        if (application) {
            setFormData(application);
        }
    }, [application]);

    console.log(formData);

    const handleSave = async (key: React.Key | React.Key[], record: Application & { index?: number }, originRow: Application & { index?: number } ) => {
        console.log("Save triggered.")
        console.log("Key:", key);
        console.log("Record:", record);
        console.log("Origin Row:", originRow);
        // You can add your save logic here.
    };

    // Called by ProDescriptions when user clicks "Cancel"
    const handleCancel = async () => {
        // Revert to original application data from the store
        setFormData(application);
        message.info('Changes discarded', 1.5);
    };

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
                </Card>
                <Row justify="center" align="middle">
                    <Col span={24}>
                        <Card bordered={true} style={{ minHeight: 50, width: '100%', marginTop: 10, textAlign: "center" }}>
                            <ProDescriptions<Application>
                                column={4}
                                loading={isLoading}
                                dataSource={formData}
                                extra={<> <Button color={application.coverletter ? 'green' : 'orange'} variant='solid'>{application.coverletter ? "Edit" : "Add"} Cover Letter</Button> <Button color='red' variant='solid'>Delete</Button></>}
                                editable={{
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