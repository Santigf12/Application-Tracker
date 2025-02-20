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
            
            //add status to the application as 'Bookmarked'
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
    }

    const autoFill = async (url: string) => {
        try {
            await dispatch(getJobPostingContent(url)).unwrap();
            notification.success({
                message: 'Success',
                description: 'Application created successfully!',
                placement: 'topLeft'
            });
        } catch (error) {
            console.error(error);
            notification.error({
                message: 'Error',
                description: 'Failed to create application'
            });
        }
    }

    return (
        <div style={{ display: 'flex', flexDirection: 'column', height: 'calc(100vh - 125px)', justifyContent: 'center', alignItems: 'center' }} >
            <Card style={{ width: '60%', margin: 'auto', height: '100%', }}>
                <Space direction='vertical' size='large' style={{ width: '100%', }}>

                    <ProForm
                        layout='inline'
                        form={autoFillFrom}
                        submitter={{ resetButtonProps: false }}
                        size='large'
                        loading={isLoadingJobPosting}
                        onFinish={(values) => { autoFill(values.AutoFill) }}
                    >
                        <ProForm.Group>
                            <ProFormText
                                name="AutoFill"
                                label="AutoFill"
                                fieldProps={{
                                    style: { width: 850 }
                                }}
                                placeholder="Please enter the job posting URL..."
                                allowClear
                                rules={[
                                    { required: true, message: 'URL is required' },
                                    { type: 'url', message: 'Invalid URL format' },
                                    { min: 10, message: 'URL must be at least 10 characters' },
                                    { whitespace: true, message: 'URL cannot be empty spaces' }
                                ]}
                            />
                        </ProForm.Group>
                    </ProForm>
                    <div style={{ width: '100%', height: '1px', backgroundColor: '#d9d9d9', margin: 'auto' }}></div>

                    <ProForm
                        layout='vertical'
                        form={applicationForm}
                        submitter={{
                            resetButtonProps: false,
                        }}
                        grid={true}
                        rowProps={
                            {
                                gutter: [16, 16]
                            }
                        }
                        size='large'
                        onFinish={(values) => { onSubmit(values) }}
                        loading={isLoading}
                        initialValues={{}}
                    >
                        <ProForm.Group>
                            <ProFormText
                                name="title"
                                label="Title"
                                colProps={{ span: 12 }}
                                placeholder="Job title"
                                allowClear
                                rules={[{ required: true, message: 'Title is required' }]}
                            />
                            <ProFormText
                                name="company"
                                label="Company"
                                colProps={{ span: 12 }}
                                placeholder="Company name"
                                allowClear
                                rules={[{ required: true, message: 'Company is required' }]}
                            />
                        </ProForm.Group>
                        <ProForm.Group>
                            <ProFormText
                                name="url"
                                label="Posting URL"
                                colSize={24}
                                placeholder="Job posting URL"
                                allowClear
                            />
                        </ProForm.Group>

                        <ProForm.Group>
                            <ProFormText
                                name="location"
                                label="Location"
                                colProps={{ span: 12 }}
                                placeholder="Location"
                                allowClear
                                rules={[{ required: true, message: 'Location is required' }]}
                            />
                            <ProFormSelect
                                name="length"
                                label="Length"
                                colProps={{ span: 12 }}
                                placeholder="Length"
                                allowClear
                                options={[
                                    { key: '4 Months', text: '4 Months', value: '4 Months' },
                                    { key: '8 Months', text: '8 Months', value: '8 Months' },
                                    { key: '12 Months', text: '12 Months', value: '12 Months' },
                                    { key: '16 Months', text: '16 Months', value: '16 Months' }
                                ]}
                                rules={[{ required: true, message: 'Length is required' }]}
                            />
                        </ProForm.Group>
                        <ProForm.Group style={{ display: 'flex', flexDirection: 'column', flex: 1 }}>
                            <ProFormTextArea
                                name="posting"
                                label="Posting"
                                colSize={24}
                                fieldProps={{
                                    autoSize: { minRows: 9 }
                                }}
                                placeholder="Description"
                                allowClear
                            />
                        </ProForm.Group>
                    </ProForm>
                </Space>
            </Card>
        </div>
    )
}

export default Create