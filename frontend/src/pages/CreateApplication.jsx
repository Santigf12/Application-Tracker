import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { Container, Form, Header, Segment } from "semantic-ui-react";
import { createApplication } from "../features/applications/applicationsSlice";
import { getJobPostingContent } from "../features/tools/toolsSlice";

const CreateApplication = () => {
    const dispatch = useDispatch();
    const navigate = useNavigate();

    const {isLoading } = useSelector((state) => state.applications);
    const { jobPostingContent, isLoading: isLoadingJobPosting, isError: isErrorJobPosting } = useSelector((state) => state.tools);
    const [application, setApplication] = useState({
        title: "",
        company: "",
        location: "",
        length: "",
        posting: "",
        url: ""
    });
    const [autoFillUrl, setAutoFillUrl] = useState("");

    useEffect(() => {
        if (jobPostingContent) {
            setApplication({
                title: jobPostingContent.title,
                company: jobPostingContent.company,
                location: jobPostingContent.location,
                length: jobPostingContent.length,
                url: autoFillUrl
            });
        }
    }, [jobPostingContent, autoFillUrl]);
    
    const onSubmit = async (e) => {

        try {
            await dispatch(createApplication(application)).unwrap();
            toast.success("Application created successfully!");
            setTimeout(() => {
                navigate('/');
            }, 750);
        } catch (error) {
            console.error(error);
            toast.error("Failed to create application");
        } finally {
            setApplication({
                title: "",
                company: "",
                location: "",
                length: "",
                posting: "",
                url: ""
            });
        }
    }

    const autoFill = async () => {

        try {
            await dispatch(getJobPostingContent(autoFillUrl)).unwrap();
            console.log(jobPostingContent);
            toast.success("Job posting auto-filled successfully!");
        } catch (error) {
            console.error(error);
            toast.error("Failed to auto-fill job posting");
        } 
    }

    return (
        <Container style={{ marginTop: '7em', minWidth: '70%' }}>
            <Segment basic>
                <Header textAlign="center" as='h1'>Add Application</Header>
                <Segment>
                    <Header as='h3'>Auto Fill with URL</Header>
                    <Form size="large" onSubmit={autoFill} loading={isLoadingJobPosting}>
                        <Form.Group widths='2'>
                            <Form.Input fluid  
                                placeholder='Posting URL' 
                                required 
                                value={autoFillUrl}
                                onChange={(e) => setAutoFillUrl(e.target.value)}
                                />
                            <Form.Button fluid floated="right" size="large" color='blue'>Auto Fill</Form.Button>
                        </Form.Group>
                    </Form>
                </Segment>
                <Segment>
                    <Form size="large" onSubmit={onSubmit} loading={isLoading}>
                        <Form.Group widths='equal'>
                            <Form.Input 
                                fluid 
                                label='Job Title' 
                                placeholder='Job Title' 
                                required 
                                value={application.title}
                                onChange={(e) => setApplication({ ...application, title: e.target.value })}
                            />
                            <Form.Input 
                                fluid 
                                label='Company' 
                                placeholder='Company' 
                                required 
                                value={application.company}
                                onChange={(e) => setApplication({ ...application, company: e.target.value })}
                            />
                        </Form.Group>
                        <Form.Group widths='equal'>
                            <Form.Input 
                                fluid
                                label='Posting URL'
                                placeholder='Posting URL'
                                value={application.url}
                                onChange={(e) => setApplication({ ...application, url: e.target.value })}
                            />
                        </Form.Group>
                        <Form.Group widths='equal'>
                            <Form.Input 
                                fluid 
                                label='Location' 
                                placeholder='Location' 
                                required 
                                value={application.location}
                                onChange={(e) => setApplication({ ...application, location: e.target.value })}
                            />
                            <Form.Input 
                                fluid 
                                label='Length' 
                                placeholder='Length' 
                                required 
                                value={application.length}
                                onChange={(e) => setApplication({ ...application, length: e.target.value })}
                            />
                        </Form.Group>
                        <Form.Group widths='equal'>
                            <Form.TextArea 
                                label='Job description' 
                                placeholder='Add a description of the job' 
                                required 
                                value={application.posting}
                                onChange={(e) => setApplication({ ...application, posting: e.target.value })}
                            />
                        </Form.Group>
                        <Form.Button size="large" fluid color='blue'>Submit</Form.Button>
                    </Form>
                </Segment>
            </Segment>

        </Container>
    );
}

export default CreateApplication;