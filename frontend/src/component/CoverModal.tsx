import { Button, Form, Input, Modal, Space } from "antd"
import { useDispatch } from "react-redux"
import { useParams } from "react-router"
import { AppDispatch } from "../app/store"


const CoverModal = ({ open, onClose, posting, company } : { open: boolean, onClose: () => void, posting: string, company: string }) => {
    const { id } = useParams();

    const dispatch = useDispatch<AppDispatch>();


    return (
        <Modal open={open} onCancel={onClose} centered width={1000}
            footer={[
                <Button size="large" key="back" onClick={onClose} color="default" variant="solid">
                    Close
                </Button>,
                <Button size="large" key="submit" type="default" onClick={() => {}} color="green" variant="outlined">
                    Save Cover Letter
                </Button>
            ]}
        >
            <Space size="middle" style={{ width: '100%', padding: '5px' }}>
                <Button size="large" type="primary" onClick={() => {}}>
                    Generate Cover Letter
                </Button>
                <Button size="large" type="default" onClick={() => {}}>
                    Download Cover Letter
                </Button>
            </Space>
            <Space size="middle" style={{ width: '100%', padding: '5px', marginTop: '10px' }}>
                <Form layout="vertical" style={{ width: '100%' }} variant="filled" size="middle">
                    <Form.Item
                        name='email'
                        rules={[{ message: 'Please enter your email' }]}
                    >
                        <Input size="large" style={{ width: 930 }} placeholder="Please enter your email" />
                    </Form.Item>
                    <Form.Item
                        name='coverletter'
                        rules={[{ message: 'Please enter a cover letter' }]}
                    >
                        <Input.TextArea rows={10} size="large" style={{ width: 930 }} placeholder="Please enter your cover letter" />
                    </Form.Item>
                </Form>
            </Space>
        </Modal>
    )
}

export default CoverModal