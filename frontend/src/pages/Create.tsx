import { ProForm, ProFormSelect, ProFormText, ProFormTextArea } from '@ant-design/pro-components';
import { Card, Space, message } from 'antd';

const Create = () => {

    return (
        <div style={{ display: 'flex', flexDirection: 'column', height: 'calc(100vh - 125px)', justifyContent: 'center', alignItems: 'center' }} >
            <Card style={{ width: '60%', margin: 'auto', height: '100%',  }}>
                <Space direction='vertical' size='large' style={{ width: '100%',  }}>

                    <ProForm
                        layout='inline'
                        submitter={{
                            resetButtonProps: false,
                        }}
                        size='large'

                    >
                        <ProForm.Group>
                            <ProFormText
                                name="AutoFill"
                                label="AutoFill"
                                fieldProps={{
                                    style: { width: 885 }
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
                        onFinish={(values) => {
                            console.log(values);
                            message.success('AutoFill successful!');
                        }}
                        
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
                                name="posting"
                                label="Posting"
                                colSize={24}
                                placeholder="Job posting URL"
                                allowClear
                            />
                        </ProForm.Group>

                        <ProForm.Group>
                            <ProFormText
                                name="Location"
                                label="Location"
                                colProps={{ span: 12 }}
                                placeholder="Location"
                                allowClear
                                rules={[{ required: true, message: 'Location is required' }]}
                            />
                            <ProFormSelect
                                name="Length"
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
                                name="Description"
                                label="Description"
                                colSize={24}
                                fieldProps={{ 
                                    style: { flex: 1, height: '100%', resize: 'vertical' }
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