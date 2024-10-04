import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useParams } from "react-router-dom";
import { Button, Container, Form, Grid, Header, Search, Segment } from "semantic-ui-react";
import { getApplicationById } from "../features/applications/applicationsSlice";

const AppDashboard = () => {
    const dispatch = useDispatch();
    
    const { id } = useParams();
    const { application, isLoading } = useSelector((state) => state.applications);

    useEffect(() => {
        dispatch(getApplicationById(id));
    }, [dispatch, id]);


    return (
        <Container style={{ marginTop: '1em', minWidth: '70%' }}>
            <Segment basic>
                <Header textAlign="center" as='h1'>Application Dashboard</Header>
                <Segment>
                    <Grid columns={3}>
                        <Grid.Row>
                            <Grid.Column >
                                <Button fluid color='blue'>Edit</Button>
                            </Grid.Column >
                            <Grid.Column >
                                <Button fluid color='green'>Generate Cover Letter</Button>
                            </Grid.Column>
                            <Grid.Column>
                                <Button fluid color='red'>Delete</Button>
                            </Grid.Column>
                        </Grid.Row>
                    </Grid>
                </Segment>
                <Segment>
                    <Header as='h3'>Application Details</Header>
                    <Form size="large" loading={isLoading}>
                        <Form.Group widths='equal'>
                            <Form.Input 
                                fluid 
                                label='Job Title' 
                                placeholder='Job Title' 
                                required 
                                value={application.title}
                                readOnly
                            />
                            <Form.Input 
                                fluid 
                                label='Company' 
                                placeholder='Company' 
                                required 
                                value={application.company}
                                readOnly
                            />
                        </Form.Group>
                        <Form.Group widths='equal'>
                            <Form.Input 
                                fluid
                                label='Posting URL'
                                placeholder='Posting URL'
                                value={application.url}
                                readOnly
                            />
                        </Form.Group>
                        <Form.Group widths='equal'>
                            <Form.Input 
                                fluid 
                                label='Location' 
                                placeholder='Location' 
                                required 
                                value={application.location}
                                readOnly
                            />
                            <Form.Input 
                                fluid 
                                label='Length' 
                                placeholder='Length' 
                                required 
                                value={application.length}
                                readOnly
                            />
                        </Form.Group>
                        <Form.Group widths='equal'>
                            <Form.TextArea 
                                label='Job description' 
                                placeholder='Add a description of the job' 
                                required 
                                value={application.posting}
                                readOnly
                                style={{ minHeight: 400 }} 
                            />
                        </Form.Group>
                    </Form>
                </Segment>
                    

            </Segment>
        </Container>
    );
}

export default AppDashboard;