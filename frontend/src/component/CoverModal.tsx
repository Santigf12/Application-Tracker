import { Button, Form, Input, Modal, Space, notification } from 'antd';
import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useParams } from "react-router";
import { AppDispatch, RootState } from "../app/store";
import { saveCoverLetter } from '../features/applications/applicationsSlice';
import { getCoverLetterFile } from '../features/files/filesSlice';
import { getCoverLetterContent, reset } from '../features/tools/toolsSlice';


const CoverModal = ({ open, onClose, posting, company }: { open: boolean, onClose: () => void, posting: string, company: string }) => {
    const { id } = useParams();

    const dispatch = useDispatch<AppDispatch>();

    const [form] = Form.useForm();

    const { coverLetterContent, isLoading } = useSelector((state: RootState) => state.tools);
    const { isLoading: isLoadingFile } = useSelector((state: RootState) => state.files);
    const { coverletter, isLoading: isLoadingSave, isError: isErrorSave } = useSelector((state: RootState) => state.applications);

    console.log("CoverModal -> coverletter", coverletter)

    useEffect(() => {
        if (open) {
            form.setFieldsValue({ coverletter: coverletter.content, email: 'santiago.fuentes@ucalgary.ca' });
        }
    }, [open, form, coverletter]);

    // useEffect(() => {
    //     if (isSuccess && coverLetterContent) {
    //         form.setFieldsValue({ coverletter: coverLetterContent });
    //         notification.success({
    //             message: 'Success',
    //             description: 'Cover letter generated successfully!',
    //             placement: 'topLeft'
    //         });
    //     } else if (isError) {
    //         notification.error({
    //             message: 'Error',
    //             description: 'Failed to generate cover letter',
    //             placement: 'topLeft'
    //         });
    //     }
    // }, [coverLetterContent, isSuccess, isError]);

    const generateCoverLetter = async () => {
        // Generate cover letter logic here
        try {
            const result = await dispatch(getCoverLetterContent({ company, jobPosting: posting })).unwrap();
            form.setFieldsValue({ coverletter: result });
            notification.success({
                message: 'Success',
                description: 'Cover letter generated successfully!',
                placement: 'topLeft'
            });
        } catch (error) {
            console.error("Failed to generate cover letter: ", error);
            notification.error({
                message: 'Error',
                description: 'Failed to generate cover letter',
                placement: 'topLeft'
            });
        }
    }

    const handleFileDownload = async () => {
        try {
            const { email, coverletter: content } = form.getFieldsValue();
            const response = await dispatch(getCoverLetterFile({ id: id as string, email, company, content })).unwrap();

            // Once the file is successfully received, create the download link
            if (response) {
                const url = window.URL.createObjectURL(new Blob([response]));
                const link = document.createElement('a');
                link.href = url;
                link.setAttribute('download', `Cover_Letter_${company}.odt`);
                document.body.appendChild(link);
                link.click();
                link.remove();
            }
        } catch (error) {
            console.error("Failed to download cover letter: ", error);
            notification.error({
                message: 'Error',
                description: 'Failed to download cover letter',
                placement: 'topLeft'
            });
        }
    };

    const handleSaveCoverLetter = async () => {
        try {
            const { coverletter } = form.getFieldsValue();
            await dispatch(saveCoverLetter({ id: id as string, content: coverletter  })).unwrap();
            notification.success({
                message: 'Success',
                description: 'Cover letter saved successfully!',
                placement: 'topLeft'
            });
        } catch (error) {
            console.error("Failed to save cover letter: ", error);
            notification.error({
                message: 'Error',
                description: 'Failed to save cover letter',
                placement: 'topLeft'
            });
        } finally {
            dispatch(reset());
        }
    }

    const handleOnClose = () => {
        onClose();
        form.resetFields();
    }

    return (
        <Modal open={open} onCancel={handleOnClose} centered width={1000}
            footer={[
                <Button size="large" key="back" onClick={handleOnClose} color="default" variant="solid">
                    Close
                </Button>,
                <Button
                    size="large"
                    key="submit"
                    type="default"
                    color="green"
                    variant="outlined"
                    onClick={handleSaveCoverLetter}
                    loading={isLoadingSave}
                >
                    Save Cover Letter
                </Button>
            ]}
        >
            <Space size="middle" style={{ width: '100%', padding: '5px' }}>
                <Button
                    size="large"
                    type="primary"
                    onClick={generateCoverLetter}
                    disabled={coverletter.content !== ''}
                    loading={isLoading}
                >
                    Generate Cover Letter
                </Button>
                <Button
                    size="large"
                    type="default"
                    onClick={handleFileDownload}
                    loading={isLoadingFile}
                >
                    Download Cover Letter
                </Button>
            </Space>
            <Space size="middle" style={{ width: '100%', padding: '5px', marginTop: '10px' }}>
                <Form layout="vertical" style={{ width: '100%' }} variant="filled" size="middle" form={form}>
                    <Form.Item
                        name='email'
                        rules={[{ message: 'Please enter your email' }]}
                    >
                        <Input size="large" style={{ width: 930 }} placeholder="Please enter your email"/>
                    </Form.Item>
                    <Form.Item
                        name='coverletter'
                        rules={[{ message: 'Please enter a cover letter' }]}
                    >
                        <Input.TextArea
                            rows={10}
                            size="large"
                            style={{ width: 930 }}
                            placeholder="Please enter your cover letter"
                        />
                    </Form.Item>
                </Form>
            </Space>
        </Modal>
    )
}

export default CoverModal