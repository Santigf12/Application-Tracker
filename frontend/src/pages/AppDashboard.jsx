import { DateTime } from 'luxon';
import { useCallback, useEffect, useMemo, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Link, useNavigate, useParams } from "react-router-dom";
import { toast } from 'react-toastify';
import { Button, Container, Form, Grid, Header, Icon, Popup, Rail, Segment, Step } from "semantic-ui-react";
import CoverModal from '../components/CoverModal';
import { deleteApplication, getApplicationById, getCoverLetter, updateApplication } from "../features/applications/applicationsSlice";

// Utility function to format and parse date
const formatDateTime = (date, time) => {
    return date && time ? DateTime.fromFormat(`${date} ${time}`, 'yyyy-MM-dd HH:mm').toFormat('yyyy-MM-dd HH:mm:ss') : null;
};

const AppDashboard = () => {
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const { id } = useParams();
    const { application, isLoading } = useSelector((state) => state.applications);

    const [formData, setFormData] = useState({
        title: "",
        company: "",
        url: "",
        location: "",
        length: "",
        posting: "",
        status: "Bookmarked",  // Default to Bookmarked
        coverletter: ""
    });

    const [editMode, setEditMode] = useState(false);
    const [modalOpen, setModalOpen] = useState(false);
    const [dateAdded, setDateAdded] = useState("");
    const [timeAdded, setTimeAdded] = useState("");
    const [dateApplied, setDateApplied] = useState("");
    const [timeApplied, setTimeApplied] = useState("");

    useEffect(() => {
        dispatch(getApplicationById(id));
        dispatch(getCoverLetter(id));
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
                status: application.status || "Bookmarked",
                coverletter: application.coverletter || ""
            });

            if (application?.added) {
                const addedDate = DateTime.fromFormat(application.added, 'yyyy-MM-dd HH:mm:ss');
                setDateAdded(addedDate.toFormat('yyyy-MM-dd'));
                setTimeAdded(addedDate.toFormat('HH:mm'));
            }
    
            if (application?.applied) {
                const appliedDate = DateTime.fromFormat(application.applied, 'yyyy-MM-dd HH:mm:ss');
                setDateApplied(appliedDate.toFormat('yyyy-MM-dd'));
                setTimeApplied(appliedDate.toFormat('HH:mm'));
            }
        }
    }, [application]);

    const handleInputChange = useCallback((e) => {
        const { name, value } = e.target;
        setFormData((prevData) => ({
            ...prevData,
            [name]: value
        }));
    }, []);

    const handleDateChange = useCallback((e, { name, value }) => {
        if (name === 'dateadded') {
            setDateAdded(value);
        } else if (name === 'dateapplied') {
            setDateApplied(value);
        }
    }, []);

    const handleTimeChange = useCallback((e, { name, value }) => {
        if (name === 'timeadded') {
            setTimeAdded(value);
        } else if (name === 'timeapplied') {
            setTimeApplied(value);
        }
    }, []);

    const handleFormSubmit = useCallback(async () => {
        try {
            const added = formatDateTime(dateAdded, timeAdded);
            const applied = formatDateTime(dateApplied, timeApplied);
            const updatedFormData = { ...formData, added, applied };

            await dispatch(updateApplication({ id, application: updatedFormData })).unwrap();
            setEditMode(false);
            toast.success("Application updated successfully.");
        } catch (error) {
            toast.error("An error occurred. Please try again.");
        }
    }, [dateAdded, timeAdded, dateApplied, timeApplied, formData, id, dispatch]);

    const handleDelete = useCallback(async () => {
        try {
            await dispatch(deleteApplication(id)).unwrap();
            navigate("/");
            toast.success("Application deleted successfully.");
        } catch (error) {
            toast.error("An error occurred. Please try again.");
        }
    }, [id, dispatch, navigate]);

    const statusToStepMap = useMemo(() => ({
        Bookmarked: 0,
        Applied: 1,
        Assessment: 2,
        Interview: 3,
        Offer: 4,
    }), []);

    const handleStepClick = (status) => {
        if (editMode) {
            setFormData(prevData => ({ ...prevData, status }));
    
            if (status === "Applied") {
                const appliedDate = DateTime.local();
                setDateApplied(appliedDate.toFormat('yyyy-MM-dd'));
                setTimeApplied(appliedDate.toFormat('HH:mm'));
            }
        }
    };
    

    const stepOptions = ["Bookmarked", "Applied", "Assessment", "Interview", "Offer"];
    const currentStepIndex = useMemo(() => statusToStepMap[formData.status] || 0, [formData.status, statusToStepMap]);

    return (
        <Container style={{minWidth: '70%' }}>
            <Segment basic>
                <Header textAlign="center" as='h1'>
                    Application Dashboard
                    <Header.Subheader>
                        <Link to="/"><Icon name="arrow left" />Back to Applications</Link>
                    </Header.Subheader>
                </Header>
                <Segment>
                    <Grid columns={3}>
                        <Grid.Row>
                            <Grid.Column>
                                <Button.Group fluid>
                                    <Button color='blue' onClick={() => setEditMode(!editMode)}>
                                        {editMode ? 'Cancel' : 'Edit'}
                                    </Button>
                                    {editMode && <Button color='orange' onClick={handleFormSubmit}>Save</Button>}
                                </Button.Group>
                            </Grid.Column>
                            <Grid.Column>
                                {formData.coverletter ? (
                                    <Button fluid color='green' onClick={() => setModalOpen(true)}>View Cover Letter</Button>
                                ) : (
                                    <Button fluid color='orange' onClick={() => setModalOpen(true)}>Add Cover Letter</Button>
                                )}
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
                                onClick={() => handleStepClick(status)}
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
                    <Form size="large" loading={isLoading} onSubmit={handleFormSubmit}>
                        <Form.Group widths='equal'>
                            <Form.Input
                                fluid
                                label='Date Added'
                                name="dateadded"
                                value={dateAdded}
                                onChange={handleDateChange}
                                readOnly={!editMode}
                            />
                            <Form.Input
                                fluid
                                label='Time Added'
                                name="timeadded"
                                value={timeAdded}
                                onChange={handleTimeChange}
                                readOnly={!editMode}
                            />
                            <Form.Input
                                fluid
                                label='Date Applied'
                                name="dateapplied"
                                value={dateApplied}
                                onChange={handleDateChange}
                                readOnly={!editMode}
                            />
                            <Form.Input
                                fluid
                                label='Time Applied'
                                name="timeapplied"
                                value={timeApplied}
                                onChange={handleTimeChange}
                                readOnly={!editMode}
                            />
                        </Form.Group>
                        {/* Other Form Inputs */}
                    </Form>
                </Segment>
                <Segment>
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
                                title='Click to open the posting URL'
                                label='Posting URL'
                                placeholder='Posting URL'
                                name="url"
                                value={formData.url}
                                onChange={handleInputChange}
                                readOnly={!editMode}
                                onClick={() => {
                                    if (!editMode && formData.url) {
                                        window.open(formData.url, "_blank");
                                    }
                                }}
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
                />
            </Segment>
        </Container>
    );
};

export default AppDashboard;