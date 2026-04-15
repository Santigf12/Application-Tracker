import { Button, Form, Input, Modal, Space, notification } from 'antd';
import { useEffect } from 'react';
import { useParams } from 'react-router';
import { useCoverLetter, useSaveCoverLetter } from '../features/applications/hooks';
import { useCoverLetterFile } from '../features/files/hooks';
import { useGenerateCoverLetter } from '../features/tools/hooks';

const CoverModal = ({ open, onClose, posting, company, position }: { open: boolean, onClose: () => void, posting: string, company: string, position: string; }) => {
  const { id = '' } = useParams();
  const [form] = Form.useForm();

  const { data: coverletter = '' } = useCoverLetter(id, !!id && open);
  const saveCoverLetterMutation = useSaveCoverLetter();
  const coverLetterFileMutation = useCoverLetterFile();
  const generateCoverLetterMutation = useGenerateCoverLetter();

  useEffect(() => {
    if (open) {
      form.setFieldsValue({
        coverletter,
        email: 'jobs@fuentes.it.com',
      });
    }
  }, [open, form, coverletter]);

  const generateCoverLetter = async () => {
    try {
      const result = await generateCoverLetterMutation.mutateAsync({
        company,
        position,
        jobPosting: posting,
      });

      form.setFieldsValue({ coverletter: result });

      notification.success({
        message: 'Success',
        description: 'Cover letter generated successfully!',
        placement: 'topLeft',
      });
    } catch (error) {
      console.error('Failed to generate cover letter:', error);
      notification.error({
        message: 'Error',
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

      if (response) {
        const url = window.URL.createObjectURL(new Blob([response]));
        const link = document.createElement('a');
        link.href = url;
        link.setAttribute('download', `Cover_Letter_${company}.odt`);
        document.body.appendChild(link);
        link.click();
        link.remove();
        window.URL.revokeObjectURL(url);
      }
    } catch (error) {
      console.error('Failed to download cover letter:', error);
      notification.error({
        message: 'Error',
        description: 'Failed to download cover letter',
        placement: 'topLeft',
      });
    }
  };

  const handleSaveCoverLetter = async () => {
    try {
      const { coverletter } = form.getFieldsValue();

      await saveCoverLetterMutation.mutateAsync({
        id,
        content: coverletter,
      });

      notification.success({
        message: 'Success',
        description: 'Cover letter saved successfully!',
        placement: 'topLeft',
      });
    } catch (error) {
      console.error('Failed to save cover letter:', error);
      notification.error({
        message: 'Error',
        description: 'Failed to save cover letter',
        placement: 'topLeft',
      });
    }
  };

  const handleOnClose = () => {
    onClose();
    form.resetFields();
  };

  const currentCoverLetterValue = Form.useWatch('coverletter', form);

  return (
    <Modal
      open={open}
      onCancel={handleOnClose}
      centered
      width={1000}
      footer={[
        <Button
          size="large"
          key="back"
          onClick={handleOnClose}
          color="default"
          variant="solid"
        >
          Close
        </Button>,
        <Button
          size="large"
          key="submit"
          type="default"
          color="green"
          variant="outlined"
          onClick={handleSaveCoverLetter}
          loading={saveCoverLetterMutation.isPending}
        >
          Save Cover Letter
        </Button>,
      ]}
    >
      <Space size="middle" style={{ width: '100%', padding: '5px' }}>
        <Button
          size="large"
          type="primary"
          onClick={generateCoverLetter}
          disabled={!!coverletter || !!currentCoverLetterValue}
          loading={generateCoverLetterMutation.isPending}
        >
          Generate Cover Letter
        </Button>
        <Button
          size="large"
          type="default"
          onClick={handleFileDownload}
          loading={coverLetterFileMutation.isPending}
        >
          Download Cover Letter
        </Button>
      </Space>

      <Space size="middle" style={{ width: '100%', padding: '5px', marginTop: '10px' }}>
        <Form
          layout="vertical"
          style={{ width: '100%' }}
          variant="filled"
          size="middle"
          form={form}
        >
          <Form.Item
            name="email"
            rules={[{ message: 'Please enter your email' }]}
          >
            <Input
              size="large"
              style={{ width: 930 }}
              placeholder="Please enter your email"
            />
          </Form.Item>

          <Form.Item
            name="coverletter"
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
  );
};

export default CoverModal;