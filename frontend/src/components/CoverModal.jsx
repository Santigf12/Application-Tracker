import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useParams } from 'react-router-dom';
import { toast } from 'react-toastify';
import { Button, Divider, Form, Modal, TextArea } from 'semantic-ui-react';
import { getApplicationById, saveCoverLetter } from '../features/applications/applicationsSlice';
import { getCoverLetterFile } from '../features/files/filesSlice';
import { getCoverLetterContent, reset } from '../features/tools/toolsSlice';

const CoverModal = ({open, onClose, posting, company  }) => {
    const dispatch = useDispatch();

    const { id } = useParams();

    const [formCover, setformCover] = useState('');
    const [email, setEmail] = useState('santiago.fuentes@ucalgary.ca');

    const { coverLetterContent, isLoading, isSuccess, isError } = useSelector((state) => state.tools);
    const { file, isLoading: isLoadingFile, isError: isErrorFile} = useSelector((state) => state.files);
    const { coverletter, isLoading: isLoadingSave, isError: isErrorSave } = useSelector((state) => state.applications);

    useEffect(() => {
        if (coverletter) {
            setformCover(coverletter);  // This will populate formCover from the Redux store
        }
    }, [coverletter]);

    useEffect(() => {
        if (coverletter !== formCover) {
            setformCover(coverletter);
        }
    }, [coverletter]);

    useEffect(() => {
        if (isSuccess && coverLetterContent) {
            setformCover(coverLetterContent);
            toast.success("Cover letter generated successfully!");
        } else if (isError) {
            toast.error("Failed to generate cover letter");
        }
    }, [coverLetterContent, isSuccess, isError]);

    const generateCoverLetter = async () => {
        // Generate cover letter logic here
        try {
            await dispatch(getCoverLetterContent({company, jobPosting: posting})).unwrap();
            toast.success("Cover letter generated successfully!");
        } catch (error) {
            console.error("Failed to generate cover letter: ", error);
            toast.error("Failed to generate cover letter");
        }
    }

    const handleFileDownload = async () => {
        try {
            const response = await dispatch(getCoverLetterFile({id, email, company, content: formCover})).unwrap();
    
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
    
            toast.success("Cover letter downloaded successfully!");
        } catch (error) {
            console.error("Failed to download cover letter: ", error);
            toast.error("Failed to download cover letter");
        }
    };
    

    const handleSaveCoverLetter = async () => {
        try {
            await dispatch(saveCoverLetter({id, content: formCover})).unwrap();
            toast.success("Cover letter saved successfully!");
            await dispatch(getApplicationById(id)).unwrap();
        } catch (error) {
            console.error("Failed to save cover letter: ", error);
            toast.error("Failed to save cover letter ");
        } finally {
            dispatch(reset());
        }
    }

    return (
        <Modal open={open} onClose={onClose} size="fullscreen">
            <Modal.Header>Generate Cover Letter</Modal.Header>
            <Modal.Content>
                <Button.Group size='large'>
                    <Button color="blue" onClick={generateCoverLetter} disabled={formCover !== ''} loading={isLoading}> Generate Cover Letter </Button>
                    <Button.Or />
                    <Button color="green" onClick={handleFileDownload} loading={isLoadingFile}> Download Cover Letter </Button>
                </Button.Group>
                <Divider />
                <Form size='large'>
                    <Form.Group widths="equal">
                        <Form.Input
                            label="Email"
                            placeholder="Email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            required
                        />
                    </Form.Group>
                    <TextArea
                        placeholder="Generated cover letter will appear here..."
                        value={formCover}
                        onChange={(e) => setformCover(e.target.value)}
                        style={{ minHeight: 300 }}
                    />
                </Form>
            </Modal.Content>
            <Modal.Actions>
                <Button color="black" onClick={onClose} size='large'>
                    Close
                </Button>
                <Button color="green" size='large' disabled={formCover === ''}  onClick={handleSaveCoverLetter} loading={isLoadingSave}>
                    Save Cover Letter
                </Button>
            </Modal.Actions>
        </Modal>
    );
};

export default CoverModal;
