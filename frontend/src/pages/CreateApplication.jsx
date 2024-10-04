import { useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { Container, Form, Header, Message, Segment } from "semantic-ui-react";
import { createApplication } from "../features/applications/applicationsSlice";

const CreateApplication = () => {
    const dispatch = useDispatch();
    const navigate = useNavigate();

    const {isLoading, isError, isSuccess, message } = useSelector((state) => state.applications);
    const [application, setApplication] = useState({
        title: "",
        company: "",
        location: "",
        length: "",
        posting: "",
        url: ""
    });
    
    const onSubmit = async (e) => {

        try {
            await dispatch(createApplication(application)).unwrap();
            setTimeout(() => {
                navigate('/');
            }, 750);
        } catch (error) {
            console.error(error);
        }
    }

    return (
        <Container style={{ marginTop: '7em', minWidth: '70%' }}>
            <Segment basic>
                <Header textAlign="center" as='h1'>Add Application</Header>
                <Segment>
                    <Header as='h3'>Auto Fill with URL</Header>
                    <Form size="large">
                        <Form.Group widths='2'>
                            <Form.Input fluid  placeholder='Posting URL' required />
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
                        {
                            isError && (
                                <Message negative>
                                    <Message.Header>Error</Message.Header>
                                    <p>{message}</p>
                                </Message>
                            )
                        }
                        {
                            isSuccess && (
                                <Message positive>
                                    <Message.Header>Success</Message.Header>
                                    <p>Job application created successfully</p>
                                </Message>
                            )
                        }
                        <Form.Button size="large" fluid color='blue'>Submit</Form.Button>
                    </Form>
                </Segment>
            </Segment>

        </Container>
    );
}

export default CreateApplication;