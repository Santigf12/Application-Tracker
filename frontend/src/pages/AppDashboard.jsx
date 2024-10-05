import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Link, useNavigate, useParams } from "react-router-dom";
import { toast } from 'react-toastify';
import { Button, Container, Form, Grid, Header, Icon, Popup, Segment, Step } from "semantic-ui-react";
import CoverModal from '../components/CoverModal';
import { deleteApplication, getApplicationById, getCoverLetter, updateApplication } from "../features/applications/applicationsSlice";

const AppDashboard = () => {
    const dispatch = useDispatch();
    const navigate = useNavigate();

    const { id } = useParams();
    const { application, isLoading, isSuccess, isError } = useSelector((state) => state.applications);

    const [editMode, setEditMode] = useState(false);
    const [modalOpen, setModalOpen] = useState(false);
    const [formData, setFormData] = useState({
        title: "",
        company: "",
        url: "",
        location: "",
        length: "",
        posting: "",
        status: "",
        coverletter: ""
    });

    // Load the application data and set the initial form data
    useEffect(() => {
        dispatch(getApplicationById(id));
    }, [dispatch, id]);

    useEffect(() => {
        dispatch(getCoverLetter(id))
    }, [dispatch, id]);

    useEffect(() => {
        if (application) {
            setFormData({
                title: application.title || "",
                company: application.company || "",
                url: application.url || "",
                location: application.location || "",
                length: application.length || "",
                posting: application.posting || "",
                status: application.status || "Bookmarked",  // Default status to "Bookmarked"
                coverletter: application.coverletter || ""
            });
        }
    }, [application]);

    // Handle form input changes
    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData((prevData) => ({
            ...prevData,
            [name]: value,
        }));
    };

    // Handle step change in edit mode
    const handleStepChange = (status) => {
        if (editMode) {
            setFormData((prevData) => ({
                ...prevData,
                status: status,
            }));
        }
    };

    // Handle form submission
    const handleFormSubmit = async () => {
        try {
            await dispatch(updateApplication({ id, application: formData })).unwrap();
            setEditMode(false); // Disable edit mode after updating
            await dispatch(getApplicationById(id)).unwrap(); // Reload the application data
            toast.success("Application updated successfully.");
        } catch (error) {
            toast.error("An error occurred. Please try again.");
        }
    };

    const handleDelete = async () => {
        try {
            await dispatch(deleteApplication(id)).unwrap();
            navigate("/");
            toast.success("Application deleted successfully.");
        } catch (error) {
            toast.error("An error occurred. Please try again.");
        }
    }

    // Step mapping based on application status
    const statusToStepMap = {
        Bookmarked: 0,
        Applied: 1,
        Assessment: 2,
        Interview: 3,
        Offer: 4,
    };

    const stepOptions = ["Bookmarked", "Applied", "Assessment", "Interview", "Offer"];

    const currentStepIndex = statusToStepMap[formData.status] || 0;

    return (
        <Container style={{ marginTop: '1em', minWidth: '70%' }}>
            <Segment basic>
                <Header textAlign="center" as='h1'>Application Dashboard
                    <Header.Subheader><Link to="/"><Icon name="arrow left" />Back to Applications</Link></Header.Subheader>
                </Header>
                <Segment>
                    <Grid columns={3}>
                        <Grid.Row>
                            <Grid.Column >
                                <Button.Group fluid>
                                    <Button color='blue' onClick={() => setEditMode(!editMode)}> {editMode ? 'Cancel' : 'Edit'} </Button>
                                    {
                                        editMode && (
                                            <Button color='orange' onClick={handleFormSubmit}>Save</Button>
                                        )

                                    }
                                </Button.Group>
                            </Grid.Column >
                            <Grid.Column >
                                {
                                    formData.coverletter === 1 ? (
                                        <Button fluid color='green' onClick={() => setModalOpen(true)}>View Cover Letter</Button>
                                    ) : (
                                        <Button fluid color='orange' >Create Cover Letter</Button>
                                    )
                                }
                            </Grid.Column>
                            <Grid.Column>
                                <Popup
                                    trigger={<Button fluid color='red'>Delete</Button>}
                                    content={<Button content='Confirm Delete' onClick={handleDelete} />}
                                    on='click'
                                    position='top right'
                                />
                            </Grid.Column>
                        </Grid.Row>
                    </Grid>
                </Segment>
                <Segment>
                    <Step.Group fluid size="small">
                        {stepOptions.map((status, index) => (
                            <Step
                                key={status}
                                active={currentStepIndex === index}
                                onClick={() => handleStepChange(status)}
                                disabled={!editMode}
                            >
                                <Icon name={status === "Bookmarked" ? "bookmark" :
                                    status === "Applied" ? "paper plane" :
                                    status === "Assessment" ? "clipboard check" :
                                    status === "Interview" ? "user" : "trophy"} />
                                <Step.Content>
                                    <Step.Title>{status}</Step.Title>
                                </Step.Content>
                            </Step>
                        ))}
                    </Step.Group>
                </Segment>
                <Segment>
                    <Header as='h3'>Application Details</Header>
                    <Form size="large" loading={isLoading} onSubmit={handleFormSubmit}>
                        <Form.Group widths='equal'>
                            <Form.Input
                                fluid
                                label='Job Title'
                                placeholder='Job Title'
                                name="title"
                                required
                                value={formData.title}
                                onChange={handleInputChange}
                                readOnly={!editMode}
                            />
                            <Form.Input
                                fluid
                                label='Company'
                                placeholder='Company'
                                name="company"
                                required
                                value={formData.company}
                                onChange={handleInputChange}
                                readOnly={!editMode}
                            />
                        </Form.Group>
                        <Form.Group widths='equal'>
                            <Form.Input
                                fluid
                                label='Posting URL'
                                placeholder='Posting URL'
                                name="url"
                                value={formData.url}
                                onChange={handleInputChange}
                                readOnly={!editMode}
                            />
                        </Form.Group>
                        <Form.Group widths='equal'>
                            <Form.Input
                                fluid
                                label='Location'
                                placeholder='Location'
                                name="location"
                                required
                                value={formData.location}
                                onChange={handleInputChange}
                                readOnly={!editMode}
                            />
                            <Form.Input
                                fluid
                                label='Length'
                                placeholder='Length'
                                name="length"
                                required
                                value={formData.length}
                                onChange={handleInputChange}
                                readOnly={!editMode}
                            />
                        </Form.Group>
                        <Form.Group widths='equal'>
                            <Form.TextArea
                                label='Job description'
                                placeholder='Add a description of the job'
                                name="posting"
                                required
                                value={formData.posting}
                                onChange={handleInputChange}
                                readOnly={!editMode}
                                style={{ minHeight: 400 }}
                            />
                        </Form.Group>
                    </Form>
                </Segment>
                <CoverModal
                open={modalOpen}
                onClose={() => setModalOpen(false)}
                company={formData.company}
                posting={formData.posting}
                / >
            </Segment>
        </Container>
    );
}

export default AppDashboard;
