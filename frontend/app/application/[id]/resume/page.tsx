'use client';

import { App, Button, Form, Switch } from 'antd';
import { useParams } from 'next/navigation';

export default function ResumeTabPage() {
  const params = useParams<{ id: string }>();
  const id = params?.id ?? '';
  const [form] = Form.useForm();
  const { notification } = App.useApp();

  const handleGenerateResume = async () => {
    try {
      const values = form.getFieldsValue();

      console.log('Generate tailored resume for application:', id, values);

      notification.success({
        message: 'Success',
        description: 'Resume generation started',
        placement: 'topLeft',
      });
    } catch (error) {
      notification.error({
        message: 'Error',
        description: 'Failed to generate resume',
        placement: 'topLeft',
      });
    }
  };

  return (
    <Form
      form={form}
      layout="vertical"
      initialValues={{
        include_publications: false,
      }}
    >
      <Form.Item
        name="include_publications"
        label="Include Publications"
        valuePropName="checked"
      >
        <Switch />
      </Form.Item>

      <Button type="primary" size="large" onClick={handleGenerateResume}>
        Generate Tailored Resume
      </Button>
    </Form>
  );
}